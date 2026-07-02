import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminInquiries from "../components/AdminInquiries";
import AdminProducts from "../components/AdminProducts";
import AdminSiteSettings from "../components/AdminSiteSettings";
import { supabase } from "../supabaseClient";
import { getProductBadgeValues } from "../utils/productBadges";
import { getProductVariants, serializeProductVariant } from "../utils/productVariants";
import { sortProductsByDisplayOrder } from "../utils/products";
import {
  clampDiscountPercent,
  getEmptyProduct,
  getProductExtras,
  getStockQuantity,
} from "../utils/price";
import {
  adminShellStyle,
  adminTabActiveStyle,
  adminTabButtonStyle,
  adminTabsStyle,
  adminTitleStyle,
  buttonStyle,
  formStyle,
  inputStyle,
  inquiryBadgeStyle,
  pageStyle,
  pillBackLinkStyle,
} from "../styles";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [adminTab, setAdminTab] = useState("products");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState(getEmptyProduct());
  const [siteSettings, setSiteSettings] = useState({
    id: "main",
    announcement_enabled: false,
    announcement_text: "",
    announcement_mode: "static",
    announcement_link: "",
    checkout_enabled: false,
    payment_enabled: false,
    checkout_notice: "",
    maintenance_enabled: false,
    maintenance_title: "",
    maintenance_text: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState("");

  useEffect(() => {
    loadProducts();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session) {
        loadInquiries();
        loadSiteSettings();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        loadInquiries();
        loadSiteSettings();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) console.log(error);
    else setProducts(sortProductsByDisplayOrder(data || []));
  }

  async function loadSiteSettings() {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setSiteSettings({
        id: "main",
        announcement_enabled: Boolean(data.announcement_enabled),
        announcement_text: data.announcement_text || "",
        announcement_mode: data.announcement_mode || "static",
        announcement_link: data.announcement_link || "",
        checkout_enabled: Boolean(data.checkout_enabled),
        payment_enabled: Boolean(data.payment_enabled),
        checkout_notice: data.checkout_notice || "",
        maintenance_enabled: Boolean(data.maintenance_enabled),
        maintenance_title: data.maintenance_title || "",
        maintenance_text: data.maintenance_text || "",
      });
    }
  }

  async function saveSiteSettings(e) {
    e.preventDefault();

    setSettingsSaving(true);
    setSettingsSaveStatus("");

    const { error } = await supabase.from("site_settings").upsert({
      id: "main",
      announcement_enabled: Boolean(siteSettings.announcement_enabled),
      announcement_text: siteSettings.announcement_text || "",
      announcement_mode: siteSettings.announcement_mode || "static",
      announcement_link: siteSettings.announcement_link || "",
      checkout_enabled: Boolean(siteSettings.checkout_enabled),
      payment_enabled: Boolean(siteSettings.payment_enabled),
      checkout_notice: siteSettings.checkout_notice || "",
      maintenance_enabled: Boolean(siteSettings.maintenance_enabled),
      maintenance_title: siteSettings.maintenance_title || "",
      maintenance_text: siteSettings.maintenance_text || "",
      updated_at: new Date().toISOString(),
    });

    setSettingsSaving(false);

    if (error) {
      alert("Banner konnte nicht gespeichert werden: " + error.message);
      return;
    }

    setSettingsSaveStatus("success");
    await loadSiteSettings();
  }

  async function loadInquiries() {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setInquiries(data || []);
  }

  async function login(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert("Login fehlgeschlagen: " + error.message);
    else await loadInquiries();
  }

  async function logout() {
    await supabase.auth.signOut();
    setInquiries([]);
    setAdminTab("products");
  }

  async function uploadProductImage(file) {
    const cleanFileName = file.name
      .toLowerCase()
      .replaceAll("ä", "ae")
      .replaceAll("ö", "oe")
      .replaceAll("ü", "ue")
      .replaceAll("ß", "ss")
      .replaceAll("Ã¤", "ae")
      .replaceAll("Ã¶", "oe")
      .replaceAll("Ã¼", "ue")
      .replaceAll("ÃŸ", "ss")
      .replace(/[^a-z0-9.-]/g, "-");

    const uniquePart = Date.now() + "-" + Math.random().toString(16).slice(2);
    const fileName = uniquePart + "-" + cleanFileName;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (uploadError) {
      alert("Bild-Upload fehlgeschlagen: " + uploadError.message);
      return "";
    }

    return supabase.storage.from("products").getPublicUrl(fileName).data
      .publicUrl;
  }

  function getGalleryImages(product) {
    return Array.isArray(product?.gallery_images)
      ? product.gallery_images.filter(Boolean).slice(0, 3)
      : [];
  }

  async function getCleanedProductVariants() {
    const variants = Array.isArray(newProduct.product_variants)
      ? newProduct.product_variants
      : [];
    const cleanedVariants = [];

    for (const variant of variants) {
      const cleanedVariant = serializeProductVariant(variant);
      if (!cleanedVariant.name) continue;

      if (variant.image_file) {
        const uploadedImage = await uploadProductImage(variant.image_file);
        if (!uploadedImage) return null;
        cleanedVariant.image_url = uploadedImage;
      }

      cleanedVariants.push(cleanedVariant);
    }

    return cleanedVariants;
  }

  async function addProduct(e) {
    e.preventDefault();

    let imageUrl = newProduct.image;

    if (newProduct.file) {
      imageUrl = await uploadProductImage(newProduct.file);
      if (!imageUrl) return;
    }

    if (!imageUrl) {
      alert("Bitte ein Bild auswählen");
      return;
    }

    const galleryImages = [];
    const existingGalleryImages = getGalleryImages(newProduct);
    const galleryFiles = Array.isArray(newProduct.galleryFiles)
      ? newProduct.galleryFiles
      : [];

    for (let index = 0; index < 3; index += 1) {
      if (galleryFiles[index]) {
        const uploadedImage = await uploadProductImage(galleryFiles[index]);
        if (!uploadedImage) return;
        galleryImages.push(uploadedImage);
      } else if (existingGalleryImages[index]) {
        galleryImages.push(existingGalleryImages[index]);
      }
    }

    const cleanedExtras = (newProduct.custom_extras || [])
      .filter((extra) => String(extra.name || "").trim())
      .map((extra) => ({
        name: String(extra.name || "").trim(),
        description: String(extra.description || "").trim(),
        price: Number(extra.price || 0),
        discount_enabled: Boolean(extra.discount_enabled),
        discount_percent: clampDiscountPercent(extra.discount_percent),
        discount_label: String(extra.discount_label || "").trim(),
      }));
    const cleanedVariants = await getCleanedProductVariants();

    if (!cleanedVariants) return;

    const productPayload = {
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      image: imageUrl,
      sort_order: Number(newProduct.sort_order || 0),
      availability_status: newProduct.availability_status || "available",
      product_badges: getProductBadgeValues(newProduct),
      stock_quantity: getStockQuantity(newProduct),
      discount_enabled: Boolean(newProduct.discount_enabled),
      discount_percent: clampDiscountPercent(newProduct.discount_percent),
      discount_label: String(newProduct.discount_label || "").trim(),
      extras_enabled: newProduct.extras_enabled && cleanedExtras.length > 0,
      custom_extras: cleanedExtras,
      gallery_images: galleryImages,
      product_variants: cleanedVariants,
    };

    let error;

    if (editingId) {
      const response = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", editingId);

      error = response.error;
    } else {
      const response = await supabase.from("products").insert([productPayload]);
      error = response.error;
    }

    if (error) {
      alert("Produkt konnte nicht gespeichert werden: " + error.message);
      return;
    }

    resetProductForm();
    await loadProducts();
  }

  function resetProductForm() {
    setNewProduct(getEmptyProduct());
    setEditingId(null);
  }

  function addCustomExtra() {
    setNewProduct({
      ...newProduct,
      custom_extras: [
        ...(newProduct.custom_extras || []),
        {
          name: "",
          description: "",
          price: "0",
          discount_enabled: false,
          discount_percent: "",
          discount_label: "",
        },
      ],
    });
  }

  function updateCustomExtra(index, field, value) {
    const updatedExtras = [...(newProduct.custom_extras || [])];
    updatedExtras[index] = { ...updatedExtras[index], [field]: value };

    setNewProduct({ ...newProduct, custom_extras: updatedExtras });
  }

  function removeCustomExtra(index) {
    const updatedExtras = [...(newProduct.custom_extras || [])];
    updatedExtras.splice(index, 1);

    setNewProduct({ ...newProduct, custom_extras: updatedExtras });
  }

  async function deleteProduct(id) {
    const ok = confirm("Produkt wirklich löschen?");
    if (!ok) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Produkt konnte nicht gelöscht werden: " + error.message);
      return;
    }

    await loadProducts();
  }

  async function deleteInquiry(id) {
    const ok = confirm("Anfrage wirklich löschen?");
    if (!ok) return;

    const { error } = await supabase.from("inquiries").delete().eq("id", id);

    if (error) {
      alert("Anfrage konnte nicht gelöscht werden: " + error.message);
      return;
    }

    await loadInquiries();
  }

  async function updateInquiryStatus(id, status) {
    const { error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Status konnte nicht aktualisiert werden: " + error.message);
      return;
    }

    await loadInquiries();
  }

  function editProduct(product) {
    setEditingId(product.id);
    setNewProduct({
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      file: null,
      gallery_images: getGalleryImages(product),
      galleryFiles: [],
      product_variants: getProductVariants(product).map((variant) => ({
        ...variant,
        price_adjustment: String(variant.price_adjustment ?? 0),
        image_file: null,
      })),
      sort_order: Number(product.sort_order || 0),
      availability_status: product.availability_status || "available",
      product_badges: getProductBadgeValues(product),
      stock_quantity: getStockQuantity(product),
      discount_enabled: Boolean(product.discount_enabled),
      discount_percent: String(product.discount_percent ?? 0),
      discount_label: product.discount_label || "",
      extras_enabled: Boolean(product.extras_enabled),
      custom_extras: getProductExtras(product).map((extra) => ({
        name: extra.name || "",
        description: extra.description || "",
        price: String(extra.original_price ?? extra.price ?? "0"),
        discount_enabled: Boolean(extra.has_discount),
        discount_percent: String(extra.discount_percent ?? 0),
        discount_label: extra.discount_label || "",
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (inquiryStatusFilter === "all") return true;
    return (inquiry.status || "offen") === inquiryStatusFilter;
  });

  return (
    <div style={pageStyle}>
      <div style={adminShellStyle}>
        <Link to="/" style={pillBackLinkStyle}>
          ← Zur Webseite
        </Link>

        <h1 style={adminTitleStyle}>Camp Oase Admin</h1>

        {!session ? (
          <form onSubmit={login} style={formStyle}>
            <h2>Einloggen</h2>

            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <button style={buttonStyle}>Einloggen</button>
          </form>
        ) : (
          <>
            <button onClick={logout} style={buttonStyle}>
              Ausloggen
            </button>

            <div style={adminTabsStyle}>
              <button
                type="button"
                onClick={() => setAdminTab("products")}
                style={{
                  ...adminTabButtonStyle,
                  ...(adminTab === "products" ? adminTabActiveStyle : {}),
                }}
              >
                Produkte
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab("inquiries");
                  loadInquiries();
                }}
                style={{
                  ...adminTabButtonStyle,
                  ...(adminTab === "inquiries" ? adminTabActiveStyle : {}),
                }}
              >
                Anfragen{" "}
                {inquiries.length > 0 && (
                  <span style={inquiryBadgeStyle}>{inquiries.length}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminTab("website");
                  loadSiteSettings();
                }}
                style={{
                  ...adminTabButtonStyle,
                  ...(adminTab === "website" ? adminTabActiveStyle : {}),
                }}
              >
                Webseite
              </button>
            </div>

            {adminTab === "products" && (
              <AdminProducts
                products={products}
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                editingId={editingId}
                onSubmit={addProduct}
                onCancelEdit={resetProductForm}
                onAddExtra={addCustomExtra}
                onUpdateExtra={updateCustomExtra}
                onRemoveExtra={removeCustomExtra}
                onEditProduct={editProduct}
                onDeleteProduct={deleteProduct}
              />
            )}

            {adminTab === "inquiries" && (
              <AdminInquiries
                inquiries={filteredInquiries}
                statusFilter={inquiryStatusFilter}
                setStatusFilter={setInquiryStatusFilter}
                onUpdateStatus={updateInquiryStatus}
                onDeleteInquiry={deleteInquiry}
              />
            )}

            {adminTab === "website" && (
              <AdminSiteSettings
                settings={siteSettings}
                setSettings={setSiteSettings}
                saving={settingsSaving}
                saveStatus={settingsSaveStatus}
                onSave={saveSiteSettings}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

