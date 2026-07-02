import { Fragment, useState } from "react";
import { formatEuro, parsePrice } from "../utils/price";
import {
  adminSelectedExtrasStyle,
  adminTotalStyle,
  compactDeleteButtonStyle,
  compactEditButtonStyle,
  completeInquiryButtonStyle,
  emptyBoxStyle,
  inquiryActionRowStyle,
  inquiryCardDoneStyle,
  inquiryCardStyle,
  inquiryHeaderStyle,
  inquiryInfoBoxStyle,
  inquiryInfoGridStyle,
  inquiryInfoLabelStyle,
  inquiryListStyle,
  inquiryMessageStyle,
  inquiryMetaStyle,
  inquiryTitleStyle,
  reopenInquiryButtonStyle,
  statusBadgeDoneStyle,
  statusBadgeStyle,
  statusFilterActiveStyle,
  statusFilterButtonStyle,
  statusFilterRowStyle,
} from "../styles";

export default function AdminInquiries({
  inquiries,
  statusFilter,
  setStatusFilter,
  onUpdateStatus,
  onDeleteInquiry,
}) {
  const [invoiceInquiry, setInvoiceInquiry] = useState(null);

  function getInvoiceDate(inquiry) {
    return inquiry?.created_at ? new Date(inquiry.created_at) : new Date();
  }

  function getInvoiceNumber(inquiry) {
    const year = getInvoiceDate(inquiry).getFullYear();
    const shortId = String(inquiry?.id || "ENTWURF").replace(/-/g, "").slice(0, 8);

    // Later, a real invoices table should store permanent, sequential invoice numbers.
    return `CO-${year}-${shortId}`;
  }

  function getInvoiceCustomer(inquiry) {
    const selectedExtras = inquiry?.selected_extras || {};
    const firstName = selectedExtras.customer_first_name || "";
    const lastName = selectedExtras.customer_last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const address = selectedExtras.shipping_address || {};

    return {
      name: String(fullName || inquiry?.name || "").trim(),
      street: String(address.street || "").trim(),
      zip: String(address.zip || "").trim(),
      city: String(address.city || "").trim(),
      email: String(inquiry?.email || "").trim(),
    };
  }

  function getInvoicePositions(inquiry) {
    const cartPositions = Array.isArray(inquiry?.selected_extras?.positions)
      ? inquiry.selected_extras.positions
      : [];
    const selectedItems = Array.isArray(inquiry?.selected_extras?.items)
      ? inquiry.selected_extras.items
      : [];

    if (cartPositions.length > 0) {
      return cartPositions.map((position) => {
        const quantity = Number(position.quantity || 1);
        const basePrice = Number(position.base_price || 0);

        return {
          title: position.product_title || "Position",
          variant: position.variant || null,
          quantity,
          unitLabel: position.base_price_label || formatEuro(basePrice),
          lineLabel: formatEuro(basePrice * quantity),
          extras: Array.isArray(position.extras) ? position.extras : [],
        };
      });
    }

    if (selectedItems.length > 0) {
      const extrasTotal = selectedItems.reduce(
        (sum, extra) => sum + Number(extra.price || 0),
        0
      );
      const estimatedTotal = parsePrice(inquiry?.estimated_total);
      const baseTotal = Math.max(0, (estimatedTotal || extrasTotal) - extrasTotal);

      return [
        {
          title: inquiry?.product_title || "Anfrage",
          variant: inquiry?.selected_extras?.selected_variant || null,
          quantity: 1,
          unitLabel: formatEuro(baseTotal),
          lineLabel: formatEuro(baseTotal),
          extras: selectedItems,
        },
      ];
    }

    return [
      {
        title: inquiry?.product_title || "Anfrage",
        variant: inquiry?.selected_extras?.selected_variant || null,
        quantity: 1,
        unitLabel: inquiry?.estimated_total || "",
        lineLabel: inquiry?.estimated_total || "",
        extras: [],
      },
    ];
  }

  return (
    <>
      <style>
        {`
          .invoice-preview-overlay {
            box-sizing: border-box;
          }

          .invoice-preview-inner {
            width: 100%;
            max-width: 960px;
            box-sizing: border-box;
          }

          .invoice-print-area {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow-wrap: anywhere;
          }

          .invoice-screen-table-wrap {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-bottom: 22px;
          }

          .invoice-print-table {
            min-width: 640px;
          }

          @media (max-width: 640px) {
            .invoice-preview-overlay {
              padding: 10px !important;
            }

            .invoice-print-area {
              padding: 18px 14px !important;
              border-radius: 16px !important;
            }
          }

          @media print {
            html,
            body {
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .invoice-print-area,
            .invoice-print-area * {
              visibility: visible !important;
            }

            .invoice-print-area {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
            }

            .invoice-no-print {
              display: none !important;
            }

            .invoice-print-table {
              width: 100% !important;
              min-width: 0 !important;
              page-break-inside: auto;
            }

            .invoice-screen-table-wrap {
              overflow: visible !important;
              margin-bottom: 22px !important;
            }

            .invoice-print-row {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            @page {
              size: A4;
              margin: 16mm;
            }
          }
        `}
      </style>

      <h2 style={{ marginTop: "40px" }}>Kundenanfragen</h2>

      <div style={statusFilterRowStyle}>
        {[
          { value: "all", label: "Alle" },
          { value: "offen", label: "Offen" },
          { value: "erledigt", label: "Erledigt" },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            style={{
              ...statusFilterButtonStyle,
              ...(statusFilter === filter.value ? statusFilterActiveStyle : {}),
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div style={emptyBoxStyle}>Noch keine Anfragen vorhanden.</div>
      ) : (
        <div style={inquiryListStyle}>
          {inquiries.map((inquiry) => {
            const selectedItems = Array.isArray(inquiry.selected_extras?.items)
              ? inquiry.selected_extras.items
              : [];
            const cartPositions = Array.isArray(inquiry.selected_extras?.positions)
              ? inquiry.selected_extras.positions
              : [];
            const inquiryStatus = inquiry.status || "offen";
            const isDone = inquiryStatus === "erledigt";
            const selectedVariant = inquiry.selected_extras?.selected_variant;

            return (
              <div
                key={inquiry.id}
                style={{
                  ...inquiryCardStyle,
                  ...(isDone ? inquiryCardDoneStyle : {}),
                }}
              >
                <div>
                  <div style={inquiryHeaderStyle}>
                    <div>
                      <h3 style={inquiryTitleStyle}>{inquiry.product_title}</h3>

                      <p style={inquiryMetaStyle}>
                        {inquiry.created_at
                          ? new Date(inquiry.created_at).toLocaleString("de-DE")
                          : "Kein Datum"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...statusBadgeStyle,
                        ...(isDone ? statusBadgeDoneStyle : {}),
                      }}
                    >
                      {isDone ? "Erledigt" : "Offen"}
                    </span>
                  </div>

                  <div style={inquiryInfoGridStyle}>
                    <div style={inquiryInfoBoxStyle}>
                      <span style={inquiryInfoLabelStyle}>Name</span>
                      <strong>{inquiry.name}</strong>
                    </div>

                    <div style={inquiryInfoBoxStyle}>
                      <span style={inquiryInfoLabelStyle}>E-Mail</span>
                      <a href={"mailto:" + inquiry.email} style={{ color: "#556b5d" }}>
                        {inquiry.email}
                      </a>
                    </div>
                  </div>

                  {inquiry.estimated_total && (
                    <p style={adminTotalStyle}>
                      Geschätzter Gesamtpreis: <strong>{inquiry.estimated_total}</strong>
                    </p>
                  )}

                  {selectedVariant?.name && (
                    <div style={adminSelectedExtrasStyle}>
                      <strong>Variante:</strong>
                      <p>
                        {selectedVariant.name}
                        {selectedVariant.description && (
                          <>
                            <br />
                            <small>{selectedVariant.description}</small>
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {selectedItems.length > 0 && (
                    <div style={adminSelectedExtrasStyle}>
                      <strong>Ausgewählte Extras:</strong>

                      {selectedItems.map((extra, index) => (
                        <p key={extra.name + "-" + index}>
                          {extra.name} ·{" "}
                          {extra.has_discount && (
                            <>
                              <span style={{ textDecoration: "line-through" }}>
                                +{formatEuro(extra.original_price)}
                              </span>{" "}
                            </>
                          )}
                          +{formatEuro(extra.price)}
                          {extra.has_discount && (
                            <>
                              <br />
                              <small>
                                Rabatt:{" "}
                                {extra.discount_label ||
                                  extra.discount_percent + " % Rabatt"}
                              </small>
                            </>
                          )}
                          {extra.note && (
                            <>
                              <br />
                              <small>Hinweis: {extra.note}</small>
                            </>
                          )}
                        </p>
                      ))}
                    </div>
                  )}

                  {cartPositions.length > 0 && (
                    <div style={adminSelectedExtrasStyle}>
                      <strong>Warenkorb-Positionen:</strong>

                      {cartPositions.map((position, index) => (
                        <div key={(position.product_title || "position") + "-" + index}>
                          <p>
                            <strong>{position.product_title}</strong>
                            {position.is_preorder && (
                              <>
                                <br />
                                <small>Vorbestellung</small>
                              </>
                            )}
                            {position.variant?.name && (
                              <>
                                <br />
                                <small>
                                  Variante: {position.variant.name}
                                  {position.variant.description
                                    ? " · " + position.variant.description
                                    : ""}
                                </small>
                              </>
                            )}
                            <br />
                            Menge: {position.quantity} · Basispreis:{" "}
                            {position.base_price_label ||
                              formatEuro(position.base_price)}
                            {position.discount_percent > 0 && (
                              <>
                                <br />
                                Rabatt:{" "}
                                {position.discount_label ||
                                  position.discount_percent + " % Rabatt"}
                                {position.original_base_price_label && (
                                  <>
                                    {" · "}vorher{" "}
                                    {position.original_base_price_label}
                                  </>
                                )}
                              </>
                            )}
                            <br />
                            Einzelpreis:{" "}
                            {position.unit_total_label ||
                              formatEuro(position.unit_total)}
                            {" · "}Zwischensumme:{" "}
                            {position.line_total_label ||
                              formatEuro(position.line_total)}
                          </p>

                          {Array.isArray(position.extras) &&
                            position.extras.length > 0 && (
                              <div>
                                <small>
                                  <strong>Extras:</strong>
                                </small>
                                {position.extras.map((extra, extraIndex) => (
                                  <p
                                    key={extra.name + "-" + extraIndex}
                                    style={{ marginLeft: "10px" }}
                                  >
                                    {extra.name} ·{" "}
                                    {extra.has_discount && (
                                      <>
                                        <span
                                          style={{ textDecoration: "line-through" }}
                                        >
                                          +{formatEuro(extra.original_price)}
                                        </span>{" "}
                                      </>
                                    )}
                                    +{formatEuro(extra.price)}
                                    {extra.has_discount && (
                                      <>
                                        <br />
                                        <small>
                                          Rabatt:{" "}
                                          {extra.discount_label ||
                                            extra.discount_percent + " % Rabatt"}
                                        </small>
                                      </>
                                    )}
                                    {extra.note && (
                                      <>
                                        <br />
                                        <small>Hinweis: {extra.note}</small>
                                      </>
                                    )}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p style={inquiryMessageStyle}>{inquiry.message}</p>

                  <div style={inquiryActionRowStyle}>
                    <a
                      href={
                        "mailto:" +
                        inquiry.email +
                        "?subject=" +
                        encodeURIComponent(
                          "Antwort zu deiner Anfrage: " + inquiry.product_title
                        ) +
                        "&body=" +
                        encodeURIComponent(
                          "Hallo " +
                            inquiry.name +
                            ",\n\nvielen Dank für deine Anfrage zu \"" +
                            inquiry.product_title +
                            "\".\n\n"
                        )
                      }
                      style={{ ...compactEditButtonStyle, textDecoration: "none" }}
                    >
                      Antworten
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateStatus(inquiry.id, isDone ? "offen" : "erledigt")
                      }
                      style={isDone ? reopenInquiryButtonStyle : completeInquiryButtonStyle}
                    >
                      {isDone ? "Wieder öffnen" : "Als erledigt markieren"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInvoiceInquiry(inquiry)}
                      style={compactEditButtonStyle}
                    >
                      Rechnung anzeigen
                    </button>

                    <button
                      onClick={() => onDeleteInquiry(inquiry.id)}
                      style={compactDeleteButtonStyle}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {invoiceInquiry &&
        (() => {
          const customer = getInvoiceCustomer(invoiceInquiry);
          const positions = getInvoicePositions(invoiceInquiry);
          const invoiceDate = getInvoiceDate(invoiceInquiry);
          const invoiceDateLabel = invoiceDate.toLocaleDateString("de-DE");
          const invoiceNumber = getInvoiceNumber(invoiceInquiry);
          const customerLocation = [customer.zip, customer.city]
            .filter(Boolean)
            .join(" ");
          const customerLines = [
            customer.name,
            customer.street,
            customerLocation,
          ].filter(Boolean);

          return (
            <div
              className="invoice-preview-overlay"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                background: "rgba(47, 62, 52, 0.62)",
                padding: "clamp(14px, 4vw, 32px)",
                overflowY: "auto",
              }}
              onClick={() => setInvoiceInquiry(null)}
              role="presentation"
            >
              <div
                className="invoice-preview-inner"
                style={{
                  maxWidth: "960px",
                  margin: "0 auto",
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  className="invoice-no-print"
                  style={{
                    background: "#fff8e8",
                    border: "1px solid #ead7a5",
                    borderRadius: "16px",
                    padding: "14px 16px",
                    marginBottom: "14px",
                    color: "#6d5a2f",
                    lineHeight: "1.5",
                  }}
                >
                  Diese Rechnungsvorlage ist eine technische Vorbereitung. Bitte
                  Rechnungsdaten vor Versand prüfen.
                </div>

                <div
                  className="invoice-no-print"
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => window.print()}
                    style={completeInquiryButtonStyle}
                  >
                    Rechnung drucken
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceInquiry(null)}
                    style={reopenInquiryButtonStyle}
                  >
                    Schließen
                  </button>
                </div>

                <article
                  className="invoice-print-area"
                  style={{
                    background: "white",
                    color: "#25332a",
                    borderRadius: "18px",
                    padding: "clamp(24px, 5vw, 42px)",
                    boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.55",
                  }}
                >
                  <header
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "28px",
                      flexWrap: "wrap",
                      borderBottom: "2px solid #eef3ea",
                      paddingBottom: "22px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="Camp Oase Logo"
                        style={{
                          width: "82px",
                          maxWidth: "32vw",
                          height: "auto",
                          borderRadius: "18px",
                          display: "block",
                          marginBottom: "14px",
                        }}
                      />
                      <h1 style={{ margin: "0 0 8px", color: "#435749" }}>
                        Rechnung
                      </h1>
                      <p className="invoice-no-print" style={{ margin: 0, color: "#667" }}>
                        Rechnungsvorlage aus Anfrage
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <strong>Brian Hillier</strong>
                      <br />
                      Camp Oase
                      <br />
                      Uelzener Str. 9
                      <br />
                      33719 Bielefeld
                      <br />
                      Deutschland
                      <br />
                      E-Mail: service@camp-oase.de
                    </div>
                  </header>

                  <section
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "22px",
                      marginBottom: "26px",
                    }}
                  >
                    <div>
                      <h2 style={{ color: "#435749", fontSize: "18px" }}>
                        Rechnungsempfänger
                      </h2>
                      <p style={{ margin: 0 }}>
                        {customerLines.length > 0
                          ? customerLines.map((line) => (
                              <span key={line}>
                                {line}
                                <br />
                              </span>
                            ))
                          : "Rechnungsempfänger noch offen"}
                        {customer.email && <>E-Mail: {customer.email}</>}
                      </p>
                    </div>

                    <div>
                      <h2 style={{ color: "#435749", fontSize: "18px" }}>
                        Rechnungsdaten
                      </h2>
                      <p style={{ margin: 0 }}>
                        Rechnungsnummer: <strong>{invoiceNumber}</strong>
                        <br />
                        Rechnungsdatum: {invoiceDateLabel}
                        <br />
                        Leistungs-/Lieferdatum: {invoiceDateLabel}
                        <br />
                        Referenz Anfrage-ID: {invoiceInquiry.id}
                      </p>
                    </div>
                  </section>

                  <div className="invoice-screen-table-wrap">
                    <table
                      className="invoice-print-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                    <thead>
                      <tr style={{ background: "#eef3ea", color: "#435749" }}>
                        <th style={{ textAlign: "left", padding: "10px" }}>
                          Position
                        </th>
                        <th style={{ textAlign: "right", padding: "10px" }}>
                          Menge
                        </th>
                        <th style={{ textAlign: "right", padding: "10px" }}>
                          Einzelpreis
                        </th>
                        <th style={{ textAlign: "right", padding: "10px" }}>
                          Zwischensumme
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position, index) => (
                        <Fragment key={position.title + "-" + index}>
                          <tr className="invoice-print-row">
                            <td
                              style={{
                                padding: "12px 10px",
                                borderBottom: "1px solid #eee7da",
                                verticalAlign: "top",
                              }}
                            >
                              <strong>{position.title}</strong>
                              {position.variant?.name && (
                                <div style={{ marginTop: "4px", color: "#667" }}>
                                  Variante: {position.variant.name}
                                  {position.variant.description
                                    ? " · " + position.variant.description
                                    : ""}
                                </div>
                              )}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "12px 10px",
                                borderBottom: "1px solid #eee7da",
                                verticalAlign: "top",
                              }}
                            >
                              {position.quantity}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "12px 10px",
                                borderBottom: "1px solid #eee7da",
                                verticalAlign: "top",
                              }}
                            >
                              {position.unitLabel}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "12px 10px",
                                borderBottom: "1px solid #eee7da",
                                verticalAlign: "top",
                                fontWeight: "bold",
                              }}
                            >
                              {position.lineLabel}
                            </td>
                          </tr>

                          {position.extras.map((extra, extraIndex) => {
                            const extraPrice = Number(extra.price || 0);
                            const extraLineTotal = extraPrice * position.quantity;

                            return (
                              <tr
                                key={extra.name + "-" + extraIndex}
                                className="invoice-print-row"
                              >
                                <td
                                  style={{
                                    padding: "9px 10px 9px 26px",
                                    borderBottom: "1px solid #f1eadf",
                                    verticalAlign: "top",
                                    color: "#667",
                                  }}
                                >
                                  Extra: {extra.name}
                                  {extra.note ? " · Hinweis: " + extra.note : ""}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    padding: "9px 10px",
                                    borderBottom: "1px solid #f1eadf",
                                    verticalAlign: "top",
                                    color: "#667",
                                  }}
                                >
                                  {position.quantity}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    padding: "9px 10px",
                                    borderBottom: "1px solid #f1eadf",
                                    verticalAlign: "top",
                                    color: "#667",
                                  }}
                                >
                                  {formatEuro(extraPrice)}
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    padding: "9px 10px",
                                    borderBottom: "1px solid #f1eadf",
                                    verticalAlign: "top",
                                    color: "#667",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {formatEuro(extraLineTotal)}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      ))}
                    </tbody>
                    </table>
                  </div>

                  <section
                    style={{
                      display: "grid",
                      justifyContent: "end",
                      gap: "10px",
                      marginBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "260px",
                        background: "#f5f1e8",
                        border: "1px solid #e4dac7",
                        borderRadius: "14px",
                        padding: "14px 16px",
                      }}
                    >
                      <span>Gesamtbetrag</span>
                      <strong
                        style={{
                          display: "block",
                          color: "#435749",
                          fontSize: "24px",
                        }}
                      >
                        {invoiceInquiry.estimated_total || "Noch offen"}
                      </strong>
                    </div>
                  </section>

                  <p
                    style={{
                      background: "#eef3ea",
                      border: "1px solid #d8e1d3",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      color: "#435749",
                      fontWeight: "bold",
                    }}
                  >
                    Kein Steuerausweis aufgrund der Anwendung der
                    Kleinunternehmerregelung (§ 19 UStG).
                  </p>

                  <footer
                    style={{
                      marginTop: "28px",
                      borderTop: "1px solid #eee7da",
                      paddingTop: "16px",
                      color: "#667",
                    }}
                  >
                    Vielen Dank für deine Anfrage / Bestellung bei Camp Oase.
                  </footer>
                </article>
              </div>
            </div>
          );
        })()}
    </>
  );
}

