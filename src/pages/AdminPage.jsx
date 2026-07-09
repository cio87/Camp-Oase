import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminContactMessages from "../components/AdminContactMessages";
import AdminInquiries from "../components/AdminInquiries";
import AdminProducts from "../components/AdminProducts";
import AdminSiteSettings from "../components/AdminSiteSettings";
import { supabase } from "../supabaseClient";
import { getProductBadgeValues } from "../utils/productBadges";
import { getProductVariants, serializeProductVariant } from "../utils/productVariants";
import { sortProductsByDisplayOrder } from "../utils/products";
import { createSlug } from "../utils/slug";
import {
  clampDiscountPercent,
  getEmptyProduct,
  getProductExtras,
  getStockQuantity,
} from "../utils/price";
import { usePageSeo } from "../utils/seo";
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
  const [contactMessages, setContactMessages] = useState([]);
  const [adminTab, setAdminTab] = useState("products");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");
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
    maintenance_password: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState("");
  const [invoiceSettings, setInvoiceSettings] = useState({
    id: "main",
    invoice_mode: "test",
  });
  const [numberSequences, setNumberSequences] = useState([]);
  const [numberSettingsSaving, setNumberSettingsSaving] = useState(false);
  const [numberSettingsStatus, setNumberSettingsStatus] = useState("");

  usePageSeo("Admin | Camp Oase", "Adminbereich von Camp Oase.");

  useEffect(() => {
    loadProducts();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session) {
        loadInquiries();
        loadContactMessages();
        loadSiteSettings();
        loadInvoiceNumberSettings();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        loadInquiries();
        loadContactMessages();
        loadSiteSettings();
        loadInvoiceNumberSettings();
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
        maintenance_password: data.maintenance_password || "",
      });
    }
  }

  async function loadInvoiceNumberSettings() {
    const { data: settingsData, error: settingsError } = await supabase
      .from("invoice_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (settingsError) {
      console.log(settingsError);
    } else if (settingsData) {
      setInvoiceSettings({
        id: "main",
        invoice_mode: settingsData.invoice_mode || "test",
      });
    }

    const { data: sequenceData, error: sequenceError } = await supabase
      .from("number_sequences")
      .select("*")
      .in("id", [
        "test_invoice",
        "live_invoice",
        "test_customer",
        "live_customer",
        "test_order",
        "live_order",
      ]);

    if (sequenceError) {
      console.log(sequenceError);
      return;
    }

    setNumberSequences(sequenceData || []);
  }

  function getSequencePrefix(sequenceId) {
    const fallbacks = {
      test_invoice: "TEST-R",
      live_invoice: "CO-R",
      test_customer: "TEST-KD",
      live_customer: "KD",
      test_order: "TEST-B",
      live_order: "CO-B",
    };
    const sequence = numberSequences.find((item) => item.id === sequenceId);

    return sequence?.prefix || fallbacks[sequenceId] || "";
  }

  function formatSequenceNumber(sequenceId, nextNumber, year = new Date().getFullYear()) {
    const prefix = getSequencePrefix(sequenceId);
    const number = Number(nextNumber || 1);

    return `${prefix}-${year}-${String(number).padStart(4, "0")}`;
  }

  function getNextSequenceLabel(sequenceId) {
    const sequence = numberSequences.find((item) => item.id === sequenceId);

    return formatSequenceNumber(sequenceId, sequence?.next_number || 1);
  }

  async function allocateSequenceNumber(sequenceId, year) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: sequence, error: loadError } = await supabase
        .from("number_sequences")
        .select("*")
        .eq("id", sequenceId)
        .maybeSingle();

      if (loadError || !sequence) {
        throw new Error("Nummernkreis konnte nicht geladen werden.");
      }

      const currentNumber = Number(sequence.next_number || 1);
      const formattedNumber = `${sequence.prefix || getSequencePrefix(sequenceId)}-${year}-${String(
        currentNumber
      ).padStart(4, "0")}`;

      const { data: updatedRows, error: updateError } = await supabase
        .from("number_sequences")
        .update({
          next_number: currentNumber + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sequenceId)
        .eq("next_number", currentNumber)
        .select("id");

      if (updateError) {
        throw updateError;
      }

      if ((updatedRows || []).length > 0) {
        return formattedNumber;
      }
    }

    throw new Error("Nummernkreis wurde parallel geändert. Bitte erneut versuchen.");
  }

  async function prepareInvoiceNumbers(inquiry) {
    const existingInquiry = inquiries.find((item) => item.id === inquiry.id) || inquiry;
    const invoiceDate = existingInquiry.invoice_created_at
      ? new Date(existingInquiry.invoice_created_at)
      : new Date();
    const year = invoiceDate.getFullYear();
    const mode = invoiceSettings.invoice_mode === "live" ? "live" : "test";
    const updates = {};

    try {
      if (!existingInquiry.invoice_number) {
        updates.invoice_number = await allocateSequenceNumber(`${mode}_invoice`, year);
      }

      if (!existingInquiry.customer_number) {
        updates.customer_number = await allocateSequenceNumber(`${mode}_customer`, year);
      }

      if (!existingInquiry.order_number) {
        updates.order_number = await allocateSequenceNumber(`${mode}_order`, year);
      }

      if (!existingInquiry.invoice_created_at) {
        updates.invoice_created_at = new Date().toISOString();
      }

      if (Object.keys(updates).length === 0) {
        return existingInquiry;
      }

      const { data, error } = await supabase
        .from("inquiries")
        .update(updates)
        .eq("id", existingInquiry.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      await loadInquiries();
      await loadInvoiceNumberSettings();
      return data;
    } catch (error) {
      alert("Rechnungsnummern konnten nicht erstellt werden: " + error.message);
      await loadInvoiceNumberSettings();
      return null;
    }
  }

  async function updateInvoiceMode(mode) {
    const cleanMode = mode === "live" ? "live" : "test";

    setNumberSettingsSaving(true);
    setNumberSettingsStatus("");

    const { error } = await supabase.from("invoice_settings").upsert({
      id: "main",
      invoice_mode: cleanMode,
      updated_at: new Date().toISOString(),
    });

    setNumberSettingsSaving(false);

    if (error) {
      alert("Rechnungsmodus konnte nicht gespeichert werden: " + error.message);
      return;
    }

    setNumberSettingsStatus("mode-success");
    await loadInvoiceNumberSettings();
  }

  async function resetTestNumberSequences() {
    const ok = confirm("Test-Zähler wirklich auf 1 zurücksetzen?");
    if (!ok) return;

    setNumberSettingsSaving(true);
    setNumberSettingsStatus("");

    const { error } = await supabase
      .from("number_sequences")
      .update({ next_number: 1, updated_at: new Date().toISOString() })
      .in("id", ["test_invoice", "test_customer", "test_order"]);

    setNumberSettingsSaving(false);

    if (error) {
      alert("Test-Zähler konnten nicht zurückgesetzt werden: " + error.message);
      return;
    }

    setNumberSettingsStatus("reset-success");
    await loadInvoiceNumberSettings();
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
      maintenance_password: siteSettings.maintenance_password || "",
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

  async function loadContactMessages() {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setContactMessages(data || []);
  }

  async function login(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert("Login fehlgeschlagen: " + error.message);
    else {
      await loadInquiries();
      await loadContactMessages();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setInquiries([]);
    setContactMessages([]);
    setAdminTab("products");
  }

  async function uploadProductImage(file) {
    const cleanFileName = file.name
      .toLowerCase()
      .replaceAll("ä", "ae")
      .replaceAll("ö", "oe")
      .replaceAll("ü", "ue")
      .replaceAll("ß", "ss")
      .replaceAll("ä", "ae")
      .replaceAll("ö", "oe")
      .replaceAll("ü", "ue")
      .replaceAll("ß", "ss")
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

    const cleanedExtras = [];

    for (const extra of newProduct.custom_extras || []) {
      if (!String(extra.name || "").trim()) continue;

      let partnerImageUrl = String(extra.partner_image_url || "").trim();

      if (extra.partner_image_file) {
        partnerImageUrl = await uploadProductImage(extra.partner_image_file);
        if (!partnerImageUrl) return;
      }

      cleanedExtras.push({
        name: String(extra.name || "").trim(),
        description: String(extra.description || "").trim(),
        price: Number(extra.price || 0),
        discount_enabled: Boolean(extra.discount_enabled),
        discount_percent: clampDiscountPercent(extra.discount_percent),
        discount_label: String(extra.discount_label || "").trim(),
        partner_enabled: Boolean(extra.partner_enabled),
        partner_name: String(extra.partner_name || "").trim(),
        partner_text: String(extra.partner_text || "").trim(),
        partner_image_url: partnerImageUrl,
        partner_link_url: String(extra.partner_link_url || "").trim(),
        partner_link_label: String(extra.partner_link_label || "").trim(),
      });
    }
    const cleanedVariants = await getCleanedProductVariants();

    if (!cleanedVariants) return;

    const productPayload = {
      title: newProduct.title,
      short_description: String(newProduct.short_description || "").trim(),
      slug: createSlug(newProduct.slug || newProduct.title),
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
          partner_enabled: false,
          partner_name: "",
          partner_text: "",
          partner_image_url: "",
          partner_image_file: null,
          partner_link_url: "",
          partner_link_label: "",
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
      return false;
    }

    await loadInquiries();
    return true;
  }

  async function updateContactMessageStatus(id, status) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert("Kontaktstatus konnte nicht aktualisiert werden: " + error.message);
      return;
    }

    await loadContactMessages();
  }

  async function deleteContactMessage(id) {
    const ok = confirm("Kontaktanfrage wirklich löschen?");
    if (!ok) return;

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Kontaktanfrage konnte nicht gelöscht werden: " + error.message);
      return;
    }

    await loadContactMessages();
  }

  function editProduct(product) {
    setEditingId(product.id);
    setNewProduct({
      title: product.title,
      short_description: product.short_description || "",
      slug: product.slug || "",
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
        partner_enabled: Boolean(extra.partner_enabled),
        partner_name: extra.partner_name || "",
        partner_text: extra.partner_text || "",
        partner_image_url: extra.partner_image_url || "",
        partner_image_file: null,
        partner_link_url: extra.partner_link_url || "",
        partner_link_label: extra.partner_link_label || "",
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus =
      inquiryStatusFilter === "all" ||
      (inquiry.status || "offen") === inquiryStatusFilter;
    const searchTerm = inquirySearch.trim().toLowerCase();

    if (!matchesStatus) return false;
    if (!searchTerm) return true;

    const searchableParts = [
      inquiry.name,
      inquiry.email,
      inquiry.message,
      inquiry.product_title,
      inquiry.invoice_number,
      inquiry.customer_number,
      inquiry.order_number,
      JSON.stringify(inquiry.selected_extras || {}),
    ];

    return searchableParts
      .filter(Boolean)
      .some((part) => String(part).toLowerCase().includes(searchTerm));
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
                  setAdminTab("contact");
                  loadContactMessages();
                }}
                style={{
                  ...adminTabButtonStyle,
                  ...(adminTab === "contact" ? adminTabActiveStyle : {}),
                }}
              >
                Kontakt{" "}
                {contactMessages.length > 0 && (
                  <span style={inquiryBadgeStyle}>{contactMessages.length}</span>
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
                searchValue={inquirySearch}
                setSearchValue={setInquirySearch}
                onUpdateStatus={updateInquiryStatus}
                onDeleteInquiry={deleteInquiry}
                onPrepareInvoice={prepareInvoiceNumbers}
              />
            )}

            {adminTab === "contact" && (
              <AdminContactMessages
                messages={contactMessages}
                onUpdateStatus={updateContactMessageStatus}
                onDeleteMessage={deleteContactMessage}
              />
            )}

            {adminTab === "website" && (
              <AdminSiteSettings
                settings={siteSettings}
                setSettings={setSiteSettings}
                saving={settingsSaving}
                saveStatus={settingsSaveStatus}
                onSave={saveSiteSettings}
                invoiceSettings={invoiceSettings}
                numberSequences={numberSequences}
                numberSettingsSaving={numberSettingsSaving}
                numberSettingsStatus={numberSettingsStatus}
                getNextSequenceLabel={getNextSequenceLabel}
                onInvoiceModeChange={updateInvoiceMode}
                onResetTestSequences={resetTestNumberSequences}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

