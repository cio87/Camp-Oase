import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InquiryModal from "../components/InquiryModal";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  getAvailabilityLabel,
  getProductAvailabilityNotice,
  isProductAvailable,
} from "../utils/availability";
import { addProductToCart } from "../utils/cart";
import { MarkdownText } from "../utils/markdown";
import { getProductBadges } from "../utils/productBadges";
import { sortProductsByDisplayOrder } from "../utils/products";
import {
  buildSelectedExtras,
  calculateEstimatedTotal,
  formatEuro,
  getDiscountLabel,
  getDiscountedBasePrice,
  getEmptyInquiryForm,
  getProductExtras,
  getStockQuantity,
  hasActiveDiscount,
} from "../utils/price";
import {
  availabilityNoticeStyle,
  detailActionRowStyle,
  detailDescriptionStyle,
  detailExtraCardSelectedStyle,
  detailExtraChoiceCardStyle,
  detailExtraDescriptionStyle,
  detailExtraGridStyle,
  detailExtraLineStyle,
  detailExtraPriceStyle,
  detailExtraSectionHeaderStyle,
  detailImageStyle,
  detailInfoPanelStyle,
  detailLayoutStyle,
  detailMediaPanelStyle,
  detailMediaStickyStyle,
  detailOldPriceStyle,
  detailPriceContentStyle,
  detailPriceStyle,
  detailPriceSummaryStyle,
  detailRequestButtonStyle,
  detailSectionStyle,
  detailTitleStyle,
  detailTrustPillStyle,
  detailTrustRowStyle,
  detailTotalBoxStyle,
  extrasPreviewBoxStyle,
  headerStyle,
  inputStyle,
  pageStyle,
  pillBackLinkStyle,
  productOldPriceStyle,
  siteStyle,
} from "../styles";

