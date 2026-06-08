import { useEffect, useState } from "react";
import InquiryModal from "../components/InquiryModal";
import ProductCard from "../components/ProductCard";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import { isProductVisible } from "../utils/availability";
import { getEmptyInquiryForm } from "../utils/price";
import {
  badgeStyle,
  heroStyle,
  heroTextStyle,
  heroTitleStyle,
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

    const { error } = await supabase.from("inquiries").insert([
      {
        product_title: inquiryProduct.title,
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: inquiryForm.message,
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
        <PublicHeader />

        <section style={heroStyle}>
          <p style={badgeStyle}>Camping • Caravan • Handmade</p>

          <h1 style={heroTitleStyle}>Willkommen bei Camp Oase</h1>

          <p style={heroTextStyle}>
            Liebevoll gestaltete Camping-Produkte, Deko und Zubehör für dein
            persönliches Zuhause auf Rädern.
          </p>
        </section>

        <section id="produkte" style={sectionStyle}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ color: "#7f9b76", fontWeight: "bold" }}>
              Produktübersicht
            </p>

            <h2 style={sectionTitleStyle}>Unsere Produkte</h2>

            <div style={productGridStyle}>
              {products.filter(isProductVisible).map((product) => (
                <ProductCard key={product.id} product={product} />
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
          inquiryMode="question"
          submitButtonText="Frage absenden"
        />
      )}
    </>
  );
}
