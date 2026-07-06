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
import { MarkdownText } from "../utils/markdown";
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
  taxHintStyle,
} from "../styles";

function getSafeExternalUrl(value) {
  const url = String(value || "").trim();

  if (!/^https?:\/\//i.test(url)) return "";

  return url;
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
  const partnerExtras = productExtras.filter((extra) => {
    if (!extra.partner_enabled) return false;

    return Boolean(
      extra.partner_name ||
        extra.partner_text ||
        extra.partner_image_url ||
        extra.partner_link_url
    );
  });
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

  function openPartnerImageLightbox(extra) {
    setLightboxType("partner");
    setLightboxImage(extra.partner_image_url);
    setLightboxAlt(
      extra.partner_name
        ? `Handmade-Partner ${extra.partner_name}`
        : "Handmade-Partner von Camp Oase"
    );
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
              <span style={detailTrustPillStyle}>{availabilityLabel}</span>

              <h1 style={detailTitleStyle}>{product.title}</h1>

              <MarkdownText
                text={product.description}
                style={detailDescriptionStyle}
              />

              <div style={detailTrustRowStyle}>
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
                    <small>Bild und Preis passen sich deiner Auswahl an</small>
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

                  {selectedVariant?.description && (
                    <p style={{ ...detailExtraDescriptionStyle, marginTop: "8px" }}>
                      {selectedVariant.description}
                    </p>
                  )}

                  {selectedVariantAdjustment !== 0 && (
                    <p style={{ margin: "10px 0 0", color: "#2F3A34" }}>
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

                  {partnerExtras.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        marginTop: "16px",
                      }}
                    >
                      {partnerExtras.map((extra, index) => {
                        const partnerLink = getSafeExternalUrl(
                          extra.partner_link_url
                        );

                        return (
                          <div
                            key={`${extra.name}-partner-${index}`}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                extra.partner_image_url && isDesktopDetailLayout
                                  ? "minmax(110px, 160px) 1fr"
                                  : "1fr",
                              gap: "14px",
                              alignItems: "center",
                              padding: "15px",
                              borderRadius: "18px",
                              border: "1px solid #E8F1EF",
                              background:
                                "linear-gradient(135deg, #ffffff, #E8F1EF)",
                            }}
                          >
                            {extra.partner_image_url &&
                              !brokenPartnerImages[extra.partner_image_url] && (
                              <button
                                type="button"
                                onClick={() => openPartnerImageLightbox(extra)}
                                style={{
                                  position: "relative",
                                  display: "block",
                                  width: isDesktopDetailLayout
                                    ? "150px"
                                    : "100%",
                                  maxWidth: "100%",
                                  border: "none",
                                  padding: 0,
                                  background: "transparent",
                                  cursor: "zoom-in",
                                }}
                                aria-label="Handmade-Partner-Bild vergrößern"
                              >
                                <img
                                  src={extra.partner_image_url}
                                  alt={
                                    extra.partner_name ||
                                    "Handmade-Partner von Camp Oase"
                                  }
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    maxWidth: "100%",
                                    maxHeight: isDesktopDetailLayout
                                      ? "120px"
                                      : "80px",
                                    objectFit: "contain",
                                    borderRadius: "16px",
                                    background: "#F7F1E8",
                                    padding: "8px",
                                    boxSizing: "border-box",
                                  }}
                                  onError={() =>
                                    setBrokenPartnerImages((current) => ({
                                      ...current,
                                      [extra.partner_image_url]: true,
                                    }))
                                  }
                                />
                                <span
                                  style={{
                                    position: "absolute",
                                    right: "6px",
                                    bottom: "6px",
                                    background: "rgba(255,255,255,0.9)",
                                    color: "#2F3A34",
                                    border: "1px solid #D8E0D2",
                                    borderRadius: "999px",
                                    padding: "4px 7px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    boxShadow: "0 5px 12px rgba(0,0,0,0.08)",
                                  }}
                                >
                                  Vergrößern
                                </span>
                              </button>
                            )}

                            {extra.partner_image_url &&
                              brokenPartnerImages[extra.partner_image_url] && (
                                <div
                                  aria-hidden="true"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: isDesktopDetailLayout
                                      ? "150px"
                                      : "100%",
                                    maxWidth: "100%",
                                    minHeight: isDesktopDetailLayout
                                      ? "82px"
                                      : "58px",
                                    maxHeight: isDesktopDetailLayout
                                      ? "120px"
                                      : "80px",
                                    borderRadius: "16px",
                                    background: "#F7F1E8",
                                    border: "1px dashed #d8cdb9",
                                    color: "#7f8f82",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    boxSizing: "border-box",
                                    padding: "8px",
                                  }}
                                >
                                  Handmade
                                </div>
                              )}

                            <div>
                              <small
                                style={{
                                  display: "inline-block",
                                  marginBottom: "5px",
                                  color: "#8a6f35",
                                  fontWeight: "bold",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                Handmade-Partner
                              </small>
                              <strong
                                style={{
                                  display: "block",
                                  color: "#2F3A34",
                                  marginBottom: "5px",
                                }}
                              >
                                {extra.partner_name
                                  ? `Dieses Extra wird in Zusammenarbeit mit ${extra.partner_name} gefertigt.`
                                  : "Dieses Extra wird von einem Handmade-Partner gefertigt."}
                              </strong>
                              {extra.partner_text && (
                                <p
                                  style={{
                                    margin: "0 0 8px",
                                    color: "#637064",
                                    lineHeight: 1.55,
                                  }}
                                >
                                  {extra.partner_text}
                                </p>
                              )}
                              <p
                                style={{
                                  margin: partnerLink ? "0 0 10px" : 0,
                                  color: "#637064",
                                  lineHeight: 1.55,
                                }}
                              >
                                Anfrage, Bestellung und Kundenservice laufen
                                weiterhin über Camp Oase.
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
                                    padding: "8px 12px",
                                    background: "#E8F1EF",
                                    color: "#2F3A34",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                    border: "1px solid #D8E0D2",
                                  }}
                                >
                                  {extra.partner_link_label ||
                                    "Partner ansehen"}
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={detailTotalBoxStyle}>
                    <span>Voraussichtlicher Gesamtpreis</span>
                    <strong>{detailEstimatedTotal}</strong>
                  </div>
                </div>
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

              <div style={detailActionRowStyle}>
                <button
                  onClick={() => addSelectionToCart(product)}
                  disabled={cartButtonDisabled}
                  style={{
                    ...detailRequestButtonStyle,
                    background: cartButtonDisabled
                      ? "#a7b0a8"
                      : detailRequestButtonStyle.background,
                    color: cartButtonDisabled ? "#E8F1EF" : "#2F3A34",
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

