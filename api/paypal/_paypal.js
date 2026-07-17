import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getInternalOrderReceiver, getSmtpTransport } from "../_mail.js";

const PAYPAL_SANDBOX_URL = "https://api-m.sandbox.paypal.com";
const MAX_ITEMS = 25;

function publicError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  error.publicMessage = message;
  return error;
}

export function sendJson(response, status, data) { response.status(status).json(data); }

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw publicError("Der Zahlungsdienst ist noch nicht vollständig eingerichtet.", 503);
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function assertPaymentEnabled(supabase) {
  const { data, error } = await supabase.from("site_settings").select("checkout_enabled,payment_enabled").eq("id", "main").maybeSingle();
  if (error || !data?.checkout_enabled || !data?.payment_enabled) throw publicError("Die Online-Zahlung ist derzeit nicht verfügbar.", 403);
}

export function toCents(value, label = "Preis") {
  if ((typeof value !== "string" && typeof value !== "number") || (typeof value === "number" && !Number.isFinite(value))) {
    throw publicError(`${label} ist ungültig.`);
  }

  let input = String(value).trim();
  if (input.endsWith("€")) input = input.slice(0, -1).trim();
  if (!input || input.includes("€")) throw publicError(`${label} ist ungültig.`);

  const german = input.match(/^([+-]?)(?:(\d{1,3}(?:\.\d{3})+)|(\d+))(?:,(\d{1,2}))?$/);
  const english = input.match(/^([+-]?)(\d+)(?:\.(\d{1,2}))?$/);
  const match = german || english;
  if (!match) throw publicError(`${label} ist ungültig.`);

  const sign = match[1] === "-" ? -1 : 1;
  const euros = german ? (match[2] || match[3]).replaceAll(".", "") : match[2];
  const cents = german ? (match[4] || "") : (match[3] || "");
  const amount = Number(euros) * 100 + Number(cents.padEnd(2, "0") || 0);
  if (!Number.isSafeInteger(amount)) throw publicError(`${label} ist ungültig.`);
  return sign * amount;
}
function money(cents) { return (cents / 100).toFixed(2); }
function discountPercent(value) { const percent = Number(value || 0); return Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0; }
function cleanText(value, maxLength = 500) { return String(value || "").trim().slice(0, maxLength); }

function cleanAddress(address) {
  const value = address && typeof address === "object" ? address : {};
  const cleaned = { street: cleanText(value.street, 160), postal_code: cleanText(value.postal_code, 24), city: cleanText(value.city, 120), country: cleanText(value.country || "Deutschland", 80) };
  if (Object.values(cleaned).some((field) => !field)) throw publicError("Bitte vervollständige deine Rechnungs- und Lieferadresse.");
  return cleaned;
}

export function validateCustomer(customer) {
  const value = customer && typeof customer === "object" ? customer : {};
  const firstName = cleanText(value.first_name, 100);
  const lastName = cleanText(value.last_name, 100);
  const email = cleanText(value.email, 254).toLowerCase();
  const phone = cleanText(value.phone, 60);
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) throw publicError("Bitte gib vollständige und gültige Kontaktdaten ein.");
  if (!value.accepted_terms || !value.accepted_withdrawal) throw publicError("Bitte bestätige die rechtlichen Hinweise.");
  return { name: `${firstName} ${lastName}`, email, phone, billingAddress: cleanAddress(value.billing_address), shippingAddress: cleanAddress(value.shipping_address) };
}

function getProductExtras(product) {
  if (!product?.extras_enabled || !Array.isArray(product.custom_extras)) return [];
  return product.custom_extras.filter((extra) => cleanText(extra?.name, 160)).map((extra) => {
    const originalCents = toCents(extra.price, "Der Preis eines Extras");
    const percent = extra.discount_enabled ? discountPercent(extra.discount_percent) : 0;
    return { name: cleanText(extra.name, 160), description: cleanText(extra.description, 1000), cents: Math.max(0, Math.round(originalCents * (1 - percent / 100))) };
  });
}

function getProductVariant(product, selectedVariant) {
  if (!selectedVariant) return null;
  const id = cleanText(selectedVariant.id, 200);
  const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
  const variant = variants.find((candidate) => String(candidate?.id || "") === id);
  if (!variant || variant.enabled === false || !cleanText(variant.name, 160)) throw publicError("Eine ausgewählte Produktvariante ist nicht mehr verfügbar.");
  return { id, name: cleanText(variant.name, 160), description: cleanText(variant.description, 1000), cents: toCents(variant.price_adjustment, "Der Preisaufschlag einer Variante") };
}

