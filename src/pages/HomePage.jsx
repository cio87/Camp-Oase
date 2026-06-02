import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import InquiryModal from "../components/InquiryModal";
import ProductCard from "../components/ProductCard";
import SiteFooter from "../components/SiteFooter";
import {
  buildSelectedExtras,
  calculateEstimatedTotal,
  getEmptyInquiryForm,
} from "../utils/price";
import {
  badgeStyle,
  brandTextStyle,
  headerStyle,
  heroStyle,
  heroTextStyle,
  heroTitleStyle,
  logoStyle,
  productGridStyle,
  sectionStyle,
  sectionTitleStyle,
  siteStyle,
} from "../styles";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(getEmptyInquiryForm());
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquirySending, setInquirySending] = useState(false);

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

  return (
    <>
      <div style={siteStyle}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img src="/logo.png" alt="Camp Oase Logo" style={logoStyle} />
            <strong style={brandTextStyle}>Camp Oase</strong>
          </div>
        </header>

        <section style={heroStyle}>
          <p style={badgeStyle}>Camping • Caravan • Handmade</p>

          <h1 style={heroTitleStyle}>Willkommen bei Camp Oase</h1>

          <p style={heroTextStyle}>
            Liebevoll gestaltete Camping-Produkte, Deko und Zubehör für dein
            persönliches Zuhause auf Rädern.
          </p>
        </section>

        <section style={sectionStyle}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ color: "#7f9b76", fontWeight: "bold" }}>
              Produktübersicht
            </p>

            <h2 style={sectionTitleStyle}>Unsere Produkte</h2>

            <div style={productGridStyle}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onInquiry={openInquiry}
                />
              ))}
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

