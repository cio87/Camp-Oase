import { assertPaymentEnabled, captureMatchesOrder, getSupabaseAdmin, paypalRequest, sendAdminOrderNotification, sendJson } from "./_paypal.js";
export default async function handler(request, response) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); return sendJson(response, 405, { error: "Method not allowed" }); }
  const paypalOrderId = String(request.body?.paypalOrderId || "").trim();
  if (!/^[A-Z0-9]+$/i.test(paypalOrderId) || paypalOrderId.length > 64) return sendJson(response, 400, { error: "Ungültige Zahlungsreferenz." });
  try {
    const supabase = getSupabaseAdmin(); await assertPaymentEnabled(supabase);
    const { data: order, error: lookupError } = await supabase.from("orders").select("id,total,payment_status").eq("payment_reference", paypalOrderId).eq("payment_provider", "paypal").maybeSingle();
    if (lookupError || !order) return sendJson(response, 404, { error: "Die Bestellung wurde nicht gefunden." });
    if (order.payment_status === "paid") { await sendAdminOrderNotification(supabase, order.id); return sendJson(response, 200, { ok: true, alreadyCaptured: true }); }
    let result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: "POST", headers: { "PayPal-Request-Id": paypalOrderId } });
    if (!result.response.ok && result.response.status === 422) result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, { method: "GET" });
    if (!result.response.ok || !captureMatchesOrder(result.body, Number(order.total).toFixed(2))) { console.error("PayPal capture did not match expected order", result.response.status, paypalOrderId); return sendJson(response, 400, { error: "Die Zahlung konnte nicht bestätigt werden. Bitte kontaktiere uns, falls PayPal bereits belastet wurde." }); }
    const { error: updateError } = await supabase.from("orders").update({ payment_status: "paid", order_status: "new" }).eq("id", order.id).neq("payment_status", "paid");
    if (updateError) { console.error("Could not mark captured PayPal order as paid", updateError); return sendJson(response, 500, { error: "Die Zahlung wurde bestätigt, aber die Bestellung konnte noch nicht abgeschlossen werden. Bitte kontaktiere uns." }); }
    const captureTime = result.body?.purchase_units?.[0]?.payments?.captures?.find((entry) => entry.status === "COMPLETED")?.create_time;
    await sendAdminOrderNotification(supabase, order.id, captureTime || new Date());
    return sendJson(response, 200, { ok: true });
  } catch (error) { console.error("PayPal capture failed", error); return sendJson(response, error?.status || 500, { error: error?.publicMessage || "Die Zahlung konnte nicht abgeschlossen werden." }); }
}
