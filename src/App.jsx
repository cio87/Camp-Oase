import { useEffect, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CampOaseApp />} />
      <Route path="/admin" element={<CampOaseApp admin />} />
      <Route path="/produkt/:id" element={<CampOaseApp detail />} />
    </Routes>
  );
}

function CampOaseApp({ admin = false, detail = false }) {
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [adminTab, setAdminTab] = useState("products");

  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { id } = useParams();

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    file: null,
  });

  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState("");

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

      const fileName = `${Date.now()}-${cleanFileName}`;

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

    let error;

    if (editingId) {
      const response = await supabase
        .from("products")
        .update({
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          image: imageUrl,
        })
        .eq("id", editingId);

      error = response.error;
    } else {
      const response = await supabase.from("products").insert([
        {
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          image: imageUrl,
        },
      ]);

      error = response.error;
    }

    if (error) {
      alert("Produkt konnte nicht gespeichert werden: " + error.message);
      return;
    }

    setNewProduct({
      title: "",
      description: "",
      price: "",
      image: "",
      file: null,
    });

    setEditingId(null);
    await loadProducts();
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

  function openInquiry(product) {
    setInquiryProduct(product);
    setInquiryStatus("");
    setInquiryForm({
      name: "",
      email: "",
      message: `Hallo Camp Oase,

ich interessiere mich für folgendes Produkt:

${product.title}
Preis: ${product.price}

Meine Frage dazu:
`,
    });
  }

  function closeInquiry() {
    setInquiryProduct(null);
    setInquiryStatus("");
    setInquiryForm({
      name: "",
      email: "",
      message: "",
    });
  }

  async function submitInquiry(e) {
    e.preventDefault();

    if (!inquiryProduct) return;

    const { error } = await supabase.from("inquiries").insert([
      {
        product_title: inquiryProduct.title,
        name: inquiryForm.name,
        email: inquiryForm.email,
        message: inquiryForm.message,
      },
    ]);

    if (error) {
      setInquiryStatus("Die Anfrage konnte leider nicht gesendet werden.");
      console.log(error);
      return;
    }

    setInquiryStatus("Danke! Deine Anfrage wurde erfolgreich gesendet.");

    setTimeout(() => {
      closeInquiry();
    }, 1800);
  }

  if (detail) {
    const product = products.find((item) => String(item.id) === id);

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

          <section style={{ padding: "60px 40px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: "100%",
                  maxHeight: "520px",
                  objectFit: "contain",
                  background: "#f5f1e8",
                  borderRadius: "32px",
                  boxShadow: "0 14px 35px rgba(0,0,0,0.08)",
                }}
              />

              <h1 style={{ fontSize: "48px", color: "#435749" }}>
                {product.title}
              </h1>

              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.9",
                  color: "#5f5f5f",
                  maxWidth: "720px",
                  marginTop: "24px",
                  whiteSpace: "pre-line",
                }}
              >
                {product.description}
              </p>

              <div style={{ marginTop: "28px" }}>
                <strong style={{ fontSize: "32px", color: "#556b5d" }}>
                  {product.price}
                </strong>

                <br />

                <button
                  onClick={() => openInquiry(product)}
                  style={{
                    ...requestButtonStyle,
                    marginTop: "24px",
                    fontSize: "16px",
                    padding: "14px 22px",
                  }}
                >
                  Anfrage senden
                </button>
              </div>
            </div>
          </section>
        </div>

        {inquiryProduct && (
          <InquiryModal
            product={inquiryProduct}
            form={inquiryForm}
            setForm={setInquiryForm}
            status={inquiryStatus}
            onClose={closeInquiry}
            onSubmit={submitInquiry}
          />
        )}
      </>
    );
  }

  if (admin) {
    return (
      <div style={pageStyle}>
        <Link to="/" style={{ color: "#556b5d" }}>
          ← Zur Webseite
        </Link>

        <h1 style={{ marginTop: "30px" }}>Camp Oase Admin</h1>

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
              <>
                <form onSubmit={addProduct} style={formStyle}>
                  <h2>
                    {editingId
                      ? "Produkt bearbeiten"
                      : "Neues Produkt hinzufügen"}
                  </h2>

                  <input
                    placeholder="Produktname"
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, title: e.target.value })
                    }
                    style={inputStyle}
                  />

                  <textarea
                    placeholder="Beschreibung"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    style={{ ...inputStyle, minHeight: "120px" }}
                  />

                  <input
                    placeholder="Preis z.B. 14,99 €"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    style={inputStyle}
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        file: e.target.files[0],
                      })
                    }
                    style={inputStyle}
                  />

                  <button style={buttonStyle}>
                    {editingId ? "Änderungen speichern" : "Produkt speichern"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setNewProduct({
                          title: "",
                          description: "",
                          price: "",
                          image: "",
                          file: null,
                        });
                      }}
                      style={{
                        ...buttonStyle,
                        background: "#9b4d4d",
                        marginLeft: "10px",
                      }}
                    >
                      Abbrechen
                    </button>
                  )}
                </form>

                <h2 style={{ marginTop: "50px" }}>Produkte verwalten</h2>

                <div
                  style={{ display: "grid", gap: "16px", marginTop: "20px" }}
                >
                  {products.map((product) => (
                    <div key={product.id} style={adminProductStyle}>
                      <div>
                        <strong>{product.title}</strong>
                        <p style={{ margin: "6px 0", color: "#666" }}>
                          {product.price}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setNewProduct({
                              title: product.title,
                              description: product.description,
                              price: product.price,
                              image: product.image,
                              file: null,
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={editButtonStyle}
                        >
                          Bearbeiten
                        </button>

                        <button
                          onClick={() => deleteProduct(product.id)}
                          style={deleteButtonStyle}
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {adminTab === "inquiries" && (
              <>
                <h2 style={{ marginTop: "40px" }}>Kundenanfragen</h2>

                {inquiries.length === 0 ? (
                  <div style={emptyBoxStyle}>
                    Noch keine Anfragen vorhanden.
                  </div>
                ) : (
                  <div
                    style={{ display: "grid", gap: "16px", marginTop: "20px" }}
                  >
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} style={inquiryCardStyle}>
                        <div>
                          <p style={inquiryMetaStyle}>
                            {inquiry.created_at
                              ? new Date(inquiry.created_at).toLocaleString(
                                  "de-DE"
                                )
                              : "Kein Datum"}
                          </p>

                          <h3 style={{ margin: "0 0 8px", color: "#435749" }}>
                            {inquiry.product_title}
                          </h3>

                          <p style={{ margin: "4px 0" }}>
                            <strong>Name:</strong> {inquiry.name}
                          </p>

                          <p style={{ margin: "4px 0" }}>
                            <strong>E-Mail:</strong>{" "}
                            <a
                              href={`mailto:${inquiry.email}`}
                              style={{ color: "#556b5d" }}
                            >
                              {inquiry.email}
                            </a>
                          </p>

                          <p style={inquiryMessageStyle}>
                            {inquiry.message}
                          </p>
<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "16px",
    flexWrap: "wrap",
  }}
>
  <a
    href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
      `Antwort zu deiner Anfrage: ${inquiry.product_title}`
    )}&body=${encodeURIComponent(
      `Hallo ${inquiry.name},

vielen Dank für deine Anfrage zu "${inquiry.product_title}".

`
    )}`}
    style={{ ...editButtonStyle, textDecoration: "none" }}
  >
    Antworten
  </a>

  <button
    onClick={() => deleteInquiry(inquiry.id)}
    style={deleteButtonStyle}
  >
    Löschen
  </button>
</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div style={siteStyle}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img src="/logo.png" alt="Camp Oase Logo" style={logoStyle} />
            <strong style={{ fontSize: "26px", color: "#556b5d" }}>
              Camp Oase
            </strong>
          </div>

          <Link to="/admin" style={adminButtonStyle}>
            Admin
          </Link>
        </header>

        <section style={heroStyle}>
          <p style={badgeStyle}>Camping • Caravan • Handmade</p>

          <h1
            style={{
              fontSize: "clamp(36px, 8vw, 64px)",
              margin: "0",
              color: "#435749",
              lineHeight: "1.1",
            }}
          >
            Willkommen bei Camp Oase
          </h1>

          <p style={heroTextStyle}>
            Liebevoll gestaltete Camping-Produkte, Deko und Zubehör für dein
            persönliches Zuhause auf Rädern.
          </p>
        </section>

        <section style={{ padding: "60px 40px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <p style={{ color: "#7f9b76", fontWeight: "bold" }}>
              Produktübersicht
            </p>

            <h2 style={{ fontSize: "38px", marginTop: "8px" }}>
              Unsere Produkte
            </h2>

            <div style={productGridStyle}>
              {products.map((product) => (
                <article key={product.id} style={productCardStyle}>
                  <Link
                    to={`/produkt/${product.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      style={productImageStyle}
                    />

                    <div style={{ padding: "24px 24px 0" }}>
                      <h3 style={{ fontSize: "24px", margin: "0 0 10px" }}>
                        {product.title}
                      </h3>

                      <p
                        style={{
                          color: "#666",
                          lineHeight: "1.6",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "78px",
                        }}
                      >
                        {product.description}
                      </p>
                    </div>
                  </Link>

                  <div style={{ padding: "0 24px 24px" }}>
                    <div style={priceRowStyle}>
                      <strong style={{ fontSize: "22px", color: "#556b5d" }}>
                        {product.price}
                      </strong>

                      <button
                        type="button"
                        style={requestButtonStyle}
                        onClick={() => openInquiry(product)}
                      >
                        Anfragen
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {inquiryProduct && (
        <InquiryModal
          product={inquiryProduct}
          form={inquiryForm}
          setForm={setInquiryForm}
          status={inquiryStatus}
          onClose={closeInquiry}
          onSubmit={submitInquiry}
        />
      )}
    </>
  );
}

function InquiryModal({ product, form, setForm, status, onClose, onSubmit }) {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={modalCloseButtonStyle}>
          ×
        </button>

        <h2 style={{ marginTop: 0, color: "#435749" }}>Produkt anfragen</h2>

        <p style={{ color: "#666", lineHeight: "1.6" }}>
          Du interessierst dich für:
          <br />
          <strong style={{ color: "#556b5d" }}>{product.title}</strong>
        </p>

        <form onSubmit={onSubmit}>
          <input
            required
            placeholder="Dein Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />

          <input
            required
            type="email"
            placeholder="Deine E-Mail-Adresse"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <textarea
            required
            placeholder="Deine Nachricht"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, minHeight: "160px" }}
          />

          <button style={buttonStyle}>Anfrage absenden</button>

          {status && (
            <p
              style={{
                marginTop: "16px",
                color: "#556b5d",
                fontWeight: "bold",
              }}
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

const siteStyle = {
  background: "#f5f1e8",
  minHeight: "100vh",
  fontFamily: "Arial, sans-serif",
  color: "#2f3e34",
};

const pageStyle = {
  ...siteStyle,
  padding: "40px",
};

const headerStyle = {
  padding: "20px max(24px, calc((100vw - 1200px) / 2))",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(10px)",
};

const logoStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  objectFit: "cover",
};

const heroStyle = {
  padding: "clamp(50px, 8vw, 90px) 20px",
  textAlign: "center",
  background: "linear-gradient(135deg, #dfe8df, #f5f1e8, #efe2c6)",
};

const badgeStyle = {
  display: "inline-block",
  background: "white",
  padding: "8px 16px",
  borderRadius: "999px",
  color: "#556b5d",
  marginBottom: "20px",
};

const heroTextStyle = {
  fontSize: "clamp(16px, 4vw, 20px)",
  maxWidth: "700px",
  margin: "24px auto 0",
  color: "#6b756d",
  lineHeight: "1.6",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
  gap: "28px",
  marginTop: "32px",
};

const productCardStyle = {
  background: "white",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 14px 35px rgba(0,0,0,0.08)",
};

const productImageStyle = {
  width: "100%",
  height: "240px",
  objectFit: "contain",
  background: "#f5f1e8",
};

const priceRowStyle = {
  marginTop: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const formStyle = {
  maxWidth: "700px",
  background: "white",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  marginTop: "30px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "12px",
  marginBottom: "12px",
  borderRadius: "14px",
  border: "1px solid #ddd",
  fontSize: "16px",
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "#556b5d",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "16px",
};

const adminButtonStyle = {
  background: "#556b5d",
  color: "white",
  padding: "10px 18px",
  borderRadius: "999px",
  textDecoration: "none",
  fontSize: "14px",
};

const requestButtonStyle = {
  background: "#2f3e34",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "14px",
  cursor: "pointer",
};

const deleteButtonStyle = {
  background: "#9b4d4d",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

const editButtonStyle = {
  background: "#d9c7a2",
  color: "#2f3e34",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

const adminProductStyle = {
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const adminTabsStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "32px",
  marginBottom: "10px",
  flexWrap: "wrap",
};

const adminTabButtonStyle = {
  background: "white",
  color: "#556b5d",
  border: "1px solid #d6d3cc",
  padding: "12px 18px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

const adminTabActiveStyle = {
  background: "#556b5d",
  color: "white",
  border: "1px solid #556b5d",
};

const inquiryBadgeStyle = {
  background: "#d9c7a2",
  color: "#2f3e34",
  padding: "2px 8px",
  borderRadius: "999px",
  marginLeft: "6px",
  fontSize: "13px",
};

const inquiryCardStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const inquiryMetaStyle = {
  color: "#888",
  fontSize: "14px",
  margin: "0 0 8px",
};

const inquiryMessageStyle = {
  marginTop: "16px",
  padding: "16px",
  background: "#f5f1e8",
  borderRadius: "14px",
  color: "#444",
  whiteSpace: "pre-line",
  lineHeight: "1.6",
};

const emptyBoxStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  color: "#666",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "560px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "28px",
  padding: "32px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const modalCloseButtonStyle = {
  position: "absolute",
  right: "18px",
  top: "14px",
  border: "none",
  background: "transparent",
  fontSize: "34px",
  cursor: "pointer",
  color: "#556b5d",
};