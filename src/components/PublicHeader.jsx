import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CART_UPDATED_EVENT, getCartItemCount } from "../utils/cart";
import {
  brandTextStyle,
  hamburgerButtonStyle,
  headerBrandLinkStyle,
  headerStyle,
  logoStyle,
  menuCloseButtonStyle,
  menuHeaderStyle,
  menuLinkStyle,
  menuOverlayOpenStyle,
  menuOverlayStyle,
  menuPanelOpenStyle,
  menuPanelStyle,
} from "../styles";

export default function PublicHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function updateCartCount() {
      setCartCount(getCartItemCount());
    }

    updateCartCount();
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const menuLinks = [
    { to: "/#produkte", label: "Produkte" },
    { to: "/ueber-uns", label: "Über uns" },
    { to: "/kontakt", label: "Kontakt" },
    {
      to: "/warenkorb",
      label: `Warenkorb${cartCount > 0 ? ` (${cartCount})` : ""}`,
    },
  ];

  return (
    <header style={headerStyle}>
      <Link to="/" style={headerBrandLinkStyle}>
        <img src="/logo.png" alt="Camp Oase Logo" style={logoStyle} />
        <strong style={brandTextStyle}>Camp Oase</strong>
      </Link>

      <button
        type="button"
        style={hamburgerButtonStyle}
        onClick={() => setMenuOpen(true)}
        aria-label="Menü öffnen"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <div
        style={{
          ...menuOverlayStyle,
          ...(menuOpen ? menuOverlayOpenStyle : {}),
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        style={{
          ...menuPanelStyle,
          ...(menuOpen ? menuPanelOpenStyle : {}),
        }}
        aria-hidden={!menuOpen}
      >
        <div style={menuHeaderStyle}>
          <strong style={brandTextStyle}>Menü</strong>
          <button
            type="button"
            style={menuCloseButtonStyle}
            onClick={() => setMenuOpen(false)}
            aria-label="Menü schließen"
          >
            ×
          </button>
        </div>

        <nav
          style={{ display: "grid", gap: "10px", marginTop: "8px" }}
          aria-label="Hauptnavigation"
        >
          {menuLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={menuLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </aside>
    </header>
  );
}
