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
import { getProductBadges } from "../utils/productBadges";
import {
  buildSelectedExtras,
  calculateEstimatedTotal,
  formatEuro,
  getEmptyInquiryForm,
  getProductExtras,
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
    else setProducts(data || []);
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
  const availabilityNotice = getProductAvailabilityNotice(product);
  const availabilityLabel = getAvailabilityLabel(product);
  const detailEstimatedTotal = product
    ? calculateEstimatedTotal(product, { selectedExtras: selectedDetailExtras })
    : "";
  const hasSelectedDetailExtras = Object.values(selectedDetailExtras).some(
    (extra) => extra?.selected
  );
  const selectionRequestDisabled =
    !hasSelectedDetailExtras || !productIsAvailable;

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

              <p style={detailDescriptionStyle}>{product.description}</p>

              <div style={detailTrustRowStyle}>
                <span style={detailTrustPillStyle}>Unverbindliche Anfrage</span>
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
                <strong style={detailPriceStyle}>{product.price}</strong>
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
                {productExtras.length > 0 && (
                  <button
                    onClick={() => openInquiryWithSelection(product)}
                    disabled={selectionRequestDisabled}
                    style={{
                      ...detailRequestButtonStyle,
                      background: selectionRequestDisabled
                        ? "#a7b0a8"
                        : detailRequestButtonStyle.background,
                      color: selectionRequestDisabled ? "#eef3ea" : "white",
                      opacity: selectionRequestDisabled ? 0.72 : 1,
                      cursor: selectionRequestDisabled
                        ? "not-allowed"
                        : "pointer",
                      boxShadow: selectionRequestDisabled
                        ? "none"
                        : detailRequestButtonStyle.boxShadow,
                    }}
                  >
                    Auswahl anfragen
                  </button>
                )}

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

