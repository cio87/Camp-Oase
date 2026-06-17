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
}) {
  return (
    <form onSubmit={onSave} style={formStyle}>
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
        {saving ? "Wird gespeichert..." : "Banner speichern"}
      </button>

      {saveStatus === "success" && (
        <div style={successBoxStyle}>Banner-Einstellungen gespeichert.</div>
      )}
    </form>
  );
}
