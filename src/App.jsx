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

  useEffect(() => {
    loadProducts();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  async function login(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert("Login fehlgeschlagen: " + error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
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

  if (detail) {
    const product = products.find((item) => String(item.id) === id);

    if (!product) {
      return <div style={pageStyle}>Produkt wird geladen...</div>;
    }

    return (
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
                objectFit: "cover",
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

            <strong style={{ fontSize: "32px", color: "#556b5d" }}>
              {product.price}
            </strong>
          </div>
        </section>
      </div>
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

            <form onSubmit={addProduct} style={formStyle}>
              <h2>
                {editingId ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}
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

            <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
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
      </div>
    );
  }

  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <img src="/logo.png" alt="Camp Oase Logo" style={logoStyle} />
          <strong style={{ fontSize: "24px", color: "#556b5d" }}>
            Camp Oase
          </strong>
        </div>

        <Link to="/admin" style={adminButtonStyle}>
          Admin
        </Link>
      </header>

      <section style={heroStyle}>
        <p style={badgeStyle}>Camping • Caravan • Handmade</p>

        <h1 style={{ fontSize: "64px", margin: "0", color: "#435749" }}>
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
              <Link
                key={product.id}
                to={`/produkt/${product.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article style={productCardStyle}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={productImageStyle}
                  />

                  <div style={{ padding: "24px" }}>
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

                    <div style={priceRowStyle}>
                      <strong style={{ fontSize: "22px", color: "#556b5d" }}>
                        {product.price}
                      </strong>

                      <button style={requestButtonStyle}>Anfragen</button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
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
  padding: "24px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(10px)",
};

const logoStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  objectFit: "cover",
};

const heroStyle = {
  padding: "90px 30px",
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
  fontSize: "20px",
  maxWidth: "700px",
  margin: "24px auto 0",
  color: "#6b756d",
  lineHeight: "1.6",
};

const productGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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