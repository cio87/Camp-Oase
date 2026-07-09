import {
  adminExtraLabelStyle,
  adminHintStyle,
  buttonStyle,
  checkboxRowStyle,
  formStyle,
  inputStyle,
  successBoxStyle,
} from "../styles";

export default function AdminSiteSettings({
  settings,
  setSettings,
  saving,
  saveStatus,
  onSave,
  invoiceSettings,
  numberSettingsSaving,
  numberSettingsStatus,
  getNextSequenceLabel,
  onInvoiceModeChange,
  onResetTestSequences,
}) {
  const invoiceMode = invoiceSettings?.invoice_mode === "live" ? "live" : "test";
  const sequenceLabel = (id) =>
    getNextSequenceLabel ? getNextSequenceLabel(id) : "Noch nicht geladen";

  return (
    <form onSubmit={onSave} style={formStyle}>
      <h2>Wartungsmodus</h2>
      <p style={adminHintStyle}>
        Wenn der Wartungsmodus aktiv ist, sehen Besucher eine ruhige
        Wartungsseite. Der Adminbereich bleibt erreichbar.
      </p>

      <label style={checkboxRowStyle}>
        <input
          type="checkbox"
          checked={Boolean(settings.maintenance_enabled)}
          onChange={(e) =>
            setSettings({
              ...settings,
              maintenance_enabled: e.target.checked,
            })
          }
        />
        Wartungsmodus aktivieren
      </label>

      <label style={adminExtraLabelStyle}>Wartungsmodus Überschrift</label>
      <input
        placeholder="z. B. Camp Oase macht kurz Pause"
        value={settings.maintenance_title || ""}
        onChange={(e) =>
          setSettings({ ...settings, maintenance_title: e.target.value })
        }
        style={inputStyle}
      />

      <label style={adminExtraLabelStyle}>Wartungsmodus Text</label>
      <textarea
        placeholder="Kurzer Hinweis für Besucher während der Wartung."
        value={settings.maintenance_text || ""}
        onChange={(e) =>
          setSettings({ ...settings, maintenance_text: e.target.value })
        }
        style={{ ...inputStyle, minHeight: "90px" }}
      />

      <label style={adminExtraLabelStyle}>Vorschau-Passwort</label>
      <input
        type="password"
        placeholder="Leer lassen, wenn kein Vorschau-Zugang möglich sein soll"
        value={settings.maintenance_password || ""}
        onChange={(e) =>
          setSettings({ ...settings, maintenance_password: e.target.value })
        }
        autoComplete="new-password"
        style={inputStyle}
      />
      <p style={adminHintStyle}>
        Wenn ein Passwort gesetzt ist, kann die öffentliche Webseite im
        Wartungsmodus über den Vorschau-Zugang angesehen werden.
      </p>

      <hr style={{ margin: "28px 0", border: "none", borderTop: "1px solid #e8dfcf" }} />

      <h2>Hinweis-Banner</h2>
      <p style={adminHintStyle}>
        Dieser Banner erscheint auf der öffentlichen Webseite, wenn er aktiv ist.
      </p>

      <label style={checkboxRowStyle}>
        <input
          type="checkbox"
          checked={Boolean(settings.announcement_enabled)}
          onChange={(e) =>
            setSettings({
              ...settings,
              announcement_enabled: e.target.checked,
            })
          }
        />
        Banner aktivieren
      </label>

      <label style={adminExtraLabelStyle}>Banner-Text</label>
      <textarea
        placeholder="z. B. Sommeraktion: 10 % auf ausgewählte Produkte"
        value={settings.announcement_text || ""}
        onChange={(e) =>
          setSettings({ ...settings, announcement_text: e.target.value })
        }
        style={{ ...inputStyle, minHeight: "90px" }}
      />

      <label style={adminExtraLabelStyle}>Modus</label>
      <select
        value={settings.announcement_mode || "static"}
        onChange={(e) =>
          setSettings({ ...settings, announcement_mode: e.target.value })
        }
        style={inputStyle}
      >
        <option value="static">Static - steht still</option>
        <option value="marquee">Marquee - dezente Laufschrift</option>
      </select>

      <label style={adminExtraLabelStyle}>Link optional</label>
      <input
        placeholder="z. B. /#produkte oder https://..."
        value={settings.announcement_link || ""}
        onChange={(e) =>
          setSettings({ ...settings, announcement_link: e.target.value })
        }
        style={inputStyle}
      />

      <button disabled={saving} style={buttonStyle}>
        {saving ? "Wird gespeichert..." : "Webseite speichern"}
      </button>

      {saveStatus === "success" && (
        <div style={successBoxStyle}>Webseiten-Einstellungen gespeichert.</div>
      )}

      <hr style={{ margin: "28px 0", border: "none", borderTop: "1px solid #e8dfcf" }} />

      <h2>Checkout-Vorbereitung</h2>
      <p style={adminHintStyle}>
        Diese Einstellungen bereiten einen späteren Checkout vor. Es wird noch
        kein Zahlungsanbieter aktiviert.
      </p>

      <label style={checkboxRowStyle}>
        <input
          type="checkbox"
          checked={Boolean(settings.checkout_enabled)}
          onChange={(e) =>
            setSettings({
              ...settings,
              checkout_enabled: e.target.checked,
            })
          }
        />
        Checkout aktivieren
      </label>

      <label style={checkboxRowStyle}>
        <input
          type="checkbox"
          checked={Boolean(settings.payment_enabled)}
          onChange={(e) =>
            setSettings({
              ...settings,
              payment_enabled: e.target.checked,
            })
          }
        />
        Zahlung aktivieren
      </label>

      <p style={adminHintStyle}>
        PayPal Checkout ist nur vorbereitet. Die spätere Client ID wird über
        <code> VITE_PAYPAL_CLIENT_ID </code>
        gesetzt. Ohne diese Variable erscheint im Checkout kein Zahlungsbutton.
      </p>

      <label style={adminExtraLabelStyle}>Checkout-Hinweistext</label>
      <textarea
        placeholder="z. B. Der Checkout ist aktuell noch nicht aktiviert."
        value={settings.checkout_notice || ""}
        onChange={(e) =>
          setSettings({ ...settings, checkout_notice: e.target.value })
        }
        style={{ ...inputStyle, minHeight: "90px" }}
      />

      <hr style={{ margin: "28px 0", border: "none", borderTop: "1px solid #e8dfcf" }} />

      <h2>Rechnungsnummern</h2>
      <p style={adminHintStyle}>
        Hier steuerst du, ob neue Rechnungen Test- oder Live-Nummern erhalten.
        Live-Zähler können bewusst nicht zurückgesetzt werden.
      </p>

      <div
        style={{
          display: "grid",
          gap: "12px",
          margin: "16px 0",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #e8dfcf",
          background: "#fffdf8",
        }}
      >
        <strong>Aktueller Modus: {invoiceMode === "live" ? "Live" : "Test"}</strong>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "10px",
          }}
        >
          {[
            ["Nächste Test-Rechnungsnummer", "test_invoice"],
            ["Nächste Live-Rechnungsnummer", "live_invoice"],
            ["Nächste Test-Kundennummer", "test_customer"],
            ["Nächste Live-Kundennummer", "live_customer"],
            ["Nächste Test-Bestellnummer", "test_order"],
            ["Nächste Live-Bestellnummer", "live_order"],
          ].map(([label, id]) => (
            <div
              key={id}
              style={{
                border: "1px solid #edf2e8",
                borderRadius: "12px",
                padding: "10px 12px",
                background: "#f8f2e6",
              }}
            >
              <small style={{ display: "block", color: "#637064" }}>{label}</small>
              <strong>{sequenceLabel(id)}</strong>
            </div>
          ))}
        </div>

        <label style={adminExtraLabelStyle}>Modus für neue Rechnungen</label>
        <select
          value={invoiceMode}
          onChange={(e) => onInvoiceModeChange?.(e.target.value)}
          disabled={numberSettingsSaving}
          style={inputStyle}
        >
          <option value="test">Testmodus</option>
          <option value="live">Livemodus</option>
        </select>

        <button
          type="button"
          onClick={onResetTestSequences}
          disabled={numberSettingsSaving}
          style={{
            ...buttonStyle,
            background: "#f7e7e1",
            color: "#8a4d32",
          }}
        >
          {numberSettingsSaving ? "Wird gespeichert..." : "Test-Zähler zurücksetzen"}
        </button>

        <p style={{ ...adminHintStyle, margin: "0" }}>
          Der Reset setzt nur die nächsten Testnummern zurück. Bereits erzeugte
          Test-Rechnungen behalten ihre gespeicherten Nummern.
        </p>

        {numberSettingsStatus === "mode-success" && (
          <div style={successBoxStyle}>Rechnungsmodus gespeichert.</div>
        )}

        {numberSettingsStatus === "reset-success" && (
          <div style={successBoxStyle}>Test-Zähler wurden zurückgesetzt.</div>
        )}
      </div>
    </form>
  );
}
