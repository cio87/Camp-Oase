import { Link } from "react-router-dom";
import {
  footerDotStyle,
  footerLinkStyle,
  footerStyle,
} from "../styles";

const footerLinks = [
  { to: "/impressum", label: "Impressum" },
  { to: "/datenschutz", label: "Datenschutz" },
  { to: "/versand-zahlung", label: "Versand & Zahlung" },
  { to: "/widerruf", label: "Widerruf" },
  { to: "/anfragebedingungen", label: "AGB" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/camp.oase/",
    label: "Instagram",
    ariaLabel: "Camp Oase auf Instagram",
  },
];

const footerLinksRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "4px 0",
};

const socialRowStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
  width: "100%",
};

const socialIconLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid #d8e1d3",
  background: "#fffdf8",
  color: "#435749",
  textDecoration: "none",
  boxShadow: "0 8px 18px rgba(47, 58, 52, 0.08)",
};

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3.6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer
      style={{
        ...footerStyle,
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={socialRowStyle}>
        {socialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.ariaLabel}
            title={link.label}
            style={socialIconLinkStyle}
          >
            <InstagramIcon />
          </a>
        ))}
      </div>

      <div style={footerLinksRowStyle}>
        <span style={{ whiteSpace: "nowrap" }}>{"\u00a9"} Camp Oase</span>

        {footerLinks.map((link) => (
          <span key={link.to} style={{ whiteSpace: "nowrap" }}>
            <span style={footerDotStyle}>{"\u00b7"}</span>
            <Link to={link.to} style={footerLinkStyle}>
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
