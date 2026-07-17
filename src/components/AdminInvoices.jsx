import { useMemo, useState } from "react";
import {
  emptyBoxStyle,
  inquiryActionRowStyle,
  inquiryCardStyle,
  inquiryInfoBoxStyle,
  inquiryInfoGridStyle,
  inquiryInfoLabelStyle,
  inquiryListStyle,
  inquiryMetaStyle,
  statusBadgeStyle,
  statusFilterActiveStyle,
  statusFilterButtonStyle,
  statusFilterRowStyle,
} from "../styles";

const filters = [["all", "Alle"], ["test", "Testrechnungen"], ["live", "Liverechnungen"], ["paid", "Bezahlt"], ["processing", "In Bearbeitung"], ["shipped", "Versendet"], ["completed", "Abgeschlossen"], ["cancelled", "Storniert"]];
const actionStyle = { border: "none", borderRadius: "10px", padding: "9px 11px", background: "#E8F1EF", color: "#2F3A34", cursor: "pointer", font: "inherit" };
const primaryStyle = { ...actionStyle, background: "#435749", color: "white" };

function money(value) { const number = Number(value); return Number.isFinite(number) ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(number) : "–"; }
function date(value) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "–" : parsed.toLocaleDateString("de-DE"); }
function mode(order) { return String(order.invoice_number || "").startsWith("TEST-R") ? "test" : "live"; }
function copy(value) { navigator.clipboard?.writeText(String(value || "")); }
function orderStatusLabel(value) { return value === "new" ? "Neu" : value || "–"; }
function paymentProviderLabel(value) { return String(value || "").toLowerCase() === "paypal" ? "PayPal" : value || "PayPal"; }

export default function AdminInvoices({ orders, onOpenInvoice, onGoToOrder }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const invoices = useMemo(() => orders.filter((order) => order.invoice_number).sort((a, b) => new Date(b.invoice_created_at || b.created_at) - new Date(a.invoice_created_at || a.created_at)), [orders]);
  const visibleInvoices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return invoices.filter((order) => {
      const matchesFilter = filter === "all" || filter === "test" || filter === "live" ? (filter === "all" || mode(order) === filter) : order.order_status === filter || (filter === "paid" && order.payment_status === "paid");
      const searchable = [order.invoice_number, order.order_number, order.customer_number, order.customer_name, order.customer_email, order.payment_reference, order.total, order.id].join(" ").toLowerCase();
      return matchesFilter && (!needle || searchable.includes(needle));
    });
  }, [filter, invoices, search]);

  return <div className="admin-invoices">
    <style>{`@media (max-width: 700px) {
      .admin-invoices-search { gap: 14px !important; }
      .admin-invoices-search-input { min-height: 46px; font-size: 16px !important; }
      .admin-invoices-filters { display: none !important; }
      .admin-invoices-mobile-filter { display: grid !important; gap: 7px; }
      .admin-invoices-mobile-filter label { color: #435749; font-weight: 600; }
      .admin-invoices-mobile-filter select { width: 100%; min-height: 46px; box-sizing: border-box; border: 1px solid #D8E0D2; border-radius: 12px; padding: 10px 12px; background: white; color: #2F3A34; font: inherit; }
      .admin-invoice-card { padding: 16px !important; }
      .admin-invoice-heading { align-items: flex-start; }
      .admin-invoice-info-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
      .admin-invoice-info-box { width: 100%; box-sizing: border-box; line-height: 1.55; }
      .admin-invoice-email, .admin-invoice-number { overflow-wrap: break-word; word-break: normal; }
      .admin-invoice-actions { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px !important; align-items: stretch !important; }
      .admin-invoice-actions button { width: 100%; min-height: 46px; box-sizing: border-box; text-align: center; }
      .admin-invoice-actions .admin-invoice-primary, .admin-invoice-actions .admin-invoice-order-link { grid-column: 1 / -1; }
    }`}</style>
    <div className="admin-invoices-search" style={{ display: "grid", gap: "12px", marginBottom: "18px" }}><input className="admin-invoices-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechnung, Bestellung, Kunde, E-Mail, PayPal-Referenz, Betrag oder interne ID suchen" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #D8E0D2", borderRadius: "12px", padding: "12px", font: "inherit" }} /><div className="admin-invoices-filters" style={statusFilterRowStyle}>{filters.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} style={{ ...statusFilterButtonStyle, ...(filter === value ? statusFilterActiveStyle : {}) }}>{label}</button>)}</div><div className="admin-invoices-mobile-filter" style={{ display: "none" }}><label htmlFor="admin-invoices-filter">Rechnungen filtern</label><select id="admin-invoices-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>{filters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    {visibleInvoices.length === 0 && <div style={emptyBoxStyle}>{invoices.length === 0 ? "Noch keine Rechnungen vorhanden." : "Keine Rechnungen für diese Suche oder diesen Filter gefunden."}</div>}
    <div style={inquiryListStyle}>{visibleInvoices.map((order) => <article key={order.id} className="admin-invoice-card" style={inquiryCardStyle}><div className="admin-invoice-heading" style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}><div><strong className="admin-invoice-number" style={{ fontSize: "18px", color: "#435749" }}>{order.invoice_number}</strong><p style={inquiryMetaStyle}>Rechnungsdatum: {date(order.invoice_created_at)}</p></div><span style={{ ...statusBadgeStyle, background: mode(order) === "test" ? "#F6D8BE" : "#D8E0D2" }}>{mode(order) === "test" ? "Testrechnung" : "Liverechnung"}</span></div><div className="admin-invoice-info-grid" style={inquiryInfoGridStyle}><div className="admin-invoice-info-box" style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Kunde</span>{order.customer_name || "–"}<br /><span className="admin-invoice-email">{order.customer_email || "–"}</span></div><div className="admin-invoice-info-box" style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Rechnung & Bestellung</span>Bestellung: <strong className="admin-invoice-number">{order.order_number || "–"}</strong><br />Kunde: <strong className="admin-invoice-number">{order.customer_number || "–"}</strong><br />Gesamt: <strong>{money(order.total)}</strong></div><div className="admin-invoice-info-box" style={inquiryInfoBoxStyle}><span style={inquiryInfoLabelStyle}>Status</span>Zahlung: {order.payment_status === "paid" ? "Bezahlt" : order.payment_status || "–"}<br />Bestellung: {orderStatusLabel(order.order_status)}<br />Zahlungsart: {paymentProviderLabel(order.payment_provider)}</div></div><div className="admin-invoice-actions" style={inquiryActionRowStyle}><button className="admin-invoice-primary" type="button" onClick={() => onOpenInvoice(order)} style={primaryStyle}>Kundenrechnung anzeigen / drucken</button><button className="admin-invoice-order-link" type="button" onClick={() => onGoToOrder(order.id)} style={actionStyle}>Zur Bestellung</button><button type="button" onClick={() => copy(order.invoice_number)} style={actionStyle}>Rechnungsnummer kopieren</button><button type="button" onClick={() => copy(order.order_number)} style={actionStyle}>Bestellnummer kopieren</button></div></article>)}</div>
  </div>;
}
