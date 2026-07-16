import { assertPaymentEnabled, createPayPalOrder, getSupabaseAdmin, priceCartFromProducts, sendJson, validateCustomer } from "./_paypal.js";
export default async function handler(request, response) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); return sendJson(response, 405, { error: "Method not allowed" }); }
  try {
    const supabase = getSupabaseAdmin(); await assertPaymentEnabled(supabase);
    const customer = validateCustomer(request.body?.customer); const cart = await priceCartFromProducts(supabase, request.body?.items); const paypalOrderId = await createPayPalOrder(cart.total);
    const { data, error } = await supabase.from("orders").insert({ customer_name: customer.name, customer_email: customer.email, customer_phone: customer.phone, billing_address: customer.billingAddress, shipping_address: customer.shippingAddress, items: cart.items, subtotal: cart.subtotal, shipping_cost: cart.shippingCost, total: cart.total, payment_status: "pending", order_status: "pending", payment_provider: "paypal", payment_reference: paypalOrderId }).select("id").single();
    if (error || !data?.id) { console.error("Could not persist pending PayPal order", error); return sendJson(response, 500, { error: "Die Bestellung konnte nicht gespeichert werden. Bitte versuche es erneut." }); }
    return sendJson(response, 200, { id: paypalOrderId });
  } catch (error) { console.error("PayPal create order failed", error); return sendJson(response, error?.status || 500, { error: error?.publicMessage || "Die Zahlung konnte nicht vorbereitet werden." }); }
}