export async function priceCartFromProducts(supabase, rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > MAX_ITEMS) throw publicError("Der Warenkorb ist leer oder ungültig.");
  const rawIds = rawItems.map((item) => String(item?.productId || ""));
  const productIds = [...new Set(rawIds.filter(Boolean))];
  if (!productIds.length || rawIds.some((id) => !id)) throw publicError("Der Warenkorb enthält ungültige Produkte.");
  const { data: products, error } = await supabase.from("products").select("*").in("id", productIds);
  if (error || !products || products.length !== productIds.length) throw publicError("Mindestens ein Produkt ist nicht mehr verfügbar.");
  const byId = new Map(products.map((product) => [String(product.id), product]));
  let subtotalCents = 0;
  const items = rawItems.map((rawItem) => {
    const product = byId.get(String(rawItem?.productId || ""));
    const quantity = Number(rawItem?.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw publicError("Der Warenkorb enthält eine ungültige Menge.");
    const availability = String(product.availability_status || "available");
    const stock = Math.max(0, Math.floor(Number(product.stock_quantity || 0)));
    if (availability !== "available" && availability !== "preorder") throw publicError("Mindestens ein Produkt ist nicht mehr bestellbar.");
    if (availability !== "preorder" && quantity > stock) throw publicError("Mindestens ein Produkt ist nicht mehr in ausreichender Menge verfügbar.");
    const variant = getProductVariant(product, rawItem.selectedVariant);
    const baseCents = Math.max(0, Math.round(toCents(product.price, "Der Grundpreis") * (1 - (product.discount_enabled ? discountPercent(product.discount_percent) : 0) / 100)));
    const selectedExtras = Array.isArray(rawItem.selectedExtras) ? rawItem.selectedExtras : [];
    const availableExtras = getProductExtras(product);
    const extras = selectedExtras.map((selected) => {
      const extra = availableExtras.find((candidate) => candidate.name === cleanText(selected?.name, 160));
      if (!extra) throw publicError("Ein ausgewähltes Extra ist nicht mehr verfügbar.");
      return { name: extra.name, description: extra.description, cents: extra.cents, note: cleanText(selected?.note, 1000) };
    });
    if (new Set(extras.map((extra) => extra.name)).size !== extras.length) throw publicError("Ein Extra wurde mehrfach ausgewählt.");
    const unitCents = baseCents + (variant?.cents || 0) + extras.reduce((sum, extra) => sum + extra.cents, 0);
    if (unitCents < 0) throw publicError("Ein Produktpreis ist ungültig.");
    const lineCents = unitCents * quantity; subtotalCents += lineCents;
    return { product_id: String(product.id), title: cleanText(product.title, 240), quantity, availability_status: availability, base_price: money(baseCents), variant: variant ? { id: variant.id, name: variant.name, description: variant.description, price_adjustment: money(variant.cents) } : null, extras: extras.map(({ cents, ...extra }) => ({ ...extra, price: money(cents) })), unit_price: money(unitCents), line_total: money(lineCents) };
  });
  if (subtotalCents <= 0) throw publicError("Der Gesamtbetrag muss größer als 0 € sein.");
  return { items, subtotal: money(subtotalCents), shippingCost: "0.00", total: money(subtotalCents) };
}

function paypalBaseUrl() { if (process.env.PAYPAL_ENV !== "sandbox") throw publicError("Der Zahlungsdienst ist noch nicht für die Sandbox konfiguriert.", 503); return PAYPAL_SANDBOX_URL; }
async function paypalAccessToken() {
  const clientId = process.env.VITE_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw publicError("Der Zahlungsdienst ist noch nicht vollständig eingerichtet.", 503);
  const token = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!token.ok) throw publicError("Der Zahlungsdienst ist derzeit nicht erreichbar.", 503);
  const data = await token.json();
  if (!data?.access_token) throw publicError("Der Zahlungsdienst ist derzeit nicht erreichbar.", 503);
  return data.access_token;
}
export async function paypalRequest(path, options = {}) {
  const response = await fetch(`${paypalBaseUrl()}${path}`, { ...options, headers: { Authorization: `Bearer ${await paypalAccessToken()}`, "Content-Type": "application/json", Prefer: "return=representation", ...(options.headers || {}) } });
  return { response, body: await response.json().catch(() => ({})) };
}
export async function createPayPalOrder(total) {
  const { response, body } = await paypalRequest("/v2/checkout/orders", { method: "POST", headers: { "PayPal-Request-Id": randomUUID() }, body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "EUR", value: total } }] }) });
  if (!response.ok || !body?.id) throw publicError("Die PayPal-Zahlung konnte nicht vorbereitet werden.", 502);
  return body.id;
}
export function captureMatchesOrder(capture, expectedTotal) {
  const unit = capture?.purchase_units?.[0]; const completed = unit?.payments?.captures?.find((entry) => entry.status === "COMPLETED");
  return capture?.status === "COMPLETED" && unit?.amount?.currency_code === "EUR" && unit?.amount?.value === expectedTotal && completed?.amount?.currency_code === "EUR" && completed?.amount?.value === expectedTotal;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatEuro(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount) : "–";
}

