import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InquiryModal from "../components/InquiryModal";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buildCartMessage,
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

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const subtotalLabel = formatEuro(subtotal);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

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
      title: "Warenkorb",
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
        product_title: "Warenkorb",
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: inquiryForm.message,
        estimated_total: subtotalLabel,
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
                        <p style={{ margin: "0 0 8px", color: "#667" }}>
                          Basispreis: <strong>{item.basePriceLabel}</strong>
                        </p>

                        {item.selectedExtras?.length > 0 && (
                          <div style={{ color: "#555", lineHeight: "1.6" }}>
                            <strong>Ausgewählte Extras:</strong>
                            {item.selectedExtras.map((extra, index) => (
                              <p key={extra.name + "-" + index} style={{ margin: "6px 0" }}>
                                {extra.name} +{formatEuro(extra.price)}
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
                            value={item.quantity || 1}
                            onChange={(e) => changeQuantity(item.id, e.target.value)}
                            style={{ ...inputStyle, width: "74px", margin: 0 }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(item.id, Number(item.quantity || 1) + 1)
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

                  <button type="button" onClick={openCartInquiry} style={buttonStyle}>
                    Warenkorb unverbindlich anfragen
                  </button>
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
          submitButtonText="Warenkorb anfragen"
        />
      )}
    </>
  );
}
