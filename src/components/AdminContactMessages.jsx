import {
  adminSelectedExtrasStyle,
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
} from "../styles";

const STATUS_LABELS = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
};

function getStatusLabel(status) {
  return STATUS_LABELS[status || "neu"] || "Neu";
}

function getStatusStyle(status) {
  if (status === "erledigt") return statusBadgeDoneStyle;
  if (status === "in_bearbeitung") {
    return {
      background: "#fff8e8",
      color: "#7a642f",
    };
  }

  return {};
}

export default function AdminContactMessages({
  messages,
  onUpdateStatus,
  onDeleteMessage,
}) {
  return (
    <>
      <h2 style={{ marginTop: "40px" }}>Kontaktanfragen</h2>

      {messages.length === 0 ? (
        <div style={emptyBoxStyle}>Noch keine Kontaktanfragen vorhanden.</div>
      ) : (
        <div style={inquiryListStyle}>
          {messages.map((message) => {
            const status = message.status || "neu";
            const isDone = status === "erledigt";

            return (
              <div
                key={message.id}
                style={{
                  ...inquiryCardStyle,
                  ...(isDone ? inquiryCardDoneStyle : {}),
                }}
              >
                <div style={inquiryHeaderStyle}>
                  <div>
                    <h3 style={inquiryTitleStyle}>Kontaktanfrage</h3>
                    <p style={inquiryMetaStyle}>
                      {message.created_at
                        ? new Date(message.created_at).toLocaleString("de-DE")
                        : "Kein Datum"}
                    </p>
                  </div>

                  <span
                    style={{
                      ...statusBadgeStyle,
                      ...getStatusStyle(status),
                    }}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div style={inquiryInfoGridStyle}>
                  <div style={inquiryInfoBoxStyle}>
                    <span style={inquiryInfoLabelStyle}>Name</span>
                    <strong>{message.name}</strong>
                  </div>

                  <div style={inquiryInfoBoxStyle}>
                    <span style={inquiryInfoLabelStyle}>E-Mail</span>
                    <a
                      href={"mailto:" + message.email}
                      style={{ color: "#556b5d" }}
                    >
                      {message.email}
                    </a>
                  </div>
                </div>

                <p style={inquiryMessageStyle}>{message.message}</p>

                <div style={adminSelectedExtrasStyle}>
                  <strong>Status ändern:</strong>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(message.id, "neu")}
                      style={reopenInquiryButtonStyle}
                    >
                      Neu
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(message.id, "in_bearbeitung")}
                      style={compactEditButtonStyle}
                    >
                      In Bearbeitung
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(message.id, "erledigt")}
                      style={completeInquiryButtonStyle}
                    >
                      Erledigt
                    </button>
                  </div>
                </div>

                <div style={inquiryActionRowStyle}>
                  <a
                    href={
                      "mailto:" +
                      message.email +
                      "?subject=" +
                      encodeURIComponent(
                        "Antwort auf deine Kontaktanfrage bei Camp Oase"
                      ) +
                      "&body=" +
                      encodeURIComponent(
                        "Hallo " +
                          message.name +
                          ",\n\nvielen Dank für deine Nachricht an Camp Oase.\n\n"
                      )
                    }
                    style={{ ...compactEditButtonStyle, textDecoration: "none" }}
                  >
                    Antworten
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteMessage(message.id)}
                    style={compactDeleteButtonStyle}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
