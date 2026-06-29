import { useEffect, useState } from "react";
import SiteFooter from "./SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buttonStyle,
  pageStyle,
  sectionTitleStyle,
  siteStyle,
} from "../styles";

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

export default function MaintenanceGate({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenanceSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("maintenance_enabled,maintenance_title,maintenance_text")
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

  if (!settings || !settings.maintenance_enabled) {
    return children;
  }

  const title =
    settings.maintenance_title?.trim() || "Camp Oase macht kurz Pause";
  const text =
    settings.maintenance_text?.trim() ||
    "Wir arbeiten gerade an der Webseite, damit hier bald alles wieder ruhig, schön und zuverlässig funktioniert. Schau gern später noch einmal vorbei.";

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
            href="mailto:campoasesupport@gmail.com"
            style={{ ...buttonStyle, display: "inline-block", textDecoration: "none" }}
          >
            Kontakt per E-Mail
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
