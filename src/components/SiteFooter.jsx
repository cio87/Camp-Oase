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

export default function SiteFooter() {
  return (
    <footer style={footerStyle}>
      <span>{"\u00a9"} Camp Oase</span>

      {footerLinks.map((link) => (
        <span key={link.to}>
          <span style={footerDotStyle}>{"\u00b7"}</span>
          <Link to={link.to} style={footerLinkStyle}>
            {link.label}
          </Link>
        </span>
      ))}

    </footer>
  );
}
