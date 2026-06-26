import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buildCartMessage,
  buildCartSelectedExtras,
  clearCart,
  getCartItems,
  getCartSubtotal,
} from "../utils/cart";
import { formatEuro } from "../utils/price";
import {
  buttonStyle,
  cartEmptyStyle,
  cartImageStyle,
  cartItemStyle,
  cartPageStyle,
  cartSummaryStyle,
  errorBoxStyle,
  inputStyle,
  labelStyle,
  pageStyle,
  pillBackLinkStyle,
  productCardHintStyle,
  sectionTitleStyle,
  siteStyle,
  successBoxStyle,
} from "../styles";

const emptyCheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  zip: "",
  city: "",
  message: "",
};

const fieldLabels = {
  firstName: "Bitte gib deinen Vornamen ein.",
  lastName: "Bitte gib deinen Nachnamen ein.",
  email: "Bitte gib deine E-Mail-Adresse ein.",
  street: "Bitte gib Straße und Hausnummer ein.",
  zip: "Bitte gib deine PLZ ein.",
  city: "Bitte gib deinen Ort ein.",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
  gap: "12px 16px",
};

const fieldErrorStyle = {
  color: "#9b4d4d",
  fontSize: "13px",
  fontWeight: "bold",
  margin: "-4px 0 8px",
};

const addressHintStyle = {
  background: "linear-gradient(135deg, #f7f1e3, #eef3ea)",
  border: "1px solid #dbe4d4",
  borderRadius: "18px",
  padding: "14px 16px",
  color: "#556b5d",
  lineHeight: "1.6",
  fontSize: "14px",
  margin: "18px 0 8px",
};

