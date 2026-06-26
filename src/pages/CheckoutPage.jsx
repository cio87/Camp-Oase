import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buttonStyle,
  cartEmptyStyle,
  cartPageStyle,
  pageStyle,
  pillBackLinkStyle,
  sectionTitleStyle,
  siteStyle,
} from "../styles";

export default function CheckoutPage() {
  const [settings, setSettings] = useState({
    checkout_enabled: false,
    payment_enabled: false,
    checkout_notice: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("checkout_enabled,payment_enabled,checkout_notice")
        .eq("id", "main")
        .maybeSingle();

      if (!error && data) {
        setSettings({
          checkout_enabled: Boolean(data.checkout_enabled),
          payment_enabled: Boolean(data.payment_enabled),
          checkout_notice: data.checkout_notice || "",
        });
      }
    }

    loadSettings();
  }, []);

  const notice =
    settings.checkout_notice ||
    "Der Checkout ist aktuell noch nicht aktiviert. Du kannst deinen Warenkorb weiterhin unverbindlich anfragen.";

  return (
    <div style={siteStyle}>
      <PublicHeader />

      <main style={pageStyle}>
        <div style={cartPageStyle}>
          <Link to="/warenkorb" style={pillBackLinkStyle}>
            ← Zurück zum Warenkorb
          </Link>

          <div style={{ ...cartEmptyStyle, marginTop: "22px" }}>
            <h1 style={sectionTitleStyle}>Checkout in Vorbereitung</h1>

            <p>{notice}</p>

            {settings.checkout_enabled && (
              <p>
                Der technische Checkout-Schalter ist vorbereitet, aber es ist
                noch kein Live-Kauf und keine echte Zahlung aktiv.
              </p>
            )}

            {settings.payment_enabled && (
              <p>
                Zahlung ist im Admin vorbereitet, aber noch nicht mit einem
                Zahlungsanbieter verbunden.
              </p>
            )}

            <Link
              to="/warenkorb"
              style={{ ...buttonStyle, display: "inline-block", textDecoration: "none" }}
            >
              Warenkorb unverbindlich anfragen
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
