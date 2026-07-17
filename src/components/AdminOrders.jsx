import { Fragment, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
// Optional: erst befüllen, wenn die Steuernummer in den Rechnungseinstellungen gepflegt wird.
const optionalTaxNumber = "";

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

export function OrderInvoicePreview({ order, onClose }) {
  const invoiceDate = new Date(order.invoice_created_at || order.created_at);
  const invoiceDateLabel = Number.isNaN(invoiceDate.getTime()) ? "–" : invoiceDate.toLocaleDateString("de-DE");
  const shippingDiffers = JSON.stringify(order.billing_address || {}) !== JSON.stringify(order.shipping_address || {});

  return createPortal(<div className="order-invoice-print-portal">
    <style>{`@media print {
      @page { size: A4 portrait; margin: 11mm; }
      html, body { margin: 0 !important; padding: 0 !important; width: auto !important; min-height: 0 !important; background: white !important; overflow: visible !important; }
      body > * { display: none !important; }
      body > .order-invoice-print-portal { display: block !important; visibility: visible !important; position: static !important; width: auto !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
      .order-invoice-print-portal .invoice-preview-overlay { display: block !important; position: static !important; inset: auto !important; background: white !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
      .order-invoice-print-portal .invoice-preview-overlay > div { max-width: none !important; margin: 0 !important; }
      .invoice-no-print { display: none !important; }
      .order-invoice-print { display: flex !important; flex-direction: column !important; position: static !important; width: 100% !important; max-width: none !important; min-height: calc(297mm - 22mm) !important; box-sizing: border-box !important; margin: 0 !important; padding: 0 !important; background: white !important; box-shadow: none !important; border-radius: 0 !important; transform: none !important; overflow: visible !important; font-size: 10.5pt !important; }
      .order-invoice-print header, .order-invoice-print section, .order-invoice-print tr { break-inside: avoid !important; page-break-inside: avoid !important; }
      .order-invoice-print header { margin-bottom: 16px !important; padding-bottom: 14px !important; }
      .order-invoice-print section { margin-bottom: 16px !important; }
      .order-invoice-print table { width: 100% !important; table-layout: fixed !important; font-size: 9.5pt !important; }
      .order-invoice-print th, .order-invoice-print td { padding: 7px 5px !important; overflow-wrap: anywhere !important; word-break: normal !important; }
      .order-invoice-print th:first-child, .order-invoice-print td:first-child { width: 47% !important; }
      .order-invoice-print th:nth-child(2), .order-invoice-print td:nth-child(2) { width: 11% !important; }
      .order-invoice-print th:nth-child(3), .order-invoice-print td:nth-child(3), .order-invoice-print th:nth-child(4), .order-invoice-print td:nth-child(4) { width: 21% !important; }
      .order-invoice-print section:last-of-type { break-inside: avoid !important; page-break-inside: avoid !important; }
      .order-invoice-footer { margin-top: auto !important; break-inside: avoid !important; page-break-inside: avoid !important; }
    }`}</style>
    <div className="invoice-preview-overlay" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(47, 62, 52, 0.62)", padding: "clamp(14px, 4vw, 32px)", overflowY: "auto" }} onClick={onClose} role="presentation">
    <div style={{ maxWidth: "960px", margin: "0 auto" }} onClick={(event) => event.stopPropagation()}>
      <div className="invoice-no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "14px" }}>
        <button type="button" onClick={() => window.print()} style={{ border: "none", borderRadius: "12px", padding: "11px 14px", background: "#435749", color: "white", cursor: "pointer" }}>Rechnung drucken</button>
        <button type="button" onClick={onClose} style={{ border: "none", borderRadius: "12px", padding: "11px 14px", background: "#E8F1EF", color: "#2F3A34", cursor: "pointer" }}>Schließen</button>
      </div>
      <article className="order-invoice-print" style={{ display: "flex", flexDirection: "column", minHeight: "calc(297mm - 22mm)", boxSizing: "border-box", background: "white", color: "#25332a", borderRadius: "18px", padding: "clamp(24px, 5vw, 42px)", boxShadow: "0 22px 70px rgba(0,0,0,0.24)", fontFamily: "Arial, sans-serif", lineHeight: "1.55" }}>
        <div>
        <header style={{ display: "flex", justifyContent: "space-between", gap: "28px", flexWrap: "wrap", borderBottom: "2px solid #eef3ea", paddingBottom: "22px", marginBottom: "24px" }}>
          <div><img src="/logo.png" alt="Camp Oase" style={{ width: "82px", borderRadius: "18px", display: "block", marginBottom: "14px" }} /><h1 style={{ margin: "0 0 8px", color: "#435749" }}>Rechnung</h1><p className="invoice-no-print" style={{ margin: 0, color: "#667" }}>Bestellung über PayPal</p></div>
          <div style={{ textAlign: "right" }}><strong>Brian Hillier</strong><br />Camp Oase<br />Uelzener Str. 9<br />33719 Bielefeld<br />Deutschland<br />E-Mail: service@camp-oase.de{optionalTaxNumber && <><br />Steuernummer: {optionalTaxNumber}</>}</div>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "22px", marginBottom: "26px" }}>
          <div><h2 style={{ color: "#435749", fontSize: "18px" }}>Rechnungsempfänger</h2><p style={{ margin: 0 }}><strong>{order.customer_name}</strong><br />{addressLines(order.billing_address).map((line, index) => <Fragment key={index}>{line}<br /></Fragment>)}{order.customer_email && <>E-Mail: {order.customer_email}</>}</p>{shippingDiffers && <><h2 style={{ color: "#435749", fontSize: "18px", marginTop: "20px" }}>Lieferadresse</h2><p style={{ margin: 0 }}>{addressLines(order.shipping_address).map((line, index) => <Fragment key={index}>{line}<br /></Fragment>)}</p></>}</div>
          <div><h2 style={{ color: "#435749", fontSize: "18px" }}>Rechnungsdaten</h2><div style={{ display: "grid", gap: "5px" }}><div>Rechnungsnummer: <strong>{order.invoice_number}</strong></div><div>Rechnungsdatum: {invoiceDateLabel}</div><div>Bestellnummer: <strong>{order.order_number}</strong></div><div>Zahlungsart: PayPal</div><div>Zahlungsstatus: <strong>Bezahlt</strong></div></div></div>
        </section>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "22px" }}><thead><tr style={{ background: "#eef3ea", color: "#435749" }}><th style={{ textAlign: "left", padding: "10px" }}>Position</th><th style={{ textAlign: "right", padding: "10px" }}>Menge</th><th style={{ textAlign: "right", padding: "10px" }}>Einzelpreis</th><th style={{ textAlign: "right", padding: "10px" }}>Summe</th></tr></thead><tbody>{(order.items || []).map((item, index) => {
          const quantity = Number(item.quantity || 1);
          const basePrice = getBasePrice(item);
          const variantAdjustment = Number(item.variant?.price_adjustment);
          const hasVariantAdjustment = Number.isFinite(variantAdjustment) && variantAdjustment !== 0;
          return <Fragment key={`${item.product_id || item.title}-${index}`}>
            <tr><td style={{ padding: "12px 10px", borderBottom: "1px solid #eee7da" }}><strong>{item.title}</strong><div style={{ color: "#667", fontSize: "14px" }}>Grundpreis: {formatMoney(basePrice)}</div>{item.variant?.name && <div style={{ color: "#667", fontSize: "14px" }}>Variante: {item.variant.name}</div>}</td><td style={{ textAlign: "right", padding: "12px 10px", borderBottom: "1px solid #eee7da" }}>{quantity}</td><td style={{ textAlign: "right", padding: "12px 10px", borderBottom: "1px solid #eee7da" }}>{formatMoney(basePrice)}</td><td style={{ textAlign: "right", padding: "12px 10px", borderBottom: "1px solid #eee7da", fontWeight: "bold" }}>{formatMoney(basePrice * quantity)}</td></tr>
            {hasVariantAdjustment && <tr><td style={{ padding: "8px 10px 8px 26px", borderBottom: "1px solid #f1eadf", color: "#667" }}>Variante: {item.variant.name}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{quantity}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{formatMoney(variantAdjustment)}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{formatMoney(variantAdjustment * quantity)}</td></tr>}
            {(item.extras || []).map((extra, extraIndex) => <tr key={`${extra.name}-${extraIndex}`}><td style={{ padding: "8px 10px 8px 26px", borderBottom: "1px solid #f1eadf", color: "#667" }}>Extra: {extra.name}{extra.note ? ` – ${extra.note}` : ""}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{quantity}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{formatMoney(extra.price)}</td><td style={{ textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #f1eadf" }}>{formatMoney(Number(extra.price) * quantity)}</td></tr>)}
          </Fragment>;
        })}</tbody></table>
        <section style={{ marginLeft: "auto", maxWidth: "360px", background: "#f5f1e8", border: "1px solid #e4dac7", borderRadius: "14px", padding: "14px 16px", display: "grid", gap: "7px" }}><div style={totalRowStyle}><span>Zwischensumme</span><strong>{formatMoney(order.subtotal)}</strong></div><div style={totalRowStyle}><span>Versandkosten</span><strong>{formatMoney(order.shipping_cost)}</strong></div><div style={{ ...totalRowStyle, fontSize: "18px" }}><span>Gesamtbetrag</span><strong>{formatMoney(order.total)}</strong></div></section>
        </div>
        <footer className="order-invoice-footer" style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid #e4dac7", color: "#435749" }}><p style={{ margin: 0, fontSize: "15px", lineHeight: "1.65" }}>Herzlichen Dank für deinen Einkauf bei Camp Oase!<br />Wir wünschen dir ganz viel Freude mit deinem persönlichen Lieblingsstück.</p><p style={{ margin: "16px 0 0", color: "#637064", fontSize: "14px" }}>Liebe Grüße<br />Brian von Camp Oase</p><p style={{ margin: "20px 0 0", color: "#637064", fontSize: "13px", lineHeight: "1.55" }}>Für diesen Umsatz gilt die Steuerbefreiung für Kleinunternehmer gemäß § 19 UStG.<br />Umsatzsteuer wird daher nicht ausgewiesen.</p></footer>
      </article>
    </div>
    </div>
  </div>, document.body);
}

export default function AdminOrders({ orders, loading, error, onRetry, onUpdateStatus, onPrepareInvoice, highlightedOrderId }) {
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState("");
  const [preparingInvoiceId, setPreparingInvoiceId] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);

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

  async function openInvoice(order) {
    if (!order.invoice_number) {
      if (!window.confirm("Rechnung jetzt erstellen? Rechnungs-, Kunden- und Bestellnummer werden dabei verbindlich vergeben.")) return;
      setPreparingInvoiceId(order.id);
      const preparedOrder = await onPrepareInvoice(order);
      setPreparingInvoiceId("");
      if (!preparedOrder) return;
      setInvoiceOrder(preparedOrder);
      return;
    }
    setInvoiceOrder(order);
  }

  function renderOrder(order) {
    const isPendingPayment = order.payment_status === "pending";
    return <article key={order.id} style={{ ...inquiryCardStyle, ...(isPendingPayment ? { border: "1px solid #F6D8BE", background: "#fffdf8" } : {}), ...(order.id === highlightedOrderId ? { outline: "3px solid #F4C7A1", outlineOffset: "2px" } : {}) }}>
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

      {order.invoice_number && <div style={{ ...inquiryInfoBoxStyle, marginTop: "14px" }}><span style={inquiryInfoLabelStyle}>Rechnungsdaten ({String(order.invoice_number).startsWith("TEST-") ? "Testmodus" : "Livemodus"})</span>Rechnung: <strong>{order.invoice_number}</strong><br />Bestellung: <strong>{order.order_number || "–"}</strong><br />Kunde: <strong>{order.customer_number || "–"}</strong></div>}

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
        {order.payment_status === "paid" && order.order_status !== "cancelled" && <button type="button" onClick={() => openInvoice(order)} disabled={preparingInvoiceId === order.id} style={{ border: "none", borderRadius: "12px", padding: "11px 14px", background: "#435749", color: "white", cursor: "pointer" }}>{preparingInvoiceId === order.id ? "Kundenrechnung wird erstellt..." : order.invoice_number ? "Kundenrechnung anzeigen / drucken" : "Kundenrechnung erstellen"}</button>}
      </div>
    </article>;
  }

  return <>
    <style>{`@media (max-width: 700px) {
      .admin-orders-filters { display: none !important; }
      .admin-orders-mobile-filter { display: grid !important; gap: 7px; margin-bottom: 16px; }
      .admin-orders-mobile-filter label { color: #435749; font-weight: 600; }
      .admin-orders-mobile-filter select { width: 100%; min-height: 46px; box-sizing: border-box; border: 1px solid #D8E0D2; border-radius: 12px; padding: 10px 12px; background: white; color: #2F3A34; font: inherit; }
    }`}</style>
    <div className="admin-orders-filters" style={statusFilterRowStyle}>{filters.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} style={{ ...statusFilterButtonStyle, ...(filter === value ? statusFilterActiveStyle : {}) }}>{label}</button>)}</div>
    <div className="admin-orders-mobile-filter" style={{ display: "none" }}><label htmlFor="admin-orders-filter">Bestellungen filtern</label><select id="admin-orders-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>{filters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {loading && <div style={emptyBoxStyle}>Bestellungen werden geladen …</div>}
    {!loading && error && <div style={emptyBoxStyle}> {error} <button type="button" onClick={onRetry} style={{ marginLeft: "10px" }}>Erneut laden</button></div>}
    {!loading && !error && filteredOrders.length === 0 && <div style={emptyBoxStyle}>Keine Bestellungen für diesen Filter.</div>}
    {!loading && !error && activeOrders.length > 0 && <div style={inquiryListStyle}>{activeOrders.map(renderOrder)}</div>}
    {!loading && !error && pendingOrders.length > 0 && <section style={{ marginTop: "22px" }}><h2 style={{ ...inquiryTitleStyle, marginBottom: "10px" }}>Zahlung nicht abgeschlossen</h2><p style={inquiryMetaStyle}>Diese PayPal-Vorgänge sind offen und werden getrennt von bezahlten Bestellungen angezeigt.</p><div style={inquiryListStyle}>{pendingOrders.map(renderOrder)}</div></section>}
    {invoiceOrder && <OrderInvoicePreview order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
  </>;
}
