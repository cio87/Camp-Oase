import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  announcementBannerBadgeStyle,
  announcementBannerInnerStyle,
  announcementBannerLinkStyle,
  announcementBannerMarqueeStyle,
  announcementBannerTextViewportStyle,
  announcementBannerTextWrapStyle,
  announcementBannerStyle,
} from "../styles";

function getSafeAnnouncementLink(value) {
  const link = String(value || "").trim();

  if (!link) return "";
  if (link.startsWith("/")) return link;

  try {
    const url = new URL(link);
    if (url.protocol === "https:" || url.protocol === "http:") return link;
  } catch {
    return "";
  }

  return "";
}

export default function AnnouncementBanner() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (!error) setSettings(data || null);
    }

    loadSettings();
  }, []);

  if (!settings?.announcement_enabled || !settings?.announcement_text?.trim()) {
    return null;
  }

  const text = settings.announcement_text.trim();
  const safeLink = getSafeAnnouncementLink(settings.announcement_link);
  const isMarquee = settings.announcement_mode === "marquee";
  const textContent = (
    <span style={announcementBannerTextViewportStyle}>
      <span style={isMarquee ? announcementBannerMarqueeStyle : undefined}>
        {text}
      </span>
    </span>
  );
  const content = (
    <span style={announcementBannerTextWrapStyle}>
      <span style={announcementBannerBadgeStyle}>Hinweis</span>
      {safeLink ? (
        <a href={safeLink} style={announcementBannerLinkStyle}>
          {textContent}
        </a>
      ) : (
        textContent
      )}
    </span>
  );

  return (
    <div style={announcementBannerStyle}>
      <style>
        {"@keyframes campoase-marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }"}
      </style>
      <div
        style={{
          ...announcementBannerInnerStyle,
          whiteSpace: isMarquee ? "nowrap" : "normal",
        }}
      >
        {content}
      </div>
    </div>
  );
}
