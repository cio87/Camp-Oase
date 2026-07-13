import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnnouncementBanner from "../components/AnnouncementBanner";
import InquiryModal from "../components/InquiryModal";
import ProductCard from "../components/ProductCard";
import PublicHeader from "../components/PublicHeader";
import SiteFooter from "../components/SiteFooter";
import { supabase } from "../supabaseClient";
import { isProductVisible } from "../utils/availability";
import { getEmptyInquiryForm } from "../utils/price";
import { sortProductsByDisplayOrder } from "../utils/products";
import { usePageSeo } from "../utils/seo";
import {
  buttonStyle,
  productGridStyle,
  secondaryButtonStyle,
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

  usePageSeo(
    "Camp Oase | Liebevolle Camping-Produkte & Geschenkideen",
    "Liebevoll gestaltete Camping-Produkte, Deko und Geschenkideen für Camper, Wohnwagen, Wohnmobil und Vanlife."
  );

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.log(error);
    else setProducts(sortProductsByDisplayOrder(data || []));
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

        <section className="home-hero">
          <div className="home-hero__inner">
            <div className="home-hero__content">
              <p className="home-hero__eyebrow">Camp Oase für unterwegs</p>
              <h1>Persönliche Camping-Produkte für deine kleine Oase</h1>
              <p className="home-hero__text">
                Entdecke personalisierbare Geschenkideen und besondere Details für
                Wohnwagen, Wohnmobil und Vanlife – passend für dich gestaltet.
              </p>

              <div className="home-hero__actions">
                <a href="#produkte" style={buttonStyle}>
                  Produkte entdecken
                </a>
                <Link to="/ueber-uns" style={secondaryButtonStyle}>
                  Mehr über Camp Oase
                </Link>
              </div>

              <p className="home-hero__trust">
                Personalisierbar <span aria-hidden="true">·</span> Mit Liebe gestaltet{" "}
                <span aria-hidden="true">·</span> Für Camper
              </p>
            </div>

            <div className="home-hero__image-wrap">
              <img
                src="/images/hero-camping.png"
                alt="Gemütlicher Campingplatz am See bei Sonnenuntergang"
                className="home-hero__image"
              />
            </div>
          </div>
        </section>

        <AnnouncementBanner />

        <section id="produkte" style={sectionStyle}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <p style={{ color: "#6f8069", fontWeight: "bold" }}>
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
