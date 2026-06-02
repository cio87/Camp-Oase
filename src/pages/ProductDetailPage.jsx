import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InquiryModal from "../components/InquiryModal";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import {
  buildSelectedExtras,
  calculateEstimatedTotal,
  formatEuro,
  getEmptyInquiryForm,
  getProductExtras,
} from "../utils/price";
import {
  detailDescriptionStyle,
  detailExtraDescriptionStyle,
  detailExtraLineStyle,
  detailExtraPriceStyle,
  detailImageStyle,
  detailPriceStyle,
  detailRequestButtonStyle,
  detailSectionStyle,
  detailTitleStyle,
  extrasPreviewBoxStyle,
  headerStyle,
  pageStyle,
  siteStyle,
} from "../styles";

export default function ProductDetailPage() {
  const [products, setProducts] = useState([]);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(getEmptyInquiryForm());
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.log(error);
    else setProducts(data || []);
  }

  function openInquiry(product) {
    setInquiryProduct(product);
    setInquiryStatus("");
    setInquiryForm({
      ...getEmptyInquiryForm(),
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
  }

  async function submitInquiry(e) {
    e.preventDefault();

    if (!inquiryProduct) return;

    setInquirySending(true);
    setInquiryStatus("");

    const selectedExtras = buildSelectedExtras(inquiryProduct, inquiryForm);
    const estimatedTotal = calculateEstimatedTotal(inquiryProduct, inquiryForm);

    const { error } = await supabase.from("inquiries").insert([
      {
        product_title: inquiryProduct.title,
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: inquiryForm.message,
        selected_extras: selectedExtras,
        estimated_total: estimatedTotal,
      },
    ]);

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

  if (!product) {
    return <div style={pageStyle}>Produkt wird geladen...</div>;
  }

  return (
    <>
      <div style={siteStyle}>
        <header style={headerStyle}>
          <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
            ← Zurück
          </Link>
        </header>

        <section style={detailSectionStyle}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <img src={product.image} alt={product.title} style={detailImageStyle} />

            <h1 style={detailTitleStyle}>{product.title}</h1>

            <p style={detailDescriptionStyle}>{product.description}</p>

            {productExtras.length > 0 && (
              <div style={extrasPreviewBoxStyle}>
                <strong style={{ color: "#435749" }}>
                  Für dieses Produkt sind Extras möglich:
                </strong>

                <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                  {productExtras.map((extra, index) => (
                    <div key={extra.name + "-" + index} style={detailExtraLineStyle}>
                      <span>
                        <strong>{extra.name}</strong>
                        {extra.description && (
                          <small style={detailExtraDescriptionStyle}>
                            {extra.description}
                          </small>
                        )}
                      </span>

                      <span style={detailExtraPriceStyle}>+{formatEuro(extra.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "28px" }}>
              <strong style={detailPriceStyle}>{product.price}</strong>

              <br />

              <button onClick={() => openInquiry(product)} style={detailRequestButtonStyle}>
                Anfrage senden
              </button>
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
        />
      )}
    </>
  );
}

