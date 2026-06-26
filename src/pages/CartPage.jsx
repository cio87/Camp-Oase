import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InquiryModal from "../components/InquiryModal";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buildCartMessage,
  buildCartSelectedExtras,
  clearCart,
  getCartItems,
  getCartSubtotal,
  removeCartItem,
  updateCartItemQuantity,
} from "../utils/cart";
import { formatEuro, getEmptyInquiryForm } from "../utils/price";
import {
  buttonStyle,
  cartEmptyStyle,
  cartImageStyle,
  cartItemStyle,
  cartPageStyle,
  cartQuantityButtonStyle,
  cartQuantityRowStyle,
  cartSummaryStyle,
  deleteButtonStyle,
  extraChoiceCardStyle,
  extrasBoxStyle,
  inputStyle,
  pageStyle,
  pillBackLinkStyle,
  productCardHintStyle,
  sectionTitleStyle,
  siteStyle,
} from "../styles";

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(getEmptyInquiryForm());
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const subtotalLabel = formatEuro(subtotal);

  useEffect(() => {
    setItems(getCartItems());
    loadCheckoutSettings();
  }, []);

  async function loadCheckoutSettings() {
    const { data, error } = await supabase
      .from("site_settings")
      .select("checkout_enabled")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data) {
      setCheckoutEnabled(Boolean(data.checkout_enabled));
    }
  }

  function refreshCart() {
    setItems(getCartItems());
  }

  function changeQuantity(itemId, quantity) {
    updateCartItemQuantity(itemId, quantity);
    refreshCart();
  }

  function removeItem(itemId) {
    removeCartItem(itemId);
    refreshCart();
  }

  function openCartInquiry() {
    const message = buildCartMessage(items, subtotalLabel);

    setInquiryStatus("");
    setInquiryProduct({
      title: "Warenkorbanfrage",
      price: subtotalLabel,
      extras_enabled: false,
      custom_extras: [],
    });
    setInquiryForm({
      ...getEmptyInquiryForm(),
      message,
    });
  }

  function closeInquiry() {
    setInquiryProduct(null);
    setInquiryStatus("");
    setInquiryForm(getEmptyInquiryForm());
    setInquirySending(false);
  }

  async function submitCartInquiry(e) {
    e.preventDefault();

    setInquirySending(true);
    setInquiryStatus("");

    const { error } = await supabase.from("inquiries").insert([
      {
        product_title: "Warenkorbanfrage",
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: inquiryForm.message,
        selected_extras: buildCartSelectedExtras(items),
        estimated_total: subtotalLabel,
        status: "offen",
      },
    ]);

    setInquirySending(false);

    if (error) {
      setInquiryStatus("error");
      console.log(error);
      return;
    }

    setInquiryStatus("success");
    clearCart();
    setItems([]);

    setTimeout(() => {
      closeInquiry();
    }, 2200);
  }

  return (
    <>
      <div style={siteStyle}>
        <PublicHeader />

        <main style={pageStyle}>
          <div style={cartPageStyle}>
            <Link to="/#produkte" style={pillBackLinkStyle}>
              ← Zur Produktübersicht
            </Link>

            <h1 style={sectionTitleStyle}>Warenkorb</h1>

            {items.length === 0 ? (
              <div style={cartEmptyStyle}>
                <h2 style={{ marginTop: 0, color: "#435749" }}>
                  Dein Warenkorb ist noch leer.
                </h2>
                <p>
                  Schau dich in der Produktübersicht um und lege deine Auswahl
                  unverbindlich in den Warenkorb.
                </p>
                <Link to="/#produkte" style={productCardHintStyle}>
                  Produkte ansehen →
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: "14px" }}>
                  {items.map((item) => (
                    <article key={item.id} style={cartItemStyle}>
                      {item.image && (
                        <img src={item.image} alt={item.title} style={cartImageStyle} />
                      )}

                      <div>
                        <h2 style={{ margin: "0 0 8px", color: "#435749" }}>
                          {item.title}
                        </h2>
                        {item.isPreorder && (
                          <span style={productCardHintStyle}>Vorbestellung</span>
                        )}
                        <p style={{ margin: "0 0 8px", color: "#667" }}>
                          Basispreis:{" "}
                          {item.discountActive && (
                            <>
                              <span style={{ textDecoration: "line-through" }}>
                                {item.originalBasePriceLabel}
                              </span>{" "}
                            </>
                          )}
                          <strong>{item.basePriceLabel}</strong>
                          {item.discountActive && item.discountLabel && (
                            <>
                              <br />
                              <small>{item.discountLabel}</small>
                            </>
                          )}
                          {item.stockQuantity > 0 && (
                            <>
                              <br />
                              <small>Maximal verfügbar: {item.stockQuantity}</small>
                            </>
                          )}
                        </p>

                        {item.selectedExtras?.length > 0 && (
                          <div style={{ color: "#555", lineHeight: "1.6" }}>
                            <strong>Ausgewählte Extras:</strong>
                            {item.selectedExtras.map((extra, index) => (
                              <p key={extra.name + "-" + index} style={{ margin: "6px 0" }}>
                                {extra.name}{" "}
                                {extra.has_discount && (
                                  <>
                                    <span style={{ textDecoration: "line-through" }}>
                                      +{formatEuro(extra.original_price)}
                                    </span>{" "}
                                  </>
                                )}
                                +{formatEuro(extra.price)}
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

                      <div>
                        <div style={cartQuantityRowStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(item.id, Number(item.quantity || 1) - 1)
                            }
                            style={cartQuantityButtonStyle}
                          >
                            -
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={item.stockQuantity > 0 ? item.stockQuantity : undefined}
                            value={item.quantity || 1}
                            onChange={(e) => changeQuantity(item.id, e.target.value)}
                            style={{ ...inputStyle, width: "74px", margin: 0 }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(item.id, Number(item.quantity || 1) + 1)
                            }
                            disabled={
                              item.stockQuantity > 0 &&
                              Number(item.quantity || 1) >= Number(item.stockQuantity)
                            }
                            style={cartQuantityButtonStyle}
                          >
                            +
                          </button>
                        </div>

                        <p style={{ color: "#556b5d", fontWeight: "bold" }}>
                          Einzelpreis: {formatEuro(item.unitTotal)}
                          <br />
                          Gesamt: {formatEuro(item.unitTotal * item.quantity)}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={deleteButtonStyle}
                        >
                          Entfernen
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <aside style={cartSummaryStyle}>
                  <div>
                    <span style={{ color: "#667", fontWeight: "bold" }}>
                      Gesamtbetrag
                    </span>
                    <strong style={{ display: "block", fontSize: "28px" }}>
                      {subtotalLabel}
                    </strong>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {checkoutEnabled && (
                      <Link
                        to="/checkout"
                        style={{
                          ...buttonStyle,
                          display: "inline-block",
                          textDecoration: "none",
                        }}
                      >
                        Zur Kasse
                      </Link>
                    )}

                    <button type="button" onClick={openCartInquiry} style={buttonStyle}>
                      Warenkorb unverbindlich anfragen
                    </button>
                  </div>
                </aside>
              </>
            )}
          </div>
        </main>

        <SiteFooter />
      </div>

      {inquiryProduct && (
        <InquiryModal
          product={inquiryProduct}
          form={inquiryForm}
          setForm={setInquiryForm}
          status={inquiryStatus}
          sending={inquirySending}
          onClose={closeInquiry}
          onSubmit={submitCartInquiry}
          inquiryMode="question"
          summaryContent={
            <div style={extrasBoxStyle}>
              <h3 style={{ marginTop: 0, color: "#435749" }}>
                Deine Warenkorb-Zusammenfassung
              </h3>

              {items.map((item) => (
                <div key={item.id} style={extraChoiceCardStyle}>
                  <strong>{item.title}</strong>
                  {item.isPreorder && (
                    <p style={{ margin: "6px 0", color: "#556b5d" }}>
                      Vorbestellung
                    </p>
                  )}
                  <p style={{ margin: "8px 0", color: "#555", lineHeight: "1.5" }}>
                    Menge: {item.quantity || 1}
                    <br />
                    Basispreis: {item.basePriceLabel}
                    {item.discountActive && item.discountLabel
                      ? " (" + item.discountLabel + ")"
                      : ""}
                    <br />
                    Einzelpreis: {formatEuro(item.unitTotal)}
                    <br />
                    Zwischensumme: {formatEuro(item.unitTotal * item.quantity)}
                  </p>

                  {item.selectedExtras?.length > 0 && (
                    <div style={{ color: "#555", lineHeight: "1.5" }}>
                      <strong>Extras:</strong>
                      {item.selectedExtras.map((extra, index) => (
                        <p key={extra.name + "-" + index} style={{ margin: "6px 0" }}>
                          {extra.name}{" "}
                          {extra.has_discount && (
                            <>
                              <span style={{ textDecoration: "line-through" }}>
                                +{formatEuro(extra.original_price)}
                              </span>{" "}
                            </>
                          )}
                          +{formatEuro(extra.price)}
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
              ))}

              <div style={{ marginTop: "14px", color: "#435749" }}>
                Gesamtbetrag: <strong>{subtotalLabel}</strong>
              </div>
            </div>
          }
          submitButtonText="Warenkorb anfragen"
        />
      )}
    </>
  );
}
