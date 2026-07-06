import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InquiryModal from "../components/InquiryModal";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  getAvailabilityLabel,
  getProductAvailabilityNotice,
  getAvailabilityStatus,
  isProductAvailable,
} from "../utils/availability";
import { addProductToCart } from "../utils/cart";
import { MarkdownText, stripMarkdown } from "../utils/markdown";
import { getProductBadges } from "../utils/productBadges";
import {
  getProductVariants,
  getVariantPriceAdjustment,
} from "../utils/productVariants";
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
  taxHintStyle,
} from "../styles";

function getSafeExternalUrl(value) {
  const url = String(value || "").trim();

  if (!/^https?:\/\//i.test(url)) return "";

  return url;
}

function getProductIntro(product) {
  const description = stripMarkdown(product?.description || "");

  if (!description) return "";

  const firstParagraph = description.split(/\s{2,}/).find(Boolean) || "";
  const firstSentence =
    firstParagraph.match(/.*?[.!?](\s|$)/)?.[0]?.trim() || firstParagraph;

  return firstSentence;
}

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
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [lightboxType, setLightboxType] = useState("product");
  const [brokenPartnerImages, setBrokenPartnerImages] = useState({});
  const [openPartnerExtraIndex, setOpenPartnerExtraIndex] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    setSelectedDetailExtras({});
    setSelectedImage("");
    setSelectedVariantId("");
    setLightboxOpen(false);
    setLightboxImage("");
    setLightboxAlt("");
    setLightboxType("product");
    setBrokenPartnerImages({});
    setOpenPartnerExtraIndex(null);
  }, [id]);

  useEffect(() => {
    const currentProduct = products.find((item) => String(item.id) === id);
    const activeVariants = getProductVariants(currentProduct, {
      onlyEnabled: true,
    });

    if (activeVariants.length === 0) {
      if (selectedVariantId) setSelectedVariantId("");
      return;
    }

    if (!activeVariants.some((variant) => variant.id === selectedVariantId)) {
      setSelectedVariantId(activeVariants[0].id);
      setSelectedImage(activeVariants[0].image_url || "");
    }
  }, [products, id, selectedVariantId]);

  useEffect(() => {
    function closeLightboxOnEscape(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    if (lightboxOpen) {
      window.addEventListener("keydown", closeLightboxOnEscape);
    }

    return () => {
      window.removeEventListener("keydown", closeLightboxOnEscape);
    };
  }, [lightboxOpen]);

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

  function selectVariant(variantId) {
    const variant = activeVariants.find((item) => item.id === variantId);

    setSelectedVariantId(variantId);
    setSelectedImage(variant?.image_url || product?.image || "");
  }

  function openProductQuestion(product) {
    openInquiry(product, {}, false, "question");
  }

  function addSelectionToCart(product) {
    if (!productIsAvailable) return;

    const item = addProductToCart(
      product,
      selectedDetailExtras,
      selectedVariant
    );
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
        { ...inquiryForm, selectedVariant }
      );
      inquiryPayload.estimated_total = calculateEstimatedTotal(
        inquiryProduct,
        { ...inquiryForm, selectedVariant }
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
  const productIntro = getProductIntro(product);
  const activeVariants = getProductVariants(product, { onlyEnabled: true });
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ||
    activeVariants[0] ||
    null;
  const selectedVariantAdjustment = getVariantPriceAdjustment(selectedVariant);
  const productGalleryImages = Array.isArray(product?.gallery_images)
    ? product.gallery_images.filter(Boolean).slice(0, 3)
    : [];
  const variantImage = selectedVariant?.image_url || "";
  const productImages = product
    ? [variantImage, product.image, ...productGalleryImages].filter(
        (image, index, images) => image && images.indexOf(image) === index
      )
    : [];
  const displayImage = selectedImage || variantImage || product?.image;
  const productExtras = getProductExtras(product);
  const productBadges = getProductBadges(product);
  const productIsAvailable = isProductAvailable(product);
  const isPreorder = getAvailabilityStatus(product) === "preorder";
  const stockQuantity = getStockQuantity(product);
  const discountActive = hasActiveDiscount(product);
  const discountPrice = formatEuro(getDiscountedBasePrice(product));
  const availabilityNotice = getProductAvailabilityNotice(product);
  const availabilityLabel = getAvailabilityLabel(product);
  const detailEstimatedTotal = product
    ? calculateEstimatedTotal(product, {
        selectedExtras: selectedDetailExtras,
        selectedVariant,
      })
    : "";
  const hasSelectedDetailExtras = Object.values(selectedDetailExtras).some(
    (extra) => extra?.selected
  );
  const cartButtonDisabled = !productIsAvailable;
  const selectedImageIndex = Math.max(0, productImages.indexOf(displayImage));

  function showLightboxImage(direction) {
    if (lightboxType !== "product" || productImages.length <= 1) return;

    const nextIndex =
      (selectedImageIndex + direction + productImages.length) %
      productImages.length;

    setSelectedImage(productImages[nextIndex]);
    setLightboxImage(productImages[nextIndex]);
  }

  function openProductImageLightbox() {
    setLightboxType("product");
    setLightboxImage(displayImage);
    setLightboxAlt(`${product.title} vergrößert`);
    setLightboxOpen(true);
  }

  if (!product) {
    return <div style={pageStyle}>Produkt wird geladen...</div>;
  }

  return (
    <>
      <div style={siteStyle}>
        <header style={headerStyle}>
          <Link to="/" style={pillBackLinkStyle}>
            Zur Produktübersicht
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
              <button
                type="button"
                onClick={openProductImageLightbox}
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  border: "none",
                  padding: 0,
                  background: "transparent",
                  cursor: "zoom-in",
                }}
                aria-label="Produktbild vergrößern"
              >
                <img
                  src={displayImage}
                  alt={product.title}
                  style={detailImageStyle}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "14px",
                    bottom: "14px",
                    background: "rgba(255,255,255,0.88)",
                    color: "#2F3A34",
                    border: "1px solid #D8E0D2",
                    borderRadius: "999px",
                    padding: "7px 11px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  Zum Vergrößern antippen
                </span>
              </button>

              {productImages.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "14px",
                  }}
                >
                  {productImages.map((image, index) => {
                    const isSelected = image === displayImage;

                    return (
                      <button
                        key={image + "-" + index}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        style={{
                          width: "72px",
                          height: "72px",
                          padding: "4px",
                          borderRadius: "14px",
                          border: isSelected
                            ? "2px solid #2F3A34"
                            : "1px solid #E8F1EF",
                          background: isSelected ? "#E8F1EF" : "white",
                          cursor: "pointer",
                        }}
                        aria-label={`Produktbild ${index + 1} anzeigen`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} Ansicht ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "10px",
                            background: "#F7F1E8",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={detailInfoPanelStyle}>
              <h1 style={detailTitleStyle}>{product.title}</h1>

              {productIntro && (
                <p
                  style={{
                    ...detailDescriptionStyle,
                    maxWidth: "62ch",
                    color: "#4f5d50",
                    fontWeight: 500,
                  }}
                >
                  {productIntro}
                </p>
              )}

              <div style={detailTrustRowStyle}>
                <span style={detailTrustPillStyle}>{availabilityLabel}</span>
                <span style={detailTrustPillStyle}>Unverbindliche Anfrage</span>
                {productIsAvailable && !isPreorder && (
                  <span style={detailTrustPillStyle}>
                    Bestand: {stockQuantity}
                  </span>
                )}
                {isPreorder && (
                  <span style={detailTrustPillStyle}>Vorbestellung</span>
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

              <details
                style={{
                  marginTop: "14px",
                  padding: isDesktopDetailLayout ? "15px 16px" : "12px 14px",
                  borderRadius: "18px",
                  border: "1px solid #e6ddcb",
                  background: "#F7F1E8",
                  color: "#637064",
                  lineHeight: isDesktopDetailLayout ? 1.6 : 1.5,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color: "#2F3A34",
                    fontWeight: "bold",
                    fontSize: isDesktopDetailLayout ? "15px" : "14px",
                  }}
                >
                  Mehr zum Produkt anzeigen
                </summary>
                <div
                  style={{
                    marginTop: "12px",
                    color: "#5f5f5f",
                    fontSize: isDesktopDetailLayout ? "16px" : "14px",
                  }}
                >
                  <MarkdownText text={product.description} />
                  {activeVariants.some((variant) => variant.description) && (
                    <div style={{ marginTop: "18px" }}>
                      <strong style={{ color: "#2F3A34" }}>
                        Varianten & Motive
                      </strong>
                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        {activeVariants
                          .filter((variant) => variant.description)
                          .map((variant) => (
                            <div
                              key={variant.id}
                              style={{
                                padding: "10px 12px",
                                borderRadius: "14px",
                                background: "#fffaf3",
                                border: "1px solid #e6ddcb",
                              }}
                            >
                              <strong style={{ color: "#2F3A34" }}>
                                {variant.name}
                              </strong>
                              <p style={{ margin: "6px 0 0" }}>
                                {variant.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>

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
              <p style={{ ...taxHintStyle, fontSize: "13px" }}>
                Endpreis. Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.
              </p>

              {activeVariants.length > 0 && (
                <div style={extrasPreviewBoxStyle}>
                  <div style={detailExtraSectionHeaderStyle}>
                    <span>Variante auswählen</span>
                    <small
                      style={{
                        fontSize: isDesktopDetailLayout ? "13px" : "12px",
                        lineHeight: 1.35,
                      }}
                    >
                      Wähle dein Wunschmotiv – Bild und Preis passen sich
                      automatisch an.
                    </small>
                  </div>

                  <select
                    value={selectedVariant?.id || ""}
                    onChange={(e) => selectVariant(e.target.value)}
                    style={inputStyle}
                  >
                    {activeVariants.map((variant) => {
                      const adjustment = getVariantPriceAdjustment(variant);
                      const adjustmentLabel =
                        adjustment > 0
                          ? ` (+${formatEuro(adjustment)})`
                          : adjustment < 0
                          ? ` (${formatEuro(adjustment)})`
                          : "";

                      return (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                          {adjustmentLabel}
                        </option>
                      );
                    })}
                  </select>

                  {selectedVariantAdjustment !== 0 && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#2F3A34",
                        fontSize: isDesktopDetailLayout ? "15px" : "14px",
                      }}
                    >
                      Variantenpreis:{" "}
                      <strong>
                        {selectedVariantAdjustment > 0 ? "+" : ""}
                        {formatEuro(selectedVariantAdjustment)}
                      </strong>
                    </p>
                  )}

                  {productExtras.length === 0 && (
                    <div style={detailTotalBoxStyle}>
                      <span>Voraussichtlicher Gesamtpreis</span>
                      <strong>{detailEstimatedTotal}</strong>
                    </div>
                  )}
                </div>
              )}

              {productExtras.length > 0 && (
                <div style={extrasPreviewBoxStyle}>
                  <div style={detailExtraSectionHeaderStyle}>
                    <span>Extras auswählen</span>
                    <small
                      style={{
                        fontSize: isDesktopDetailLayout ? "13px" : "12px",
                        lineHeight: 1.35,
                      }}
                    >
                      Optional und passend zum Produkt
                    </small>
                  </div>

                  <div style={detailExtraGridStyle}>
                    {productExtras.map((extra, index) => {
                      const isSelected =
                        selectedDetailExtras[index]?.selected || false;
                      const partnerLink = getSafeExternalUrl(
                        extra.partner_link_url
                      );
                      const showPartnerInfo =
                        extra.partner_enabled &&
                        Boolean(
                          extra.partner_name ||
                            extra.partner_text ||
                            extra.partner_image_url ||
                            extra.partner_link_url
                        );
                      const partnerInfoOpen = openPartnerExtraIndex === index;

                      return (
                        <div
                          key={extra.name + "-" + index}
                          style={{
                            ...detailExtraChoiceCardStyle,
                            border: isSelected
                              ? "1px solid #D8E0D2"
                              : detailExtraChoiceCardStyle.border,
                            boxShadow: isSelected
                              ? "0 10px 22px rgba(85,107,93,0.13)"
                              : detailExtraChoiceCardStyle.boxShadow,
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
                                {showPartnerInfo && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setOpenPartnerExtraIndex((current) =>
                                        current === index ? null : index
                                      );
                                    }}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      marginTop: "7px",
                                      border: "1px solid #D8E0D2",
                                      borderRadius: "999px",
                                      background: "#F7F1E8",
                                      color: "#2F3A34",
                                      padding: "5px 8px",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    }}
                                    aria-expanded={partnerInfoOpen}
                                  >
                                    {extra.partner_image_url &&
                                      !brokenPartnerImages[
                                        extra.partner_image_url
                                      ] && (
                                        <img
                                          src={extra.partner_image_url}
                                          alt=""
                                          aria-hidden="true"
                                          style={{
                                            width: "24px",
                                            height: "24px",
                                            objectFit: "contain",
                                            borderRadius: "999px",
                                            background: "#fffaf3",
                                          }}
                                          onError={() =>
                                            setBrokenPartnerImages(
                                              (current) => ({
                                                ...current,
                                                [extra.partner_image_url]: true,
                                              })
                                            )
                                          }
                                        />
                                      )}
                                    <span>
                                      {extra.partner_name ||
                                        "Handmade-Partner"}
                                    </span>
                                  </button>
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

                          {showPartnerInfo && partnerInfoOpen && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  extra.partner_image_url &&
                                  !brokenPartnerImages[
                                    extra.partner_image_url
                                  ] &&
                                  isDesktopDetailLayout
                                    ? "minmax(76px, 96px) 1fr"
                                    : "1fr",
                                gap: isDesktopDetailLayout ? "10px" : "8px",
                                alignItems: "center",
                                marginTop: "10px",
                                padding: isDesktopDetailLayout
                                  ? "11px"
                                  : "10px",
                                borderRadius: "15px",
                                border: "1px solid #E8F1EF",
                                background:
                                  "linear-gradient(135deg, #fffaf3, #E8F1EF)",
                              }}
                            >
                              {extra.partner_image_url &&
                                !brokenPartnerImages[
                                  extra.partner_image_url
                                ] && (
                                  <img
                                    src={extra.partner_image_url}
                                    alt={
                                      extra.partner_name ||
                                      "Handmade-Partner von Camp Oase"
                                    }
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      maxWidth: isDesktopDetailLayout
                                        ? "88px"
                                        : "120px",
                                      maxHeight: isDesktopDetailLayout
                                        ? "76px"
                                        : "64px",
                                      objectFit: "contain",
                                      borderRadius: "13px",
                                      background: "#F7F1E8",
                                      padding: "6px",
                                      boxSizing: "border-box",
                                    }}
                                    onError={() =>
                                      setBrokenPartnerImages((current) => ({
                                        ...current,
                                        [extra.partner_image_url]: true,
                                      }))
                                    }
                                  />
                                )}

                              <div>
                                <small
                                  style={{
                                    display: "inline-block",
                                    marginBottom: "3px",
                                    color: "#8a6f35",
                                    fontWeight: "bold",
                                    letterSpacing: "0.02em",
                                    fontSize: isDesktopDetailLayout
                                      ? "12px"
                                      : "11px",
                                  }}
                                >
                                  Handmade-Partner
                                </small>
                                <strong
                                  style={{
                                    display: "block",
                                    color: "#2F3A34",
                                    marginBottom: "4px",
                                    fontSize: isDesktopDetailLayout
                                      ? "14px"
                                      : "13px",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {extra.partner_name
                                    ? `Gefertigt in Zusammenarbeit mit ${extra.partner_name}.`
                                    : "Dieses Extra wird von einem Handmade-Partner gefertigt."}
                                </strong>
                                {extra.partner_text && (
                                  <p
                                    style={{
                                      margin: "0 0 6px",
                                      color: "#637064",
                                      lineHeight: 1.4,
                                      fontSize: isDesktopDetailLayout
                                        ? "13px"
                                        : "12px",
                                    }}
                                  >
                                    {extra.partner_text}
                                  </p>
                                )}
                                <p
                                  style={{
                                    margin: partnerLink ? "0 0 8px" : 0,
                                    color: "#637064",
                                    lineHeight: 1.4,
                                    fontSize: isDesktopDetailLayout
                                      ? "13px"
                                      : "12px",
                                  }}
                                >
                                  Anfrage und Kundenservice laufen weiterhin
                                  über Camp Oase.
                                </p>

                                {partnerLink && (
                                  <a
                                    href={partnerLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      borderRadius: "999px",
                                      padding: isDesktopDetailLayout
                                        ? "6px 10px"
                                        : "6px 9px",
                                      background: "#E8F1EF",
                                      color: "#2F3A34",
                                      fontWeight: "bold",
                                      fontSize: isDesktopDetailLayout
                                        ? "13px"
                                        : "12px",
                                      textDecoration: "none",
                                      border: "1px solid #D8E0D2",
                                    }}
                                  >
                                    {extra.partner_link_label ||
                                      extra.partner_name ||
                                      "Partner ansehen"}
                                  </a>
                                )}
                              </div>
                            </div>
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
                    color: cartButtonDisabled ? "#E8F1EF" : "#fffaf3",
                    opacity: cartButtonDisabled ? 0.72 : 1,
                    cursor: cartButtonDisabled ? "not-allowed" : "pointer",
                    boxShadow: cartButtonDisabled
                      ? "none"
                      : detailRequestButtonStyle.boxShadow,
                  }}
                >
                  {isPreorder ? "Vorbestellen" : "In den Warenkorb"}
                </button>

                <button
                  onClick={() => openProductQuestion(product)}
                  style={{
                    ...detailRequestButtonStyle,
                    background: "#E8F1EF",
                    color: "#2F3A34",
                  }}
                >
                  Frage zum Produkt stellen
                </button>
              </div>

              {cartStatus && (
                <div style={availabilityNoticeStyle}>{cartStatus}</div>
              )}

              <details
                style={{
                  marginTop: "16px",
                  padding: "14px 16px",
                  borderRadius: "18px",
                  border: "1px solid #e6ddcb",
                  background: "#F7F1E8",
                  color: "#637064",
                  lineHeight: 1.55,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    color: "#2F3A34",
                    fontWeight: "bold",
                  }}
                >
                  Produkthinweis
                </summary>
                <p style={{ margin: "10px 0 0" }}>
                  Hinweis: Unsere Produkte richten sich an erwachsene Camper,
                  Campingfreunde und kreative Alltagsnutzer. Sie sind kein
                  Spielzeug und nicht für Kinder unter 14 Jahren bestimmt. Bitte
                  Kleinteile, Bänder, Anhänger und Zubehör nicht unbeaufsichtigt
                  kleinen Kindern überlassen. Handmade-Artikel können leichte
                  Abweichungen in Farbe, Form und Verarbeitung aufweisen.
                </p>
              </details>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>

      {lightboxOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(47, 62, 52, 0.72)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px, 4vw, 34px)",
          }}
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <div
            style={{
              position: "relative",
              width: "min(980px, 100%)",
              maxHeight: "90vh",
              background: "linear-gradient(135deg, #ffffff, #F7F1E8)",
              border: "1px solid #E8F1EF",
              borderRadius: "24px",
              padding: "clamp(12px, 3vw, 18px)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.32)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                zIndex: 2,
                border: "none",
                background: "rgba(255,255,255,0.9)",
                color: "#2F3A34",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontSize: "25px",
                lineHeight: "1",
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
              }}
              aria-label="Bildansicht schließen"
            >
              ×
            </button>

            {lightboxType === "product" && productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => showLightboxImage(-1)}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    zIndex: 2,
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(255,255,255,0.9)",
                    color: "#2F3A34",
                    borderRadius: "999px",
                    width: "42px",
                    height: "42px",
                    cursor: "pointer",
                    fontSize: "28px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                  }}
                  aria-label="Vorheriges Produktbild anzeigen"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => showLightboxImage(1)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    zIndex: 2,
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "rgba(255,255,255,0.9)",
                    color: "#2F3A34",
                    borderRadius: "999px",
                    width: "42px",
                    height: "42px",
                    cursor: "pointer",
                    fontSize: "28px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                  }}
                  aria-label="Nächstes Produktbild anzeigen"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={lightboxImage || displayImage}
              alt={lightboxAlt || `${product.title} vergrößert`}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "82vh",
                objectFit: "contain",
                borderRadius: "18px",
                background: "#F7F1E8",
              }}
              onError={() => {
                if (lightboxType === "partner" && lightboxImage) {
                  setBrokenPartnerImages((current) => ({
                    ...current,
                    [lightboxImage]: true,
                  }));
                }

                setLightboxOpen(false);
              }}
            />
          </div>
        </div>
      )}

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

