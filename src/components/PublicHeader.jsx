import { Link } from "react-router-dom";
import {
  brandTextStyle,
  headerNavLinkStyle,
  headerNavStyle,
  headerStyle,
  logoStyle,
} from "../styles";

export default function PublicHeader() {
  return (
    <header style={headerStyle}>
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <img src="/logo.png" alt="Camp Oase Logo" style={logoStyle} />
        <strong style={brandTextStyle}>Camp Oase</strong>
      </Link>

      <nav style={headerNavStyle} aria-label="Hauptnavigation">
        <Link to="/#produkte" style={headerNavLinkStyle}>
          Produkte
        </Link>
        <Link to="/ueber-uns" style={headerNavLinkStyle}>
          Über uns
        </Link>
        <Link to="/kontakt" style={headerNavLinkStyle}>
          Kontakt
        </Link>
      </nav>
    </header>
  );
}
