import { Fragment, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
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

const requestSummaryStyle = {
  ...adminSelectedExtrasStyle,
  display: "grid",
  gap: "12px",
};

const requestProductSummaryStyle = {
  border: "1px solid #e7dfd0",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #fffdf8, #f7f2e7)",
  padding: "13px 14px",
};

const requestProductHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
};

const requestSummaryMetaStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "8px",
};

const requestChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  background: "#eef3ea",
  border: "1px solid #d8e1d3",
  color: "#435749",
  padding: "5px 9px",
  fontSize: "13px",
  fontWeight: "bold",
};

const requestPriceSummaryStyle = {
  display: "grid",
  gap: "3px",
  textAlign: "right",
  color: "#556b5d",
  fontSize: "13px",
};

const requestExtrasListStyle = {
  display: "grid",
  gap: "7px",
  marginTop: "10px",
  paddingLeft: "12px",
};

const requestExtraRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap",
  borderLeft: "3px solid #d8e1d3",
  background: "#fbfaf6",
  borderRadius: "0 12px 12px 0",
  padding: "8px 10px",
  color: "#637064",
};

const customerMessageBoxStyle = {
  ...inquiryMessageStyle,
  display: "grid",
  gap: "8px",
  marginTop: "16px",
  whiteSpace: "normal",
};

const customerMessageTextStyle = {
  margin: 0,
  whiteSpace: "pre-wrap",
  color: "#4f5d50",
  lineHeight: 1.55,
};

const originalMessageDetailsStyle = {
  marginTop: "4px",
  color: "#637064",
  fontSize: "13px",
};

const replyBoxStyle = {
  ...inquiryMessageStyle,
  display: "grid",
  gap: "10px",
  marginTop: "14px",
  whiteSpace: "normal",
};

const replyLabelStyle = {
  display: "grid",
  gap: "5px",
  color: "#435749",
  fontSize: "13px",
  fontWeight: "bold",
};

const replyInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d8e1d3",
  borderRadius: "12px",
  padding: "10px 12px",
  background: "#fffdf8",
  color: "#2f3a34",
  font: "inherit",
};

const replyStatusStyle = {
  margin: 0,
  color: "#435749",
  fontSize: "14px",
  fontWeight: "bold",
};

const replyActionRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "10px",
  alignItems: "stretch",
};

const replyButtonBaseStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "10px 14px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
  minHeight: "42px",
};

const replySendButtonStyle = {
  ...replyButtonBaseStyle,
  background: "#6f856f",
  color: "#fffaf3",
};

const replySendDoneButtonStyle = {
  ...replyButtonBaseStyle,
  background: "#435f49",
  color: "#fffaf3",
};

const replyCancelButtonStyle = {
  ...replyButtonBaseStyle,
  background: "#f7e7e1",
  border: "1px solid #e6c7ba",
  color: "#8a4d32",
};

const replyFallbackLinkStyle = {
  ...replyButtonBaseStyle,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fffdf8",
  border: "1px solid #d8e1d3",
  color: "#435749",
  textDecoration: "none",
};

function cleanGeneratedCartMessageTail(value) {
  return String(value || "")
    .replace(/\n*\s*Hinweis:\s*Diese Anfrage wurde[\s\S]*$/i, "")
    .trim();
}

function hasGeneratedCartSummary(value) {
  const message = String(value || "");

  return (
    message.includes("ich möchte meinen Warenkorb unverbindlich anfragen:") ||
    message.includes("Voraussichtlicher Gesamtbetrag:") ||
    (message.includes("Meine Nachricht dazu:") &&
      message.includes("Basispreis:") &&
      message.includes("Menge:"))
  );
}

function getCustomerMessageView(inquiry, hasCartPositions) {
  const originalMessage = String(inquiry?.message || "").trim();

  if (!hasCartPositions) {
    return {
      customerMessage: originalMessage,
      showOriginalMessage: false,
      originalMessage,
    };
  }

  if (!hasGeneratedCartSummary(originalMessage)) {
    return {
      customerMessage: originalMessage,
      showOriginalMessage: false,
      originalMessage,
    };
  }

  const checkoutMessageMatch = originalMessage.match(/^Nachricht:\s*(.+)$/im);
  const cartMessageMarker = "Meine Nachricht dazu:";
  const markerIndex = originalMessage.indexOf(cartMessageMarker);
  const messageAfterCartSummary =
    markerIndex >= 0
      ? cleanGeneratedCartMessageTail(
          originalMessage.slice(markerIndex + cartMessageMarker.length)
        )
      : "";
  const customerMessage = (
    messageAfterCartSummary ||
    checkoutMessageMatch?.[1] ||
    ""
  ).trim();

  return {
    customerMessage,
    showOriginalMessage: Boolean(originalMessage),
    originalMessage,
  };
}

