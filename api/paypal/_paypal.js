import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

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
    return { product_id: String(product.id), title: cleanText(product.title, 240), quantity, availability_status: availability, variant: variant ? { id: variant.id, name: variant.name, description: variant.description, price_adjustment: money(variant.cents) } : null, extras: extras.map(({ cents, ...extra }) => ({ ...extra, price: money(cents) })), unit_price: money(unitCents), line_total: money(lineCents) };
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
