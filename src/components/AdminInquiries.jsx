import { formatEuro } from "../utils/price";
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
  return (
    <>
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

                  {selectedItems.length > 0 && (
                    <div style={adminSelectedExtrasStyle}>
                      <strong>Ausgewählte Extras:</strong>

                      {selectedItems.map((extra, index) => (
                        <p key={extra.name + "-" + index}>
                          {extra.name} · +{formatEuro(extra.price)}
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
                            <br />
                            Menge: {position.quantity} · Basispreis:{" "}
                            {position.base_price_label ||
                              formatEuro(position.base_price)}
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
                                    {extra.name} · +{formatEuro(extra.price)}
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
    </>
  );
}