function isCartInquiry(inquiry, cartPositions) {
  return (
    cartPositions.length > 0 ||
    String(inquiry?.product_title || "").toLowerCase() === "warenkorbanfrage"
  );
}

function buildReplySubject(inquiry, cartPositions) {
  if (isCartInquiry(inquiry, cartPositions)) {
    return "Deine Anfrage bei Camp Oase";
  }

  if (inquiry?.product_title) {
    return `Deine Anfrage zu ${inquiry.product_title} bei Camp Oase`;
  }

  return "Deine Anfrage bei Camp Oase";
}

function buildReplyMessage(inquiry, cartPositions) {
  const customerName = String(inquiry?.name || "").trim();
  const greeting = customerName ? `Hallo ${customerName},` : "Hallo,";
  const lines = [
    greeting,
    "",
    "vielen Dank für deine Anfrage bei Camp Oase.",
    "",
    "Wir haben deine Anfrage erhalten und melden uns gern mit weiteren Informationen bei dir.",
  ];

  if (isCartInquiry(inquiry, cartPositions) && cartPositions.length > 0) {
    lines.push("", "Deine angefragten Produkte:");
    cartPositions.forEach((position) => {
      const quantity = position.quantity ? `${position.quantity}x ` : "";
      lines.push(`- ${quantity}${position.product_title || "Produkt"}`);
    });

    if (inquiry?.estimated_total) {
      lines.push("", `Geschätzter Gesamtpreis: ${inquiry.estimated_total}`);
    }
  } else if (inquiry?.product_title) {
    lines.push("", `Es geht um: ${inquiry.product_title}`);
  }

  lines.push("", "Viele Grüße", "Camp Oase");

  return lines.join("\n");
}

function getMailtoFallback(replyDraft) {
  return (
    "mailto:" +
    encodeURIComponent(replyDraft.to || "") +
    "?subject=" +
    encodeURIComponent(replyDraft.subject || "") +
    "&body=" +
    encodeURIComponent(replyDraft.message || "")
  );
}