function formatAddress(address) {
  if (!address || typeof address !== "object") return "Nicht hinterlegt";
  return [address.street, [address.postal_code, address.city].filter(Boolean).join(" "), address.country].filter(Boolean).join(", ") || "Nicht hinterlegt";
}

function itemDetails(item) {
  return [item.variant?.name ? `Variante: ${item.variant.name}${Number(item.variant?.price_adjustment) ? ` (${formatEuro(item.variant.price_adjustment)})` : ""}` : "", ...(Array.isArray(item.extras) ? item.extras.map((extra) => `Extra: ${extra.name || "Extra"} (${formatEuro(extra.price)})`) : [])].filter(Boolean);
}

function orderItemsText(items) {
  if (!Array.isArray(items) || !items.length) return "Keine Positionen hinterlegt.";
  return items.map((item) => [`${item.quantity || 1} × ${item.title || "Produkt"}`, `Einzelpreis: ${formatEuro(item.unit_price)}`, `Positionssumme: ${formatEuro(item.line_total)}`, ...itemDetails(item)].join("\n")).join("\n\n");
}

function orderItemsHtml(items) {
  if (!Array.isArray(items) || !items.length) return "<p>Keine Positionen hinterlegt.</p>";
  return items.map((item) => {
    const details = itemDetails(item).map(escapeHtml).join("<br>");
    return `<tr><td style="padding:12px;border-bottom:1px solid #e7e2d8"><strong>${escapeHtml(item.title || "Produkt")}</strong>${details ? `<br><span style="color:#667;font-size:13px">${details}</span>` : ""}</td><td style="padding:12px;border-bottom:1px solid #e7e2d8;text-align:right">${escapeHtml(item.quantity || 1)}</td><td style="padding:12px;border-bottom:1px solid #e7e2d8;text-align:right">${escapeHtml(formatEuro(item.unit_price))}</td><td style="padding:12px;border-bottom:1px solid #e7e2d8;text-align:right">${escapeHtml(formatEuro(item.line_total))}</td></tr>`;
  }).join("");
}

