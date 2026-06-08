import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminInquiries from "../components/AdminInquiries";
import AdminProducts from "../components/AdminProducts";
import { supabase } from "../supabaseClient";
import { getEmptyProduct, getProductExtras } from "../utils/price";
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

  useEffect(() => {
    loadProducts();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);

      if (data.session) {
        loadInquiries();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        loadInquiries();
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
    else setProducts(data || []);
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

  async function addProduct(e) {
    e.preventDefault();

    let imageUrl = newProduct.image;

    if (newProduct.file) {
      const cleanFileName = newProduct.file.name
        .toLowerCase()
        .replaceAll("ä", "ae")
        .replaceAll("ö", "oe")
        .replaceAll("ü", "ue")
        .replaceAll("ß", "ss")
        .replace(/[^a-z0-9.-]/g, "-");

      const fileName = Date.now() + "-" + cleanFileName;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, newProduct.file);

      if (uploadError) {
        alert("Bild-Upload fehlgeschlagen: " + uploadError.message);
        return;
      }

      imageUrl = supabase.storage.from("products").getPublicUrl(fileName).data
        .publicUrl;
    }

    if (!imageUrl) {
      alert("Bitte ein Bild auswählen");
      return;
    }

    const cleanedExtras = (newProduct.custom_extras || [])
      .filter((extra) => String(extra.name || "").trim())
      .map((extra) => ({
        name: String(extra.name || "").trim(),
        description: String(extra.description || "").trim(),
        price: Number(extra.price || 0),
      }));

    const productPayload = {
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      image: imageUrl,
      availability_status: newProduct.availability_status || "available",
      extras_enabled: newProduct.extras_enabled && cleanedExtras.length > 0,
      custom_extras: cleanedExtras,
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
        { name: "", description: "", price: "0" },
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
      availability_status: product.availability_status || "available",
      extras_enabled: Boolean(product.extras_enabled),
      custom_extras: getProductExtras(product).map((extra) => ({
        name: extra.name || "",
        description: extra.description || "",
        price: String(extra.price ?? "0"),
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
        <Link to="/" style={{ color: "#556b5d" }}>
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
          </>
        )}
      </div>
    </div>
  );
}