export default function AdminInquiries({
  inquiries,
  statusFilter,
  setStatusFilter,
  onUpdateStatus,
  onDeleteInquiry,
  onPrepareInvoice,
}) {
  const [invoiceInquiry, setInvoiceInquiry] = useState(null);
  const [preparingInvoiceId, setPreparingInvoiceId] = useState(null);
  const [replyInquiryId, setReplyInquiryId] = useState(null);
  const [replyDraft, setReplyDraft] = useState({
    to: "",
    subject: "",
    message: "",
  });
  const [replyStatus, setReplyStatus] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replySending, setReplySending] = useState(false);

  function openReply(inquiry, cartPositions) {
    setReplyInquiryId(inquiry.id);
    setReplyDraft({
      to: String(inquiry.email || "").trim(),
      subject: buildReplySubject(inquiry, cartPositions),
      message: buildReplyMessage(inquiry, cartPositions),
    });
    setReplyStatus("");
    setReplyError("");
  }

  function closeReply() {
    setReplyInquiryId(null);
    setReplyDraft({ to: "", subject: "", message: "" });
    setReplyStatus("");
    setReplyError("");
  }

  async function sendReply(inquiry, markDoneAfterSend = false) {
    setReplySending(true);
    setReplyStatus("");
    setReplyError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setReplyError("Antwort konnte nicht gesendet werden. Bitte neu einloggen.");
        return;
      }

      const response = await fetch("/api/send-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: replyDraft.to,
          subject: replyDraft.subject,
          message: replyDraft.message,
          inquiryId: inquiry.id,
          customerName: inquiry.name,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setReplyError(result.error || "Antwort konnte nicht gesendet werden.");
        return;
      }

      if (markDoneAfterSend) {
        const statusUpdated = await onUpdateStatus(inquiry.id, "erledigt");

        if (!statusUpdated) {
          setReplyError(
            "Antwort wurde gesendet, aber die Anfrage konnte nicht als erledigt markiert werden."
          );
          return;
        }

        setReplyStatus(
          "Antwort wurde gesendet und die Anfrage als erledigt markiert."
        );
        return;
      }

      setReplyStatus("Antwort wurde gesendet.");
    } catch (_error) {
      setReplyError("Antwort konnte nicht gesendet werden.");
    } finally {
      setReplySending(false);
    }
  }

  function getInvoiceDate(inquiry) {
    return inquiry?.invoice_created_at
      ? new Date(inquiry.invoice_created_at)
      : inquiry?.created_at
        ? new Date(inquiry.created_at)
        : new Date();
  }

  function getInvoiceNumber(inquiry) {
    if (inquiry?.invoice_number) return inquiry.invoice_number;

    const year = getInvoiceDate(inquiry).getFullYear();
    const shortId = String(inquiry?.id || "ENTWURF").replace(/-/g, "").slice(0, 8);
    return `ENTWURF-${year}-${shortId}`;
  }

  async function openInvoice(inquiry) {
    setPreparingInvoiceId(inquiry.id);

    try {
      const preparedInquiry = onPrepareInvoice
        ? await onPrepareInvoice(inquiry)
        : inquiry;

      if (preparedInquiry) {
        setInvoiceInquiry(preparedInquiry);
      }
    } finally {
      setPreparingInvoiceId(null);
    }
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
            min-width: 720px;
            table-layout: auto;
          }

          .invoice-print-table th,
          .invoice-print-table td {
            overflow-wrap: normal;
            word-break: normal;
          }

          .invoice-position-col {
            min-width: 260px;
            white-space: normal;
          }

          .invoice-quantity-col {
            width: 90px;
            min-width: 90px;
            text-align: right;
            white-space: nowrap;
          }

          .invoice-price-col {
            width: 132px;
            min-width: 132px;
            text-align: right;
            white-space: nowrap;
          }

          .invoice-total-row {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-bottom: 22px;
          }

          .invoice-total-box {
            width: min(280px, 100%);
            box-sizing: border-box;
            text-align: right;
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
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              margin: 0 !important;
            }

            body * {
              visibility: hidden !important;
            }

            body > #root {
              display: none !important;
            }

            body > .invoice-print-portal {
              display: none !important;
              visibility: hidden !important;
            }

            body > .invoice-print-portal.invoice-print-portal-active {
              display: block !important;
              visibility: visible !important;
              position: static !important;
              width: auto !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }

            body > .invoice-print-portal.invoice-print-portal-active * {
              visibility: visible !important;
            }

            .invoice-preview-overlay {
              position: static !important;
              inset: auto !important;
              width: auto !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }

            .invoice-preview-inner {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
            }

            .invoice-print-area,
            .invoice-print-area * {
              visibility: visible !important;
            }

            .invoice-print-area {
              position: static !important;
              inset: auto !important;
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
              table-layout: auto !important;
              font-size: 12px !important;
              page-break-inside: auto;
            }

            .invoice-screen-table-wrap {
              overflow: visible !important;
              margin-bottom: 22px !important;
            }

            .invoice-position-col {
              min-width: 0 !important;
              width: auto !important;
            }

            .invoice-quantity-col {
              width: 18mm !important;
              min-width: 18mm !important;
              white-space: nowrap !important;
            }

            .invoice-price-col {
              width: 30mm !important;
              min-width: 30mm !important;
              white-space: nowrap !important;
            }

            .invoice-total-row {
              width: 100% !important;
              display: flex !important;
              justify-content: flex-end !important;
            }

            .invoice-total-box {
              width: 62mm !important;
              max-width: 62mm !important;
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
            const messageView = getCustomerMessageView(
              inquiry,
              cartPositions.length > 0
            );

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

                  {(selectedVariant?.name || selectedItems.length > 0) &&
                    cartPositions.length === 0 && (
                      <div style={requestSummaryStyle}>
                        <strong>Auswahl-Zusammenfassung:</strong>

                        <div style={requestProductSummaryStyle}>
                          <div style={requestProductHeaderStyle}>
                            <div>
                              <strong>{inquiry.product_title}</strong>

                              {selectedVariant?.name && (
                                <div style={requestSummaryMetaStyle}>
                                  <span style={requestChipStyle}>
                                    Variante: {selectedVariant.name}
                                  </span>
                                </div>
                              )}

                              {selectedVariant?.description && (
                                <small style={{ color: "#637064" }}>
                                  {selectedVariant.description}
                                </small>
                              )}
                            </div>
                          </div>

                          {selectedItems.length > 0 && (
                            <div style={requestExtrasListStyle}>
                              {selectedItems.map((extra, index) => (
                                <div
                                  key={extra.name + "-" + index}
                                  style={requestExtraRowStyle}
                                >
                                  <span>
                                    <strong>Extra:</strong> {extra.name}
                                    {extra.note && (
                                      <>
                                        <br />
                                        <small>Hinweis: {extra.note}</small>
                                      </>
                                    )}
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
                                  </span>

                                  <strong style={{ whiteSpace: "nowrap" }}>
                                    {extra.has_discount && (
                                      <>
                                        <span
                                          style={{
                                            textDecoration: "line-through",
                                            fontWeight: "normal",
                                            color: "#8b8170",
                                          }}
                                        >
                                          +{formatEuro(extra.original_price)}
                                        </span>{" "}
                                      </>
                                    )}
                                    +{formatEuro(extra.price)}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {cartPositions.length > 0 && (
                    <div style={requestSummaryStyle}>
                      <strong>Warenkorb-Positionen:</strong>

                      {cartPositions.map((position, index) => {
                        const extras = Array.isArray(position.extras)
                          ? position.extras
                          : [];
                        const basePrice =
                          position.base_price_label ||
                          formatEuro(position.base_price);
                        const unitTotal =
                          position.unit_total_label ||
                          formatEuro(position.unit_total);
                        const lineTotal =
                          position.line_total_label ||
                          formatEuro(position.line_total);

                        return (
                          <div
                            key={(position.product_title || "position") + "-" + index}
                            style={requestProductSummaryStyle}
                          >
                            <div style={requestProductHeaderStyle}>
                              <div>
                                <strong>{position.product_title}</strong>

                                <div style={requestSummaryMetaStyle}>
                                  <span style={requestChipStyle}>
                                    Menge: {position.quantity}
                                  </span>
                                  {position.is_preorder && (
                                    <span style={requestChipStyle}>
                                      Vorbestellung
                                    </span>
                                  )}
                                  {position.variant?.name && (
                                    <span style={requestChipStyle}>
                                      Variante: {position.variant.name}
                                    </span>
                                  )}
                                </div>

                                {position.variant?.description && (
                                  <small style={{ color: "#637064" }}>
                                    {position.variant.description}
                                  </small>
                                )}
                              </div>

                              <div style={requestPriceSummaryStyle}>
                                <span>Basispreis: {basePrice}</span>
                                {position.discount_percent > 0 && (
                                  <span>
                                    Rabatt:{" "}
                                    {position.discount_label ||
                                      position.discount_percent + " % Rabatt"}
                                    {position.original_base_price_label
                                      ? " · vorher " +
                                        position.original_base_price_label
                                      : ""}
                                  </span>
                                )}
                                <span>Einzelpreis: {unitTotal}</span>
                                <strong>Positionssumme: {lineTotal}</strong>
                              </div>
                            </div>

                            {extras.length > 0 && (
                              <div style={requestExtrasListStyle}>
                                {extras.map((extra, extraIndex) => (
                                  <div
                                    key={extra.name + "-" + extraIndex}
                                    style={requestExtraRowStyle}
                                  >
                                    <span>
                                      <strong>Extra:</strong> {extra.name}
                                      {extra.note && (
                                        <>
                                          <br />
                                          <small>Hinweis: {extra.note}</small>
                                        </>
                                      )}
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
                                    </span>

                                    <strong style={{ whiteSpace: "nowrap" }}>
                                      {extra.has_discount && (
                                        <>
                                          <span
                                            style={{
                                              textDecoration: "line-through",
                                              fontWeight: "normal",
                                              color: "#8b8170",
                                            }}
                                          >
                                            +{formatEuro(extra.original_price)}
                                          </span>{" "}
                                        </>
                                      )}
                                      +{formatEuro(extra.price)}
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={customerMessageBoxStyle}>
                    <strong>Kundennachricht</strong>
                    <p style={customerMessageTextStyle}>
                      {messageView.customerMessage ||
                        "Keine zusätzliche Nachricht angegeben."}
                    </p>

                    {messageView.showOriginalMessage && (
                      <details style={originalMessageDetailsStyle}>
                        <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                          Originalnachricht anzeigen
                        </summary>
                        <p
                          style={{
                            margin: "8px 0 0",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.5,
                          }}
                        >
                          {messageView.originalMessage}
                        </p>
                      </details>
                    )}
                  </div>

                  {replyInquiryId === inquiry.id && (
                    <div style={replyBoxStyle}>
                      <strong>Antwort schreiben</strong>

                      <label style={replyLabelStyle}>
                        An
                        <input
                          type="email"
                          value={replyDraft.to}
                          onChange={(event) =>
                            setReplyDraft({ ...replyDraft, to: event.target.value })
                          }
                          style={replyInputStyle}
                        />
                      </label>

                      <label style={replyLabelStyle}>
                        Betreff
                        <input
                          type="text"
                          value={replyDraft.subject}
                          onChange={(event) =>
                            setReplyDraft({
                              ...replyDraft,
                              subject: event.target.value,
                            })
                          }
                          style={replyInputStyle}
                        />
                      </label>

                      <label style={replyLabelStyle}>
                        Nachricht
                        <textarea
                          value={replyDraft.message}
                          onChange={(event) =>
                            setReplyDraft({
                              ...replyDraft,
                              message: event.target.value,
                            })
                          }
                          rows={8}
                          maxLength={5000}
                          style={{ ...replyInputStyle, resize: "vertical" }}
                        />
                      </label>

                      {replyStatus && <p style={replyStatusStyle}>{replyStatus}</p>}

                      {replyError && (
                        <p style={{ ...replyStatusStyle, color: "#8a4d32" }}>
                          {replyError}
                        </p>
                      )}

                      <div style={replyActionRowStyle}>
                        <button
                          type="button"
                          onClick={() => sendReply(inquiry)}
                          disabled={replySending}
                          style={{
                            ...replySendButtonStyle,
                            opacity: replySending ? 0.72 : 1,
                            cursor: replySending ? "not-allowed" : "pointer",
                          }}
                        >
                          {replySending ? "Wird gesendet..." : "Antwort senden"}
                        </button>

                        <button
                          type="button"
                          onClick={() => sendReply(inquiry, true)}
                          disabled={replySending || isDone}
                          style={{
                            ...replySendDoneButtonStyle,
                            opacity: replySending || isDone ? 0.72 : 1,
                            cursor:
                              replySending || isDone ? "not-allowed" : "pointer",
                          }}
                        >
                          Antwort senden & als erledigt markieren
                        </button>

                        <button
                          type="button"
                          onClick={closeReply}
                          style={replyCancelButtonStyle}
                        >
                          Abbrechen
                        </button>

                        {replyError && (
                          <a
                            href={getMailtoFallback(replyDraft)}
                            style={replyFallbackLinkStyle}
                          >
                            Mailprogramm öffnen
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={inquiryActionRowStyle}>
                    <button
                      type="button"
                      onClick={() => openReply(inquiry, cartPositions)}
                      style={compactEditButtonStyle}
                    >
                      Antworten
                    </button>

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
                      onClick={() => openInvoice(inquiry)}
                      disabled={preparingInvoiceId === inquiry.id}
                      style={compactEditButtonStyle}
                    >
                      {preparingInvoiceId === inquiry.id
                        ? "Rechnung wird vorbereitet..."
                        : "Rechnung erstellen/anzeigen"}
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

          return createPortal(
            <div
              className="invoice-print-portal invoice-print-portal-active"
              data-invoice-id={String(invoiceInquiry.id || "")}
            >
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
                        alt="Camp Oase"
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
                        Kundennummer:{" "}
                        <strong>{invoiceInquiry.customer_number || "Noch offen"}</strong>
                        <br />
                        Bestellnummer:{" "}
                        <strong>{invoiceInquiry.order_number || "Noch offen"}</strong>
                        <br />
                        Rechnungsnummer: <strong>{invoiceNumber}</strong>
                        <br />
                        Rechnungsdatum: {invoiceDateLabel}
                        <br />
                        Leistungs-/Lieferdatum: {invoiceDateLabel}
                        <br />
                        Interne Referenz: {invoiceInquiry.id}
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
                        <th
                          className="invoice-position-col"
                          style={{ textAlign: "left", padding: "10px" }}
                        >
                          Position
                        </th>
                        <th
                          className="invoice-quantity-col"
                          style={{ textAlign: "right", padding: "10px" }}
                        >
                          Menge
                        </th>
                        <th
                          className="invoice-price-col"
                          style={{ textAlign: "right", padding: "10px" }}
                        >
                          Einzelpreis
                        </th>
                        <th
                          className="invoice-price-col"
                          style={{ textAlign: "right", padding: "10px" }}
                        >
                          Zwischensumme
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position, index) => (
                        <Fragment key={position.title + "-" + index}>
                          <tr className="invoice-print-row">
                            <td
                              className="invoice-position-col"
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
                              className="invoice-quantity-col"
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
                              className="invoice-price-col"
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
                              className="invoice-price-col"
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
                                  className="invoice-position-col"
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
                                  className="invoice-quantity-col"
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
                                  className="invoice-price-col"
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
                                  className="invoice-price-col"
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

                  <section className="invoice-total-row">
                    <div
                      className="invoice-total-box"
                      style={{
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
            </div>,
            document.body
          );
        })()}
    </>
  );
}

