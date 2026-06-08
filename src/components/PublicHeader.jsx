import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CART_UPDATED_EVENT, getCartItemCount } from "../utils/cart";
import {
  brandTextStyle,
  headerNavLinkStyle,
  headerNavStyle,
  headerStyle,
  logoStyle,
} from "../styles";

export default function PublicHeader() {
  const [cartCount, setCartCount] = useState(0);

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
        <Link to="/warenkorb" style={headerNavLinkStyle}>
          Warenkorb{cartCount > 0 ? ` (${cartCount})` : ""}
        </Link>
      </nav>
    </header>
  );
}
