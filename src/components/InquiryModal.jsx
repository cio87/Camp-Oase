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
  extraOptionStyle,
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
}) {
  const customExtras = getProductExtras(product);
  const extrasEnabled = customExtras.length > 0;
  const estimatedTotal = calculateEstimatedTotal(product, form);

  function toggleExtra(index, checked) {
    setForm({
      ...form,
      selectedExtras: {
        ...(form.selectedExtras || {}),
        [index]: {
          ...(form.selectedExtras?.[index] || {}),
          selected: checked,
        },
      },
    });
  }

  function updateExtraNote(index, note) {
    setForm({
      ...form,
      selectedExtras: {
        ...(form.selectedExtras || {}),
        [index]: {
          ...(form.selectedExtras?.[index] || {}),
          selected: true,
          note,
        },
      },
    });
  }

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
          {extrasEnabled && (
            <div style={extrasBoxStyle}>
              <h3 style={{ marginTop: 0, color: "#435749" }}>
                Extras auswählen
              </h3>

              {customExtras.map((extra, index) => {
                const isSelected =
                  form.selectedExtras?.[index]?.selected || false;

                return (
                  <div key={`${extra.name}-${index}`} style={extraChoiceCardStyle}>
                    <label style={extraOptionStyle}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleExtra(index, e.target.checked)}
                      />
                      <span>
                        {extra.name} +{formatEuro(extra.price)}
                      </span>
                    </label>

                    {extra.description && (
                      <p style={extraDescriptionStyle}>{extra.description}</p>
                    )}

                    {isSelected && (
                      <input
                        placeholder="Hinweis oder Wunsch zu diesem Extra"
                        value={form.selectedExtras?.[index]?.note || ""}
                        onChange={(e) => updateExtraNote(index, e.target.value)}
                        style={inputStyle}
                      />
                    )}
                  </div>
                );
              })}

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
            {sending ? "Wird gesendet..." : "Anfrage absenden"}
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