export async function sendAdminOrderNotification(supabase, orderId, paidAt = new Date()) {
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (orderError || !order || order.payment_status !== "paid" || order.admin_notification_sent_at) return;

  const claimTime = new Date().toISOString();
  const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: claimed, error: claimError } = await supabase.from("orders").update({ admin_notification_sending_at: claimTime }).eq("id", order.id).is("admin_notification_sent_at", null).or(`admin_notification_sending_at.is.null,admin_notification_sending_at.lt.${staleBefore}`).select("*").maybeSingle();
  if (claimError) { console.error("Could not reserve admin order notification", claimError); return; }
  if (!claimed) return;

  try {
    const smtp = getSmtpTransport();
    const paymentTime = new Date(paidAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
    const subject = `Neue bezahlte Bestellung bei Camp Oase – ${formatEuro(claimed.total)}`;
    const text = ["Zahlung erfolgreich", "", `Kunde: ${claimed.customer_name || "–"}`, `E-Mail: ${claimed.customer_email || "–"}`, `Rechnungsadresse: ${formatAddress(claimed.billing_address)}`, `Lieferadresse: ${formatAddress(claimed.shipping_address)}`, "", "Bestellte Artikel:", orderItemsText(claimed.items), "", `Gesamtbetrag: ${formatEuro(claimed.total)}`, "Zahlungsart: PayPal", `PayPal-Referenz: ${claimed.payment_reference || "–"}`, `Interne Order-ID: ${claimed.id}`, `Bestellnummer: ${claimed.order_number || "Noch nicht vergeben"}`, `Zahlung bestätigt am: ${paymentTime}`, "", "Bitte die Bestellung im Adminbereich prüfen:", "https://www.camp-oase.de/admin"].join("\n");
    const html = `<!doctype html><html><body style="margin:0;background:#f7f1e8;color:#25332a;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:14px;overflow:hidden"><div style="padding:22px 24px;background:#435749;color:#fff"><h1 style="margin:0;font-size:22px">Zahlung erfolgreich</h1><p style="margin:7px 0 0">Neue bezahlte Bestellung bei Camp Oase</p></div><div style="padding:24px"><p><strong>${escapeHtml(claimed.customer_name || "–")}</strong><br>${escapeHtml(claimed.customer_email || "–")}</p><p><strong>Rechnungsadresse</strong><br>${escapeHtml(formatAddress(claimed.billing_address))}</p><p><strong>Lieferadresse</strong><br>${escapeHtml(formatAddress(claimed.shipping_address))}</p><table role="presentation" style="width:100%;border-collapse:collapse"><thead><tr style="background:#eef3ea;color:#435749"><th style="padding:10px;text-align:left">Position</th><th style="padding:10px;text-align:right">Menge</th><th style="padding:10px;text-align:right">Einzelpreis</th><th style="padding:10px;text-align:right">Summe</th></tr></thead><tbody>${orderItemsHtml(claimed.items)}</tbody></table><p style="text-align:right;font-size:18px"><strong>Gesamtbetrag: ${escapeHtml(formatEuro(claimed.total))}</strong></p><p>Zahlungsart: PayPal<br>PayPal-Referenz: ${escapeHtml(claimed.payment_reference || "–")}<br>Interne Order-ID: ${escapeHtml(claimed.id)}<br>Bestellnummer: ${escapeHtml(claimed.order_number || "Noch nicht vergeben")}<br>Zahlung bestätigt am: ${escapeHtml(paymentTime)}</p><p style="margin:24px 0 0"><a href="https://www.camp-oase.de/admin" style="display:inline-block;background:#435749;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none">Bestellung im Adminbereich prüfen</a></p></div></div></div></body></html>`;
    await smtp.transporter.sendMail({ from: smtp.from, to: getInternalOrderReceiver(), replyTo: claimed.customer_email || undefined, subject, text, html });
    const { error: sentError } = await supabase.from("orders").update({ admin_notification_sent_at: new Date().toISOString(), admin_notification_sending_at: null }).eq("id", claimed.id).eq("admin_notification_sending_at", claimed.admin_notification_sending_at);
    if (sentError) console.error("Could not record sent admin order notification", sentError);
  } catch (error) {
    console.error("Could not send admin order notification", error);
    const { error: releaseError } = await supabase.from("orders").update({ admin_notification_sending_at: null }).eq("id", claimed.id).eq("admin_notification_sending_at", claimed.admin_notification_sending_at);
    if (releaseError) console.error("Could not release admin order notification", releaseError);
  }
}

export async function getCustomerOrderSummary(supabase, orderId) {
  const { data, error } = await supabase.from("orders").select("id,customer_name,customer_email,shipping_address,items,subtotal,shipping_cost,total,payment_status,payment_provider,order_number,created_at").eq("id", orderId).maybeSingle();
  if (error || !data || data.payment_status !== "paid") return null;
  return {
    reference: data.order_number || "Deine Bestellung bei Camp Oase",
    orderNumber: data.order_number || "",
    customerName: data.customer_name || "",
    customerEmail: data.customer_email || "",
    shippingAddress: data.shipping_address || null,
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: data.subtotal,
    shippingCost: data.shipping_cost,
    total: data.total,
    paymentProvider: data.payment_provider === "paypal" ? "PayPal" : "PayPal",
    createdAt: data.created_at,
  };
}

