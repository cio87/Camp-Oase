import { useEffect, useState } from "react";
import SiteFooter from "./SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buttonStyle,
  inputStyle,
  pageStyle,
  sectionTitleStyle,
  siteStyle,
} from "../styles";

const PREVIEW_STORAGE_KEY = "campoase_maintenance_preview_password";

const maintenanceCardStyle = {
  maxWidth: "760px",
  margin: "clamp(44px, 10vw, 96px) auto",
  background: "linear-gradient(135deg, #ffffff, #fbf7ed)",
  border: "1px solid #e8dfcf",
  borderRadius: "28px",
  padding: "clamp(28px, 6vw, 48px)",
  boxShadow: "0 18px 42px rgba(0,0,0,0.08)",
  color: "#4f5b51",
  lineHeight: "1.8",
  textAlign: "center",
};

const maintenanceBadgeStyle = {
  display: "inline-block",
  background: "#eef3ea",
  color: "#556b5d",
  border: "1px solid #d8e1d3",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "16px",
};

const previewBoxStyle = {
  maxWidth: "420px",
  margin: "26px auto 0",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid #e8dfcf",
  background: "#fffdf8",
};

export default function MaintenanceGate({ children }) {
  const [settings, setSettings] = useState(null);
  const [previewPassword, setPreviewPassword] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewUnlocked, setPreviewUnlocked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenanceSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "maintenance_enabled,maintenance_title,maintenance_text,maintenance_password"
        )
        .eq("id", "main")
        .maybeSingle();

      if (!isMounted) return;

      if (error || !data) {
        setSettings({ maintenance_enabled: false });
        return;
      }

      setSettings(data);
    }

    loadMaintenanceSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const password = String(settings?.maintenance_password || "").trim();

    if (!settings?.maintenance_enabled || !password) {
      setPreviewUnlocked(false);
      return;
    }

    try {
      setPreviewUnlocked(sessionStorage.getItem(PREVIEW_STORAGE_KEY) === password);
    } catch {
      setPreviewUnlocked(false);
    }
  }, [settings]);

  if (!settings || !settings.maintenance_enabled || previewUnlocked) {
    return children;
  }

  const title =
    settings.maintenance_title?.trim() || "Camp Oase macht kurz Pause";
  const text =
    settings.maintenance_text?.trim() ||
    "Wir arbeiten gerade an der Seite. Bitte sp\u00e4ter wieder vorbeischauen.";
  const configuredPassword = String(settings.maintenance_password || "").trim();
  const hasPreviewAccess = Boolean(configuredPassword);

  function unlockPreview(event) {
    event.preventDefault();
    setPreviewError("");

    if (!configuredPassword || previewPassword.trim() !== configuredPassword) {
      setPreviewError("Das Passwort stimmt leider nicht.");
      return;
    }

    try {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, configuredPassword);
    } catch {
      // If sessionStorage is unavailable, the current render can still be unlocked.
    }

    setPreviewUnlocked(true);
  }

  return (
    <div style={siteStyle}>
      <main style={pageStyle}>
        <section style={maintenanceCardStyle}>
          <span style={maintenanceBadgeStyle}>Wartungsmodus</span>
          <h1 style={{ ...sectionTitleStyle, color: "#435749", marginBottom: "12px" }}>
            {title}
          </h1>
          <p style={{ maxWidth: "620px", margin: "0 auto 24px" }}>{text}</p>
          <a
            href="mailto:service@camp-oase.de"
            style={{ ...buttonStyle, display: "inline-block", textDecoration: "none" }}
          >
            Kontakt per E-Mail
          </a>

          {hasPreviewAccess && (
            <form onSubmit={unlockPreview} style={previewBoxStyle}>
              <h2
                style={{
                  margin: "0 0 10px",
                  color: "#435749",
                  fontSize: "18px",
                }}
              >
                Vorschau-Zugang
              </h2>
              <input
                type="password"
                value={previewPassword}
                onChange={(event) => setPreviewPassword(event.target.value)}
                placeholder="Passwort"
                autoComplete="current-password"
                style={{ ...inputStyle, marginBottom: "10px" }}
              />
              <button type="submit" style={{ ...buttonStyle, width: "100%" }}>
                Webseite ansehen
              </button>
              {previewError && (
                <p style={{ margin: "10px 0 0", color: "#8a4d32", fontWeight: "bold" }}>
                  {previewError}
                </p>
              )}
            </form>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