export default function ProductDetailPage() {
  const [products, setProducts] = useState([]);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(getEmptyInquiryForm());
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [selectedDetailExtras, setSelectedDetailExtras] = useState({});
  const [inquiryExtrasLocked, setInquiryExtrasLocked] = useState(false);
  const [inquiryMode, setInquiryMode] = useState("question");
  const [isDesktopDetailLayout, setIsDesktopDetailLayout] = useState(false);
  const [cartStatus, setCartStatus] = useState("");
  const { id } = useParams();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setSelectedDetailExtras({});
  }, [id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px)");

    function updateDetailLayout() {
      setIsDesktopDetailLayout(mediaQuery.matches);
    }

    updateDetailLayout();
    mediaQuery.addEventListener("change", updateDetailLayout);

    return () => {
      mediaQuery.removeEventListener("change", updateDetailLayout);
    };
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.log(error);
    else setProducts(sortProductsByDisplayOrder(data || []));
  }

  function openInquiry(
    product,
    selectedExtras = {},
    lockExtras = false,
    mode = "question"
  ) {
    setInquiryProduct(product);
    setInquiryStatus("");
    setInquiryExtrasLocked(lockExtras);
    setInquiryMode(mode);
    setInquiryForm({
      ...getEmptyInquiryForm(),
      selectedExtras,
      message:
        "Hallo Camp Oase,\n\nich interessiere mich für folgendes Produkt:\n\n" +
        product.title +
        "\nPreis: " +
        product.price +
        "\n\nMeine Frage dazu:\n",
    });
  }

  function closeInquiry() {
    setInquiryProduct(null);
    setInquiryStatus("");
    setInquiryForm(getEmptyInquiryForm());
    setInquirySending(false);
    setInquiryExtrasLocked(false);
    setInquiryMode("question");
  }

  function toggleDetailExtra(index, checked) {
    setSelectedDetailExtras({
      ...selectedDetailExtras,
      [index]: {
        ...(selectedDetailExtras[index] || {}),
        selected: checked,
      },
    });
  }

  function updateDetailExtraNote(index, note) {
    setSelectedDetailExtras({
      ...selectedDetailExtras,
      [index]: {
        ...(selectedDetailExtras[index] || {}),
        selected: true,
        note,
      },
    });
  }

  function openInquiryWithSelection(product) {
    openInquiry(product, selectedDetailExtras, true, "selection");
  }

  function openProductQuestion(product) {
    openInquiry(product, {}, false, "question");
  }

  function addSelectionToCart(product) {
    if (!productIsAvailable) return;

    const item = addProductToCart(product, selectedDetailExtras);
    setCartStatus(
      item
        ? "Das Produkt wurde in den Warenkorb gelegt."
        : "Dieses Produkt ist aktuell nicht verfügbar."
    );

    setTimeout(() => {
      setCartStatus("");
    }, 2600);
  }

  async function submitInquiry(e) {
    e.preventDefault();

    if (!inquiryProduct) return;

    setInquirySending(true);
    setInquiryStatus("");

    const inquiryPayload = {
      product_title: inquiryProduct.title,
      name: inquiryForm.name,
      email: inquiryForm.email,
      message: inquiryForm.message,
    };

    if (inquiryMode === "selection") {
      inquiryPayload.selected_extras = buildSelectedExtras(
        inquiryProduct,
        inquiryForm
      );
      inquiryPayload.estimated_total = calculateEstimatedTotal(
        inquiryProduct,
        inquiryForm
      );
    }

    const { error } = await supabase.from("inquiries").insert([inquiryPayload]);

    setInquirySending(false);

    if (error) {
      setInquiryStatus("error");
      console.log(error);
      return;
    }

    setInquiryStatus("success");

    setTimeout(() => {
      closeInquiry();
    }, 2200);
  }

  const product = products.find((item) => String(item.id) === id);
  const productExtras = getProductExtras(product);
  const productBadges = getProductBadges(product);
  const productIsAvailable = isProductAvailable(product);
  const stockQuantity = getStockQuantity(product);
  const discountActive = hasActiveDiscount(product);
  const discountPrice = formatEuro(getDiscountedBasePrice(product));
  const availabilityNotice = getProductAvailabilityNotice(product);
  const availabilityLabel = getAvailabilityLabel(product);
  const detailEstimatedTotal = product
    ? calculateEstimatedTotal(product, { selectedExtras: selectedDetailExtras })
    : "";
  const hasSelectedDetailExtras = Object.values(selectedDetailExtras).some(
    (extra) => extra?.selected
  );
  const cartButtonDisabled = !productIsAvailable;

  if (!product) {
    return <div style={pageStyle}>Produkt wird geladen...</div>;
  }

  return (
    <>
      <div style={siteStyle}>
        <header style={headerStyle}>
          <Link to="/" style={pillBackLinkStyle}>
            ← Zur Produktübersicht
          </Link>
        </header>

        <section style={detailSectionStyle}>
          <div style={detailLayoutStyle}>
            <div
              style={{
                ...detailMediaPanelStyle,
                ...(isDesktopDetailLayout ? detailMediaStickyStyle : {}),
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                style={detailImageStyle}
              />
            </div>

            <div style={detailInfoPanelStyle}>
              <span style={detailTrustPillStyle}>{availabilityLabel}</span>

              <h1 style={detailTitleStyle}>{product.title}</h1>

              <MarkdownText
                text={product.description}
                style={detailDescriptionStyle}
              />

              <div style={detailTrustRowStyle}>
                <span style={detailTrustPillStyle}>Unverbindliche Anfrage</span>
                {productIsAvailable && (
                  <span style={detailTrustPillStyle}>
                    Bestand: {stockQuantity}
                  </span>
                )}
                {discountActive && (
                  <span style={detailTrustPillStyle}>
                    {getDiscountLabel(product)}
                  </span>
                )}
                {productBadges.map((badge) => (
                  <span key={badge.value} style={detailTrustPillStyle}>
                    {badge.label}
                  </span>
                ))}
              </div>

              {availabilityNotice && (
                <div style={availabilityNoticeStyle}>{availabilityNotice}</div>
              )}

              <div style={detailPriceSummaryStyle}>
                <span>Preis</span>
                <span style={detailPriceContentStyle}>
                  {discountActive && (
                    <>
                      <span style={detailOldPriceStyle}>{product.price}</span>
                      <small>{getDiscountLabel(product)}</small>
                    </>
                  )}
                  <strong style={detailPriceStyle}>
                    {discountActive ? discountPrice : product.price}
                  </strong>
                </span>
              </div>

              {productExtras.length > 0 && (
                <div style={extrasPreviewBoxStyle}>
                  <div style={detailExtraSectionHeaderStyle}>
                    <span>Extras auswählen</span>
                    <small>Optional und passend zum Produkt</small>
                  </div>

                  <div style={detailExtraGridStyle}>
                    {productExtras.map((extra, index) => {
                      const isSelected =
                        selectedDetailExtras[index]?.selected || false;

                      return (
                        <div
                          key={extra.name + "-" + index}
                          style={{
                            ...detailExtraChoiceCardStyle,
                            ...(isSelected ? detailExtraCardSelectedStyle : {}),
                            opacity: productIsAvailable ? 1 : 0.68,
                          }}
                        >
                          <label
                            style={{
                              ...detailExtraLineStyle,
                              alignItems: "flex-start",
                              cursor: productIsAvailable
                                ? "pointer"
                                : "not-allowed",
                            }}
                          >
                            <span style={{ display: "flex", gap: "10px" }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!productIsAvailable}
                                onChange={(e) =>
                                  toggleDetailExtra(index, e.target.checked)
                                }
                              />
                              <span>
                                <strong>{extra.name}</strong>
                                {extra.description && (
                                  <small style={detailExtraDescriptionStyle}>
                                    {extra.description}
                                  </small>
                                )}
                              </span>
                            </span>

                            <span style={detailExtraPriceStyle}>
                              {extra.has_discount && (
                                <>
                                  <span style={productOldPriceStyle}>
                                    +{formatEuro(extra.original_price)}
                                  </span>
                                  <br />
                                  <small>{extra.discount_label}</small>
                                  <br />
                                </>
                              )}
                              +{formatEuro(extra.price)}
                            </span>
                          </label>

                          {isSelected && (
                            <input
                              placeholder="Hinweis zum Extra"
                              value={selectedDetailExtras[index]?.note || ""}
                              onChange={(e) =>
                                updateDetailExtraNote(index, e.target.value)
                              }
                              style={inputStyle}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={detailTotalBoxStyle}>
                    <span>Voraussichtlicher Gesamtpreis</span>
                    <strong>{detailEstimatedTotal}</strong>
                  </div>
                </div>
              )}

              <div style={detailActionRowStyle}>
                <button
                  onClick={() => addSelectionToCart(product)}
                  disabled={cartButtonDisabled}
                  style={{
                    ...detailRequestButtonStyle,
                    background: cartButtonDisabled
                      ? "#a7b0a8"
                      : detailRequestButtonStyle.background,
                    color: cartButtonDisabled ? "#eef3ea" : "white",
                    opacity: cartButtonDisabled ? 0.72 : 1,
                    cursor: cartButtonDisabled ? "not-allowed" : "pointer",
                    boxShadow: cartButtonDisabled
                      ? "none"
                      : detailRequestButtonStyle.boxShadow,
                  }}
                >
                  In den Warenkorb
                </button>

                <button
                  onClick={() => openProductQuestion(product)}
                  style={{
                    ...detailRequestButtonStyle,
                    background: "#d9c7a2",
                    color: "#2f3e34",
                  }}
                >
                  Frage zum Produkt stellen
                </button>
              </div>

              {cartStatus && (
                <div style={availabilityNoticeStyle}>{cartStatus}</div>
              )}
            </div>
          </div>
        </section>

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
          onSubmit={submitInquiry}
          extrasLocked={inquiryExtrasLocked}
          inquiryMode={inquiryMode}
          submitButtonText={
            inquiryMode === "selection" ? "Auswahl anfragen" : "Frage absenden"
          }
        />
      )}
    </>
  );
}