export default function CheckoutPage() {
  const [settings, setSettings] = useState({
    checkout_enabled: false,
    payment_enabled: false,
    checkout_notice: "",
  });
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyCheckoutForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const subtotalLabel = formatEuro(subtotal);

  useEffect(() => {
    setItems(getCartItems());
    loadSettings();
  }, []);

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

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
    setStatus("");
  }

  function validateForm() {
    const nextErrors = {};

    Object.entries(fieldLabels).forEach(([field, message]) => {
      if (!String(form[field] || "").trim()) {
        nextErrors[field] = message;
      }
    });

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Bitte gib eine gültige E-Mail-Adresse ein.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function buildCheckoutMessage() {
    const customerLines = [
      "Kundendaten:",
      `Vorname: ${form.firstName}`,
      `Nachname: ${form.lastName}`,
      `E-Mail: ${form.email}`,
      form.phone ? `Telefon: ${form.phone}` : "",
      `Adresse: ${form.street}, ${form.zip} ${form.city}`,
      form.message ? `Nachricht: ${form.message}` : "",
      "",
    ].filter(Boolean);

    return [
      ...customerLines,
      buildCartMessage(items, subtotalLabel),
      "",
      "Hinweis: Diese Anfrage wurde über die Checkout-Vorschau gesendet. Es wurde keine Zahlung ausgelöst.",
    ].join("\n");
  }

  async function submitCheckoutInquiry(e) {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("validation");
      return;
    }

    setSending(true);
    setStatus("");

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const { error } = await supabase.from("inquiries").insert([
      {
        product_title: "Checkout-Anfrage",
        name: fullName,
        email: form.email.trim(),
        message: buildCheckoutMessage(),
        selected_extras: {
          ...buildCartSelectedExtras(items),
          checkout_preview: true,
          customer_first_name: form.firstName.trim(),
          customer_last_name: form.lastName.trim(),
          customer_phone: form.phone.trim(),
          shipping_address: {
            street: form.street.trim(),
            zip: form.zip.trim(),
            city: form.city.trim(),
          },
        },
        estimated_total: subtotalLabel,
        status: "offen",
      },
    ]);

    setSending(false);

    if (error) {
      console.log(error);
      setStatus("error");
      return;
    }

    setStatus("success");
    clearCart();
    setItems([]);
  }

  function renderInput(field, label, options = {}) {
    return (
      <div>
        <label style={labelStyle}>
          {label}
          {options.required ? " *" : ""}
        </label>
        <input
          type={options.type || "text"}
          value={form[field]}
          onChange={(e) => updateField(field, e.target.value)}
          style={{
            ...inputStyle,
            borderColor: errors[field] ? "#d59b9b" : inputStyle.border,
          }}
        />
        {errors[field] && <p style={fieldErrorStyle}>{errors[field]}</p>}
      </div>
    );
  }

  const notice =
    settings.checkout_notice ||
    "Der Checkout ist aktuell noch nicht aktiviert. Du kannst deinen Warenkorb weiterhin unverbindlich anfragen.";

  if (!settings.checkout_enabled) {
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

              <Link
                to="/warenkorb"
                style={{
                  ...buttonStyle,
                  display: "inline-block",
                  textDecoration: "none",
                }}
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

  return (
    <div style={siteStyle}>
      <PublicHeader />

      <main style={pageStyle}>
        <div style={cartPageStyle}>
          <Link to="/warenkorb" style={pillBackLinkStyle}>
            ← Zurück zum Warenkorb
          </Link>

          <div style={{ marginTop: "24px", marginBottom: "22px" }}>
            <h1 style={{ ...sectionTitleStyle, marginBottom: "8px" }}>
              Bestellung prüfen
            </h1>
            <p style={{ color: "#667", lineHeight: "1.6", maxWidth: "760px" }}>
              Dies ist aktuell noch kein Live-Kauf. Deine Bestellung wird
              unverbindlich angefragt.
            </p>
          </div>

          {items.length === 0 ? (
            <div style={cartEmptyStyle}>
              {status === "success" && (
                <div style={successBoxStyle}>
                  Deine unverbindliche Anfrage wurde gesendet. Der Warenkorb
                  wurde geleert.
                </div>
              )}

              <h2 style={{ marginTop: 0, color: "#435749" }}>
                Dein Warenkorb ist noch leer.
              </h2>
              <Link to="/#produkte" style={productCardHintStyle}>
                Produkte ansehen →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              <section style={cartEmptyStyle}>
                <h2 style={{ marginTop: 0, color: "#435749" }}>
                  Bestellübersicht
                </h2>
                <div style={{ display: "grid", gap: "14px" }}>
                  {items.map((item) => (
                    <article key={item.id} style={cartItemStyle}>
                      {item.image && (
                        <img src={item.image} alt={item.title} style={cartImageStyle} />
                      )}

                      <div>
                        <h3 style={{ margin: "0 0 8px", color: "#435749" }}>
                          {item.title}
                        </h3>
                        {item.isPreorder && (
                          <span style={productCardHintStyle}>Vorbestellung</span>
                        )}
                        <p style={{ margin: "8px 0", color: "#555", lineHeight: "1.6" }}>
                          Menge: {item.quantity || 1}
                          <br />
                          Einzelpreis: {formatEuro(item.unitTotal)}
                          <br />
                          Zwischensumme: {formatEuro(item.unitTotal * item.quantity)}
                        </p>

                        {item.discountActive && (
                          <small style={{ color: "#667" }}>
                            Rabatt: {item.discountLabel}
                          </small>
                        )}

                        {item.selectedExtras?.length > 0 && (
                          <div
                            style={{
                              color: "#555",
                              lineHeight: "1.6",
                              marginTop: "8px",
                            }}
                          >
                            <strong>Extras:</strong>
                            {item.selectedExtras.map((extra, index) => (
                              <p
                                key={extra.name + "-" + index}
                                style={{ margin: "6px 0" }}
                              >
                                {extra.name} +{formatEuro(extra.price)}
                                {extra.has_discount && extra.discount_label && (
                                  <>
                                    <br />
                                    <small>{extra.discount_label}</small>
                                  </>
                                )}
                                {extra.note && (
                                  <>
                                    <br />
                                    <small>Hinweis: {extra.note}</small>
                                  </>
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside style={cartSummaryStyle}>
                <div>
                  <span style={{ color: "#667", fontWeight: "bold" }}>
                    Gesamtbetrag
                  </span>
                  <strong style={{ display: "block", fontSize: "28px" }}>
                    {subtotalLabel}
                  </strong>
                </div>
                <p style={{ maxWidth: "520px", margin: 0 }}>
                  Zahlung ist aktuell noch nicht aktiviert. Es wird keine echte
                  Zahlung ausgelöst.
                </p>
              </aside>

              <form onSubmit={submitCheckoutInquiry} style={cartEmptyStyle} noValidate>
                <h2 style={{ marginTop: 0, color: "#435749" }}>Deine Daten</h2>

                {status === "validation" && (
                  <div style={errorBoxStyle}>Bitte fülle alle Pflichtfelder aus.</div>
                )}

                <div style={formGridStyle}>
                  {renderInput("firstName", "Vorname", { required: true })}
                  {renderInput("lastName", "Nachname", { required: true })}
                </div>

                {renderInput("email", "E-Mail", {
                  required: true,
                  type: "email",
                })}

                {renderInput("phone", "Telefonnummer optional")}

                <div>
                  <h3 style={{ margin: "18px 0 8px", color: "#435749" }}>
                    Lieferadresse
                  </h3>
                  <p style={addressHintStyle}>
                    Bitte prüfe deine Lieferadresse sorgfältig. Eine vollständige
                    und korrekte Angabe hilft uns, deine Anfrage reibungslos zu
                    bearbeiten und den Versand später zuverlässig vorzubereiten.
                  </p>
                </div>

                {renderInput("street", "Straße und Hausnummer", {
                  required: true,
                })}

                <div style={formGridStyle}>
                  {renderInput("zip", "PLZ", { required: true })}
                  {renderInput("city", "Ort", { required: true })}
                </div>

                <label style={labelStyle}>
                  Nachricht / Personalisierungswunsch optional
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  style={{ ...inputStyle, minHeight: "130px" }}
                />

                {!settings.payment_enabled && (
                  <p style={{ color: "#6d5a2f", lineHeight: "1.6" }}>
                    Zahlung ist aktuell noch nicht aktiviert. Es wird keine echte
                    Zahlung ausgelöst.
                  </p>
                )}

                <button disabled={sending} style={buttonStyle}>
                  {sending ? "Wird gesendet..." : "Bestellung unverbindlich anfragen"}
                </button>

                {status === "success" && (
                  <div style={successBoxStyle}>
                    Deine unverbindliche Anfrage wurde gesendet.
                  </div>
                )}

                {status === "error" && (
                  <div style={errorBoxStyle}>
                    Die Anfrage konnte leider nicht gesendet werden.
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
