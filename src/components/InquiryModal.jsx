import {
  calculateEstimatedTotal,
  formatEuro,
  getProductExtras,
} from "../utils/price";
import {
  disabledButtonStyle,
  errorBoxStyle,
  extraChoiceCardStyle,
  extraDescriptionStyle,
  extrasBoxStyle,
  fullButtonStyle,
  inputStyle,
  labelStyle,
  modalBadgeStyle,
  modalCloseButtonStyle,
  modalHeaderStyle,
  modalIntroStyle,
  modalOverlayStyle,
  modalProductBoxStyle,
  modalProductLabelStyle,
  modalProductPriceStyle,
  modalProductTitleStyle,
  modalStyle,
  modalTitleStyle,
  privacyHintStyle,
  successBoxStyle,
  totalBoxStyle,
} from "../styles";

export default function InquiryModal({
  product,
  form,
  setForm,
  status,
  sending,
  onClose,
  onSubmit,
  extrasLocked = false,
  inquiryMode = "question",
  submitButtonText = "Frage absenden",
}) {
  const customExtras = getProductExtras(product);
  const showSelectedExtrasSummary = inquiryMode === "selection" && extrasLocked;
  const estimatedTotal = calculateEstimatedTotal(product, form);
  const selectedItems = customExtras
    .map((extra, index) => ({
      ...extra,
      note: form.selectedExtras?.[index]?.note || "",
      selected: form.selectedExtras?.[index]?.selected || false,
    }))
    .filter((extra) => extra.selected);

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={modalCloseButtonStyle}>
          ×
        </button>

        <div style={modalHeaderStyle}>
          <span style={modalBadgeStyle}>Anfrage</span>

          <h2 style={modalTitleStyle}>Produkt unverbindlich anfragen</h2>

          <p style={modalIntroStyle}>
            Schreib uns kurz, was du wissen möchtest. Wir melden uns so schnell
            wie möglich bei dir zurück.
          </p>
        </div>

        <div style={modalProductBoxStyle}>
          <div>
            <span style={modalProductLabelStyle}>Ausgewähltes Produkt</span>
            <strong style={modalProductTitleStyle}>{product.title}</strong>
          </div>

          <span style={modalProductPriceStyle}>{product.price}</span>
        </div>

        <form onSubmit={onSubmit}>
          {showSelectedExtrasSummary && selectedItems.length > 0 && (
            <div style={extrasBoxStyle}>
              <h3 style={{ marginTop: 0, color: "#435749" }}>
                Ausgewählte Extras
              </h3>

              {selectedItems.map((extra, index) => (
                <div key={extra.name + "-" + index} style={extraChoiceCardStyle}>
                  <strong>
                    {extra.name} +{formatEuro(extra.price)}
                  </strong>

                  {extra.description && (
                    <p style={extraDescriptionStyle}>{extra.description}</p>
                  )}

                  {extra.note && (
                    <p style={extraDescriptionStyle}>Hinweis: {extra.note}</p>
                  )}
                </div>
              ))}

              <div style={totalBoxStyle}>
                Voraussichtlicher Gesamtpreis: <strong>{estimatedTotal}</strong>
              </div>
            </div>
          )}

          <label style={labelStyle}>Dein Name</label>
          <input
            required
            placeholder="z. B. Max Mustermann"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Deine E-Mail-Adresse</label>
          <input
            required
            type="email"
            placeholder="z. B. max@mail.de"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Deine Nachricht</label>
          <textarea
            required
            placeholder="Was möchtest du wissen?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, minHeight: "170px", lineHeight: "1.6" }}
          />

          <p style={privacyHintStyle}>
            Deine Anfrage wird nur zur Bearbeitung deiner Nachricht gespeichert.
          </p>

          <button disabled={sending} style={sending ? disabledButtonStyle : fullButtonStyle}>
            {sending ? "Wird gesendet..." : submitButtonText}
          </button>

          {status === "success" && (
            <div style={successBoxStyle}>
              Danke! Deine Anfrage wurde erfolgreich gesendet.
            </div>
          )}

          {status === "error" && (
            <div style={errorBoxStyle}>
              Die Anfrage konnte leider nicht gesendet werden. Bitte versuche es
              erneut.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
