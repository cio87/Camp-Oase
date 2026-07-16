import { useMemo, useState } from "react";
import {
  emptyBoxStyle,
  inquiryActionRowStyle,
  inquiryCardStyle,
  inquiryHeaderStyle,
  inquiryInfoBoxStyle,
  inquiryInfoGridStyle,
  inquiryInfoLabelStyle,
  inquiryListStyle,
  inquiryMetaStyle,
  inquiryTitleStyle,
  statusBadgeStyle,
  statusFilterActiveStyle,
  statusFilterButtonStyle,
  statusFilterRowStyle,
} from "../styles";

const filters = [
  ["all", "Alle"],
  ["new", "Neu"],
  ["paid", "Bezahlt"],
  ["processing", "In Bearbeitung"],
  ["shipped", "Versendet"],
  ["completed", "Abgeschlossen"],
  ["cancelled", "Storniert"],
  ["payment-pending", "Zahlung offen"],
];

const paymentLabels = {
  pending: "Zahlung offen",
  paid: "Bezahlt",
  refunded: "Erstattet",
  failed: "Fehlgeschlagen",
};

const orderLabels = {
  pending: "Offen",
  new: "Neu",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const orderStatusOptions = ["new", "processing", "shipped", "completed", "cancelled"];

const warningBadgeStyle = { ...statusBadgeStyle, background: "#F6D8BE" };
const paidBadgeStyle = { ...statusBadgeStyle, background: "#D8E0D2" };
const failedBadgeStyle = { ...statusBadgeStyle, background: "#f8e5e2", color: "#8a3d3d" };
const referenceStyle = { margin: "4px 0 0", overflowWrap: "anywhere", color: "#667", fontSize: "13px" };
const productsStyle = { marginTop: "16px", display: "grid", gap: "10px" };
const productStyle = { background: "#F7F1E8", border: "1px solid #eee7da", borderRadius: "14px", padding: "12px" };
const productHeaderStyle = { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", color: "#2F3A34" };
const totalsStyle = { marginTop: "16px", marginLeft: "auto", maxWidth: "320px", display: "grid", gap: "6px", color: "#2F3A34" };
const totalRowStyle = { display: "flex", justifyContent: "space-between", gap: "16px" };
const selectStyle = { border: "1px solid #D8E0D2", borderRadius: "10px", padding: "8px 10px", background: "white", color: "#2F3A34", font: "inherit" };

function formatMoney(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "–";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
    : "–";
}

function getBasePrice(item) {
  const storedBasePrice = Number(item.base_price);
  if (item.base_price !== null && item.base_price !== undefined && String(item.base_price).trim() !== "" && Number.isFinite(storedBasePrice)) return storedBasePrice;

  const unitPrice = Number(item.unit_price);
  if (!Number.isFinite(unitPrice)) return null;
  const variantPrice = Number(item.variant?.price_adjustment);
  const extrasPrice = Array.isArray(item.extras)
    ? item.extras.reduce((sum, extra) => sum + (Number.isFinite(Number(extra.price)) ? Number(extra.price) : 0), 0)
    : 0;
  return unitPrice - (Number.isFinite(variantPrice) ? variantPrice : 0) - extrasPrice;
}

function formatAdjustment(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `${amount > 0 ? "+" : ""}${formatMoney(amount)}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unbekanntes Datum" : date.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

function addressLines(address) {
  if (!address || typeof address !== "object") return ["Keine Adresse hinterlegt"];
  return [address.street, [address.postal_code, address.city].filter(Boolean).join(" "), address.country].filter(Boolean);
}

function PaymentBadge({ status }) {
  const style = status === "paid" ? paidBadgeStyle : status === "failed" || status === "refunded" ? failedBadgeStyle : warningBadgeStyle;
  return <span style={style}>{paymentLabels[status] || status || "Unbekannt"}</span>;
}

function OrderBadge({ status }) {
  return <span style={status === "cancelled" ? failedBadgeStyle : statusBadgeStyle}>{orderLabels[status] || status || "Offen"}</span>;
}

function OrderProducts({ items }) {
  if (!Array.isArray(items) || items.length === 0) return <p style={inquiryMetaStyle}>Keine Produktpositionen hinterlegt.</p>;

  return <div style={productsStyle}>{items.map((item, index) => {
    const variantPrice = Number(item.variant?.price_adjustment);
    const showVariantPrice = Number.isFinite(variantPrice) && variantPrice !== 0;
    return <div key={`${item.product_id || item.title || "position"}-${index}`} style={productStyle}>
      <div style={productHeaderStyle}>
        <strong>{item.title || "Produkt"}</strong>
        <strong>Positionssumme: {formatMoney(item.line_total)}</strong>
      </div>
      <p style={inquiryMetaStyle}>Menge: {item.quantity || 1}</p>
      <p style={inquiryMetaStyle}>Grundpreis: {formatMoney(getBasePrice(item))}</p>
      {item.variant?.name && <p style={inquiryMetaStyle}>Variante: {item.variant.name}{showVariantPrice ? ` ${formatAdjustment(variantPrice)}` : ""}</p>}
      {Array.isArray(item.extras) && item.extras.map((extra, extraIndex) => (
        <p key={`${extra.name || "extra"}-${extraIndex}`} style={inquiryMetaStyle}>
          Extra: {extra.name || "Extra"} {formatAdjustment(extra.price)}{extra.note ? ` – ${extra.note}` : ""}
        </p>
      ))}
      <p style={inquiryMetaStyle}>Einzelpreis: {formatMoney(item.unit_price)}</p>
    </div>
  })}</div>;
}

export default function AdminOrders({ orders, loading, error, onRetry, onUpdateStatus }) {
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState("");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "paid") return order.payment_status === "paid";
    if (filter === "payment-pending") return order.payment_status === "pending";
    return order.order_status === filter && order.payment_status !== "pending";
  }), [filter, orders]);

  const activeOrders = filter === "all" ? filteredOrders.filter((order) => order.payment_status !== "pending") : filteredOrders;
  const pendingOrders = filter === "all" ? filteredOrders.filter((order) => order.payment_status === "pending") : [];

  async function changeStatus(order, nextStatus) {
    if (nextStatus === "cancelled" && order.order_status !== "cancelled" && !window.confirm("Bestellung wirklich stornieren? Es wird keine PayPal-Erstattung ausgelöst.")) return;
    setSavingId(order.id);
    await onUpdateStatus(order, nextStatus);
    setSavingId("");
  }

  function renderOrder(order) {
    const isPendingPayment = order.payment_status === "pending";
    return <article key={order.id} style={{ ...inquiryCardStyle, ...(isPendingPayment ? { border: "1px solid #F6D8BE", background: "#fffdf8" } : {}) }}>
      <div style={inquiryHeaderStyle}>
        <div>
          <h2 style={inquiryTitleStyle}>{order.customer_name || "Unbekannter Kunde"}</h2>
          <p style={inquiryMetaStyle}>{formatDate(order.created_at)}</p>
          {isPendingPayment && <p style={{ ...inquiryMetaStyle, color: "#8a5a2d", fontWeight: "bold" }}>Zahlung nicht abgeschlossen – diese Bestellung ist noch nicht bezahlt.</p>}
        </div>
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}><PaymentBadge status={order.payment_status} /><OrderBadge status={order.order_status} /></div>
      </div>

      <div style={inquiryInfoGridStyle}>
        <div style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Kunde</span>{order.customer_name || "–"}<br />{order.customer_email || "–"}{order.customer_phone && <><br />{order.customer_phone}</>}</div>
        <div style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Rechnungsadresse</span>{addressLines(order.billing_address).map((line, index) => <div key={index}>{line}</div>)}</div>
        <div style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Lieferadresse</span>{addressLines(order.shipping_address).map((line, index) => <div key={index}>{line}</div>)}</div>
      </div>

      <OrderProducts items={order.items} />

      <div style={totalsStyle}>
        <div style={totalRowStyle}><span>Zwischensumme</span><span>{formatMoney(order.subtotal)}</span></div>
        <div style={totalRowStyle}><span>Versandkosten</span><span>{formatMoney(order.shipping_cost)}</span></div>
        <div style={{ ...totalRowStyle, fontWeight: "bold", fontSize: "17px" }}><span>Gesamtbetrag</span><span>{formatMoney(order.total)}</span></div>
      </div>

      <div style={inquiryActionRowStyle}>
        <label style={{ display: "grid", gap: "5px", color: "#2F3A34", fontSize: "14px", fontWeight: "bold" }}>
          Bestellstatus
          <select value={order.order_status || "pending"} onChange={(event) => changeStatus(order, event.target.value)} disabled={savingId === order.id} style={selectStyle}>
            {order.order_status === "pending" && <option value="pending">Offen</option>}
            {orderStatusOptions.map((status) => <option key={status} value={status}>{orderLabels[status]}</option>)}
          </select>
        </label>
        <div style={{ flex: "1 1 260px" }}>
          <span style={inquiryInfoLabelStyle}>Zahlungsanbieter</span>{order.payment_provider || "–"}
          <p style={referenceStyle}>PayPal-Referenz: {order.payment_reference || "–"}</p>
          <p style={referenceStyle}>Interne ID: <button type="button" title="Interne Order-ID kopieren" onClick={() => navigator.clipboard?.writeText(String(order.id))} style={{ border: "none", background: "transparent", padding: 0, color: "inherit", textDecoration: "underline", cursor: "copy", overflowWrap: "anywhere" }}>{order.id}</button></p>
        </div>
      </div>
    </article>;
  }

  return <>
    <div style={statusFilterRowStyle}>{filters.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} style={{ ...statusFilterButtonStyle, ...(filter === value ? statusFilterActiveStyle : {}) }}>{label}</button>)}</div>
    {loading && <div style={emptyBoxStyle}>Bestellungen werden geladen …</div>}
    {!loading && error && <div style={emptyBoxStyle}> {error} <button type="button" onClick={onRetry} style={{ marginLeft: "10px" }}>Erneut laden</button></div>}
    {!loading && !error && filteredOrders.length === 0 && <div style={emptyBoxStyle}>Keine Bestellungen für diesen Filter.</div>}
    {!loading && !error && activeOrders.length > 0 && <div style={inquiryListStyle}>{activeOrders.map(renderOrder)}</div>}
    {!loading && !error && pendingOrders.length > 0 && <section style={{ marginTop: "22px" }}><h2 style={{ ...inquiryTitleStyle, marginBottom: "10px" }}>Zahlung nicht abgeschlossen</h2><p style={inquiryMetaStyle}>Diese PayPal-Vorgänge sind offen und werden getrennt von bezahlten Bestellungen angezeigt.</p><div style={inquiryListStyle}>{pendingOrders.map(renderOrder)}</div></section>}
  </>;
}