export async function sendCustomerOrderConfirmation(supabase, orderId, paidAt = new Date()) {
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (orderError || !order || order.payment_status !== "paid" || !order.customer_email) return false;
  if (order.customer_confirmation_sent_at) return true;

  const claimTime = new Date().toISOString();
  const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: claimed, error: claimError } = await supabase.from("orders").update({ customer_confirmation_sending_at: claimTime }).eq("id", order.id).is("customer_confirmation_sent_at", null).or(`customer_confirmation_sending_at.is.null,customer_confirmation_sending_at.lt.${staleBefore}`).select("*").maybeSingle();
  if (claimError) { console.error("Could not reserve customer order confirmation", claimError); return false; }
  if (!claimed) return false;

  try {
    const smtp = getSmtpTransport();
    const orderTime = new Date(paidAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
    const orderReference = claimed.order_number || "Deine Bestellung bei Camp Oase";
    const greetingName = String(claimed.customer_name || "").trim() || "liebe Kundin, lieber Kunde";
    const text = [`Hallo ${greetingName},`, "", "vielen Dank für deine Bestellung bei Camp Oase.", "Deine Zahlung war erfolgreich und deine Bestellung ist bei uns eingegangen.", "", `Bestellung: ${orderReference}`, `Bestelldatum: ${orderTime}`, "", "Artikel:", orderItemsText(claimed.items), "", `Gesamtbetrag: ${formatEuro(claimed.total)}`, `Rechnungsadresse: ${formatAddress(claimed.billing_address)}`, `Lieferadresse: ${formatAddress(claimed.shipping_address)}`, "Zahlungsart: PayPal", "", "Wir prüfen und bearbeiten deine Bestellung nun. Sobald es zum Versand Neuigkeiten gibt, melden wir uns bei dir.", "Bei Fragen erreichst du uns unter service@camp-oase.de.", "", "Herzliche Grüße", "Brian von Camp Oase"].join("\n");
    const html = `<!doctype html><html><body style="margin:0;background:#f7f1e8;color:#25332a;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:14px;overflow:hidden"><div style="padding:22px 24px;background:#435749;color:#fff"><h1 style="margin:0;font-size:22px">Deine Bestellung bei Camp Oase</h1><p style="margin:7px 0 0">Zahlung erfolgreich · Bestellung eingegangen</p></div><div style="padding:24px"><p>Hallo ${escapeHtml(greetingName)},</p><p>vielen Dank für deine Bestellung bei Camp Oase. Deine Zahlung war erfolgreich und deine Bestellung ist bei uns eingegangen.</p><p><strong>Bestellung:</strong> ${escapeHtml(orderReference)}<br><strong>Bestelldatum:</strong> ${escapeHtml(orderTime)}</p><table role="presentation" style="width:100%;border-collapse:collapse"><thead><tr style="background:#eef3ea;color:#435749"><th style="padding:10px;text-align:left">Position</th><th style="padding:10px;text-align:right">Menge</th><th style="padding:10px;text-align:right">Einzelpreis</th><th style="padding:10px;text-align:right">Summe</th></tr></thead><tbody>${orderItemsHtml(claimed.items)}</tbody></table><p style="text-align:right;font-size:18px"><strong>Gesamtbetrag: ${escapeHtml(formatEuro(claimed.total))}</strong></p><p><strong>Rechnungsadresse</strong><br>${escapeHtml(formatAddress(claimed.billing_address))}</p><p><strong>Lieferadresse</strong><br>${escapeHtml(formatAddress(claimed.shipping_address))}</p><p>Zahlungsart: PayPal</p><p>Wir prüfen und bearbeiten deine Bestellung nun. Sobald es zum Versand Neuigkeiten gibt, melden wir uns bei dir.</p><p>Bei Fragen erreichst du uns unter <a href="mailto:service@camp-oase.de" style="color:#435749">service@camp-oase.de</a>.</p><p>Herzliche Grüße<br>Brian von Camp Oase</p></div></div></div></body></html>`;
    await smtp.transporter.sendMail({ from: smtp.from, to: claimed.customer_email, subject: "Deine Bestellung bei Camp Oase", text, html });
    const { error: sentError } = await supabase.from("orders").update({ customer_confirmation_sent_at: new Date().toISOString(), customer_confirmation_sending_at: null }).eq("id", claimed.id).eq("customer_confirmation_sending_at", claimed.customer_confirmation_sending_at);
    if (sentError) console.error("Could not record sent customer order confirmation", sentError);
    return true;
  } catch (error) {
    console.error("Could not send customer order confirmation", error);
    const { error: releaseError } = await supabase.from("orders").update({ customer_confirmation_sending_at: null }).eq("id", claimed.id).eq("customer_confirmation_sending_at", claimed.customer_confirmation_sending_at);
    if (releaseError) console.error("Could not release customer order confirmation", releaseError);
    return false;
  }
}
