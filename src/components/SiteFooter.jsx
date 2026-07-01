import { Link } from "react-router-dom";
import {
  footerDotStyle,
  footerLinkStyle,
  footerLoginStyle,
  footerStyle,
} from "../styles";

export default function SiteFooter() {
  return (
    <footer style={footerStyle}>
      <span>© Camp Oase</span>

      <span style={footerDotStyle}>·</span>

      <Link to="/impressum" style={footerLinkStyle}>
        Impressum
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/datenschutz" style={footerLinkStyle}>
        Datenschutz
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/versand-zahlung" style={footerLinkStyle}>
        Versand & Zahlung
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/widerruf" style={footerLinkStyle}>
        Widerruf
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/admin" style={footerLoginStyle}>
        Login
      </Link>
    </footer>
  );
}
