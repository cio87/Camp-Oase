import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CART_UPDATED_EVENT, getCartItemCount } from "../utils/cart";
import {
  brandTextStyle,
  hamburgerButtonStyle,
  headerBrandLinkStyle,
  headerNavLinkStyle,
  headerNavStyle,
  headerStyle,
  logoStyle,
  menuCloseButtonStyle,
  menuHeaderStyle,
  menuLinkStyle,
  menuOverlayStyle,
  menuPanelStyle,
} from "../styles";

const DESKTOP_MEDIA_QUERY = "(min-width: 900px)";

export default function PublicHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      : false
  );
  const menuButtonRef = useRef(null);
  const menuCloseButtonRef = useRef(null);

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
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    function updateDesktopState() {
      const matchesDesktop = mediaQuery.matches;
      setIsDesktop(matchesDesktop);

      if (matchesDesktop) {
        setMenuOpen(false);
      }
    }

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopState);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    window.setTimeout(() => menuCloseButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }

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
        <img src="/logo.png" alt="Camp Oase" style={logoStyle} />
        <strong style={brandTextStyle}>Camp Oase</strong>
      </Link>

      {isDesktop ? (
        <nav style={headerNavStyle} aria-label="Hauptnavigation">
          {menuLinks.map((link) => (
            <Link key={link.to} to={link.to} style={headerNavLinkStyle}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : (
        <button
          ref={menuButtonRef}
          type="button"
          style={hamburgerButtonStyle}
          onClick={() => setMenuOpen(true)}
          aria-label="Menü öffnen"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
      )}

      {menuOpen && !isDesktop && (
        <div style={menuOverlayStyle} onClick={closeMenu}>
          <section
            style={menuPanelStyle}
            onClick={(event) => event.stopPropagation()}
            aria-label="Mobiles Hauptmenü"
          >
            <div style={menuHeaderStyle}>
              <strong style={brandTextStyle}>Menü</strong>
              <button
                ref={menuCloseButtonRef}
                type="button"
                style={menuCloseButtonStyle}
                onClick={closeMenu}
                aria-label="Menü schließen"
              >
                ×
              </button>
            </div>

            <nav
              style={{ display: "grid", gap: "12px", marginTop: "12px" }}
              aria-label="Hauptnavigation"
            >
              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={menuLinkStyle}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        </div>
      )}
    </header>
  );
}
