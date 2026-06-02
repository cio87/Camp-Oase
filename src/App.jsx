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
      <Route path="/impressum" element={<LegalPage type="impressum" />} />
      <Route path="/datenschutz" element={<LegalPage type="datenschutz" />} />
    </Routes>
  );
}

function CampOaseApp({ admin = false, detail = false }) {
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [adminTab, setAdminTab] = useState("products");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");

  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { id } = useParams();

  const [newProduct, setNewProduct] = useState(getEmptyProduct());
  const [inquiryProduct, setInquiryProduct] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(getEmptyInquiryForm());
  const [inquiryStatus, setInquiryStatus] = useState("");
  const [inquirySending, setInquirySending] = useState(false);

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
    updatedExtras[index] = {
      ...updatedExtras[index],
      [field]: value,
    };

    setNewProduct({
      ...newProduct,
      custom_extras: updatedExtras,
    });
  }

  function removeCustomExtra(index) {
    const updatedExtras = [...(newProduct.custom_extras || [])];
    updatedExtras.splice(index, 1);

    setNewProduct({
      ...newProduct,
      custom_extras: updatedExtras,
    });
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

  function openInquiry(product) {
    setInquiryProduct(product);
    setInquiryStatus("");
    setInquiryForm({
      ...getEmptyInquiryForm(),
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

  if (detail) {
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
              <img
                src={product.image}
                alt={product.title}
                style={detailImageStyle}
              />

              <h1 style={detailTitleStyle}>{product.title}</h1>

              <p style={detailDescriptionStyle}>{product.description}</p>

              {productExtras.length > 0 && (
                <div style={extrasPreviewBoxStyle}>
                  <strong style={{ color: "#435749" }}>
                    Für dieses Produkt sind Extras möglich:
                  </strong>

                  <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                    {productExtras.map((extra, index) => (
                      <div key={`${extra.name}-${index}`} style={detailExtraLineStyle}>
                        <span>
                          <strong>{extra.name}</strong>
                          {extra.description && (
                            <small style={detailExtraDescriptionStyle}>
                              {extra.description}
                            </small>
                          )}
                        </span>

                        <span style={detailExtraPriceStyle}>
                          +{formatEuro(extra.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "28px" }}>
                <strong style={detailPriceStyle}>{product.price}</strong>

                <br />

                <button
                  onClick={() => openInquiry(product)}
                  style={detailRequestButtonStyle}
                >
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

  if (admin) {
    const filteredInquiries = inquiries.filter((inquiry) => {
      if (inquiryStatusFilter === "all") return true;
      return (inquiry.status || "offen") === inquiryStatusFilter;
    });

    return (
      <div style={pageStyle}>
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

                  <div style={adminExtrasBoxStyle}>
                    <label style={checkboxRowStyle}>
                      <input
                        type="checkbox"
                        checked={newProduct.extras_enabled}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            extras_enabled: e.target.checked,
                          })
                        }
                      />
                      Extras für dieses Produkt aktivieren
                    </label>

                    {newProduct.extras_enabled && (
                      <>
                        <p style={adminHintStyle}>
                          Lege hier frei fest, welche Extras dieses Produkt haben
                          kann. Name, Beschreibung und Aufpreis sind pro Extra
                          komplett anpassbar.
                        </p>

                        <div style={{ display: "grid", gap: "14px" }}>
                          {(newProduct.custom_extras || []).map((extra, index) => (
                            <div key={index} style={customExtraCardStyle}>
                              <div style={customExtraHeaderStyle}>
                                <strong>Extra {index + 1}</strong>
                                <button
                                  type="button"
                                  onClick={() => removeCustomExtra(index)}
                                  style={smallDeleteButtonStyle}
                                >
                                  Entfernen
                                </button>
                              </div>

                              <label style={adminExtraLabelStyle}>Name</label>
                              <input
                                placeholder="z. B. Versiegelung, NFC, Logo-Druck"
                                value={extra.name}
                                onChange={(e) =>
                                  updateCustomExtra(index, "name", e.target.value)
                                }
                                style={inputStyle}
                              />

                              <label style={adminExtraLabelStyle}>
                                Beschreibung
                              </label>
                              <textarea
                                placeholder="Kurze Erklärung, was dieses Extra bedeutet."
                                value={extra.description}
                                onChange={(e) =>
                                  updateCustomExtra(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                style={{ ...inputStyle, minHeight: "80px" }}
                              />

                              <label style={adminExtraLabelStyle}>
                                Aufpreis
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="z. B. 3.50"
                                value={extra.price}
                                onChange={(e) =>
                                  updateCustomExtra(index, "price", e.target.value)
                                }
                                style={inputStyle}
                              />
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addCustomExtra}
                          style={secondaryButtonStyle}
                        >
                          + Extra hinzufügen
                        </button>
                      </>
                    )}
                  </div>

                  <button style={buttonStyle}>
                    {editingId ? "Änderungen speichern" : "Produkt speichern"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
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
                  {products.map((product) => {
                    const extras = getProductExtras(product);

                    return (
                      <div key={product.id} style={adminProductStyle}>
                        <div>
                          <strong>{product.title}</strong>
                          <p style={{ margin: "6px 0", color: "#666" }}>
                            {product.price}
                          </p>

                          {extras.length > 0 && (
                            <p style={adminProductExtrasInfoStyle}>
                              Extras aktiv ·{" "}
                              {extras
                                .map(
                                  (extra) =>
                                    `${extra.name} +${formatEuro(extra.price)}`
                                )
                                .join(" · ")}
                            </p>
                          )}
                        </div>

                        <div style={adminActionRowStyle}>
                          <button
                            onClick={() => {
                              setEditingId(product.id);
                              setNewProduct({
                                title: product.title,
                                description: product.description,
                                price: product.price,
                                image: product.image,
                                file: null,
                                extras_enabled: Boolean(product.extras_enabled),
                                custom_extras: getProductExtras(product).map(
                                  (extra) => ({
                                    name: extra.name || "",
                                    description: extra.description || "",
                                    price: String(extra.price ?? "0"),
                                  })
                                ),
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
                    );
                  })}
                </div>
              </>
            )}

            {adminTab === "inquiries" && (
              <>
                <h2 style={{ marginTop: "40px" }}>Kundenanfragen</h2>

                <div style={statusFilterRowStyle}>
                  {[
                    { value: "all", label: "Alle" },
                    { value: "offen", label: "Offen" },
                    { value: "erledigt", label: "Erledigt" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setInquiryStatusFilter(filter.value)}
                      style={{
                        ...statusFilterButtonStyle,
                        ...(inquiryStatusFilter === filter.value
                          ? statusFilterActiveStyle
                          : {}),
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {filteredInquiries.length === 0 ? (
                  <div style={emptyBoxStyle}>
                    Noch keine Anfragen vorhanden.
                  </div>
                ) : (
                  <div
                    style={{ display: "grid", gap: "16px", marginTop: "20px" }}
                  >
                    {filteredInquiries.map((inquiry) => {
                      const selectedItems = Array.isArray(
                        inquiry.selected_extras?.items
                      )
                        ? inquiry.selected_extras.items
                        : [];
                      const inquiryStatus = inquiry.status || "offen";
                      const isDone = inquiryStatus === "erledigt";

                      return (
                        <div
                          key={inquiry.id}
                          style={{
                            ...inquiryCardStyle,
                            ...(isDone ? inquiryCardDoneStyle : {}),
                          }}
                        >
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

                            <span
                              style={{
                                ...statusBadgeStyle,
                                ...(isDone ? statusBadgeDoneStyle : {}),
                              }}
                            >
                              {isDone ? "Erledigt" : "Offen"}
                            </span>

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

                            {inquiry.estimated_total && (
                              <p style={adminTotalStyle}>
                                Geschätzter Gesamtpreis:{" "}
                                <strong>{inquiry.estimated_total}</strong>
                              </p>
                            )}

                            {selectedItems.length > 0 && (
                              <div style={adminSelectedExtrasStyle}>
                                <strong>Ausgewählte Extras:</strong>

                                {selectedItems.map((extra, index) => (
                                  <p key={`${extra.name}-${index}`}>
                                    {extra.name} · +{formatEuro(extra.price)}
                                    {extra.note && (
                                      <>
                                        <br />
                                        <small>Hinweis: {extra.note}</small>
                                      </>
                                    )}
                                  </p>
                                ))}
                              </div>
                            )}

                            <p style={inquiryMessageStyle}>{inquiry.message}</p>

                            <div style={adminActionRowStyle}>
                              <a
                                href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                                  `Antwort zu deiner Anfrage: ${inquiry.product_title}`
                                )}&body=${encodeURIComponent(
                                  `Hallo ${inquiry.name},

vielen Dank für deine Anfrage zu "${inquiry.product_title}".

`
                                )}`}
                                style={{
                                  ...editButtonStyle,
                                  textDecoration: "none",
                                }}
                              >
                                Antworten
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  updateInquiryStatus(
                                    inquiry.id,
                                    isDone ? "offen" : "erledigt"
                                  )
                                }
                                style={
                                  isDone
                                    ? reopenInquiryButtonStyle
                                    : completeInquiryButtonStyle
                                }
                              >
                                {isDone
                                  ? "Wieder öffnen"
                                  : "Als erledigt markieren"}
                              </button>

                              <button
                                onClick={() => deleteInquiry(inquiry.id)}
                                style={deleteButtonStyle}
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                      <h3 style={productTitleStyle}>{product.title}</h3>

                      <p style={productPreviewTextStyle}>
                        {product.description}
                      </p>
                    </div>
                  </Link>

                  <div style={{ padding: "0 24px 24px" }}>
                    <div style={priceRowStyle}>
                      <strong style={productPriceStyle}>
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

function InquiryModal({
  product,
  form,
  setForm,
  status,
  sending,
  onClose,
  onSubmit,
}) {
  const customExtras = getProductExtras(product);
  const extrasEnabled = customExtras.length > 0;
  const estimatedTotal = calculateEstimatedTotal(product, form);

  function toggleExtra(index, checked) {
    setForm({
      ...form,
      selectedExtras: {
        ...(form.selectedExtras || {}),
        [index]: {
          ...(form.selectedExtras?.[index] || {}),
          selected: checked,
        },
      },
    });
  }

  function updateExtraNote(index, note) {
    setForm({
      ...form,
      selectedExtras: {
        ...(form.selectedExtras || {}),
        [index]: {
          ...(form.selectedExtras?.[index] || {}),
          selected: true,
          note,
        },
      },
    });
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={modalCloseButtonStyle}>
          ×
        </button>

        <div style={modalHeaderStyle}>
          <span style={modalBadgeStyle}>Anfrage</span>

          <h2 style={modalTitleStyle}>Produkt unverbindlich anfragen</h2>

          <p style={modalIntroStyle}>
            Schreib uns kurz, was du wissen möchtest. Wir melden uns so schnell
            wie möglich bei dir zurück.
          </p>
        </div>

        <div style={modalProductBoxStyle}>
          <div>
            <span style={modalProductLabelStyle}>Ausgewähltes Produkt</span>
            <strong style={modalProductTitleStyle}>{product.title}</strong>
          </div>

          <span style={modalProductPriceStyle}>{product.price}</span>
        </div>

        <form onSubmit={onSubmit}>
          {extrasEnabled && (
            <div style={extrasBoxStyle}>
              <h3 style={{ marginTop: 0, color: "#435749" }}>
                Extras auswählen
              </h3>

              {customExtras.map((extra, index) => {
                const isSelected =
                  form.selectedExtras?.[index]?.selected || false;

                return (
                  <div key={`${extra.name}-${index}`} style={extraChoiceCardStyle}>
                    <label style={extraOptionStyle}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleExtra(index, e.target.checked)}
                      />
                      <span>
                        {extra.name} +{formatEuro(extra.price)}
                      </span>
                    </label>

                    {extra.description && (
                      <p style={extraDescriptionStyle}>{extra.description}</p>
                    )}

                    {isSelected && (
                      <input
                        placeholder="Hinweis oder Wunsch zu diesem Extra"
                        value={form.selectedExtras?.[index]?.note || ""}
                        onChange={(e) => updateExtraNote(index, e.target.value)}
                        style={inputStyle}
                      />
                    )}
                  </div>
                );
              })}

              <div style={totalBoxStyle}>
                Voraussichtlicher Gesamtpreis:{" "}
                <strong>{estimatedTotal}</strong>
              </div>
            </div>
          )}

          <label style={labelStyle}>Dein Name</label>
          <input
            required
            placeholder="z. B. Max Mustermann"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Deine E-Mail-Adresse</label>
          <input
            required
            type="email"
            placeholder="z. B. max@mail.de"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>Deine Nachricht</label>
          <textarea
            required
            placeholder="Was möchtest du wissen?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, minHeight: "170px", lineHeight: "1.6" }}
          />

          <p style={privacyHintStyle}>
            Deine Anfrage wird nur zur Bearbeitung deiner Nachricht gespeichert.
          </p>

          <button
            disabled={sending}
            style={sending ? disabledButtonStyle : fullButtonStyle}
          >
            {sending ? "Wird gesendet..." : "Anfrage absenden"}
          </button>

          {status === "success" && (
            <div style={successBoxStyle}>
              Danke! Deine Anfrage wurde erfolgreich gesendet.
            </div>
          )}

          {status === "error" && (
            <div style={errorBoxStyle}>
              Die Anfrage konnte leider nicht gesendet werden. Bitte versuche es
              erneut.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function LegalPage({ type }) {
  const isImpressum = type === "impressum";

  return (
    <div style={siteStyle}>
      <header style={headerStyle}>
        <Link to="/" style={{ color: "#556b5d", textDecoration: "none" }}>
          ← Zur Startseite
        </Link>
      </header>

      <section style={sectionStyle}>
        <div style={legalContentStyle}>
          <h1 style={legalTitleStyle}>
            {isImpressum ? "Impressum" : "Datenschutzerklärung"}
          </h1>

          {isImpressum ? (
            <>
              <p>Dies ist ein Platzhalter für dein späteres Impressum.</p>
              <p>
                Hier kommen später Angaben wie Name, Anschrift, Kontakt,
                verantwortliche Person und weitere gesetzlich erforderliche
                Informationen hinein.
              </p>
              <p>
                Bitte vor Veröffentlichung rechtlich prüfen und vollständig
                ausfüllen.
              </p>
            </>
          ) : (
            <>
              <p>
                Dies ist ein Platzhalter für deine spätere Datenschutzerklärung.
              </p>
              <p>
                Hier erklären wir später, welche personenbezogenen Daten über
                das Anfrageformular verarbeitet werden, wofür sie genutzt werden
                und welche Rechte Besucher haben.
              </p>
              <p>
                Bitte vor Veröffentlichung rechtlich prüfen und vollständig
                ausfüllen.
              </p>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer style={footerStyle}>
      <span>© Camp Oase</span>

      <span style={footerDotStyle}>·</span>

      <Link to="/impressum" style={footerLinkStyle}>
        Impressum
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/datenschutz" style={footerLinkStyle}>
        Datenschutz
      </Link>

      <span style={footerDotStyle}>·</span>

      <Link to="/admin" style={footerLoginStyle}>
        Login
      </Link>
    </footer>
  );
}

function getEmptyProduct() {
  return {
    title: "",
    description: "",
    price: "",
    image: "",
    file: null,
    extras_enabled: false,
    custom_extras: [],
  };
}

function getEmptyInquiryForm() {
  return {
    name: "",
    email: "",
    message: "",
    selectedExtras: {},
  };
}

function getProductExtras(product) {
  if (!product || !product.extras_enabled || !Array.isArray(product.custom_extras)) {
    return [];
  }

  return product.custom_extras
    .filter((extra) => String(extra.name || "").trim())
    .map((extra) => ({
      name: String(extra.name || "").trim(),
      description: String(extra.description || "").trim(),
      price: Number(extra.price || 0),
    }));
}

function parsePrice(value) {
  if (value === null || value === undefined) return 0;

  const normalized = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const number = Number(normalized);

  return Number.isNaN(number) ? 0 : number;
}

function formatEuro(value) {
  const number = Number(value || 0);

  return number.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function calculateEstimatedTotal(product, form) {
  const basePrice = parsePrice(product.price);
  const customExtras = getProductExtras(product);
  let total = basePrice;

  customExtras.forEach((extra, index) => {
    if (form.selectedExtras?.[index]?.selected) {
      total += Number(extra.price || 0);
    }
  });

  return formatEuro(total);
}

function buildSelectedExtras(product, form) {
  const customExtras = getProductExtras(product);

  const items = customExtras
    .map((extra, index) => ({
      ...extra,
      note: form.selectedExtras?.[index]?.note || "",
      selected: form.selectedExtras?.[index]?.selected || false,
    }))
    .filter((extra) => extra.selected)
    .map((extra) => ({
      name: extra.name,
      description: extra.description,
      price: Number(extra.price || 0),
      note: extra.note,
    }));

  return { items };
}

const siteStyle = {
  background: "#f5f1e8",
  minHeight: "100vh",
  fontFamily: "Arial, sans-serif",
  color: "#2f3e34",
};

const pageStyle = {
  ...siteStyle,
  padding: "clamp(24px, 5vw, 40px)",
};

const headerStyle = {
  padding: "clamp(14px, 3vw, 20px) max(18px, calc((100vw - 1200px) / 2))",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(10px)",
};

const logoStyle = {
  width: "clamp(52px, 10vw, 64px)",
  height: "clamp(52px, 10vw, 64px)",
  borderRadius: "50%",
  objectFit: "cover",
};

const brandTextStyle = {
  fontSize: "clamp(22px, 5vw, 26px)",
  color: "#556b5d",
};

const heroStyle = {
  padding: "clamp(46px, 8vw, 90px) 20px",
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
  fontSize: "clamp(13px, 3vw, 16px)",
};

const heroTitleStyle = {
  fontSize: "clamp(34px, 8vw, 64px)",
  margin: "0",
  color: "#435749",
  lineHeight: "1.08",
};

const heroTextStyle = {
  fontSize: "clamp(16px, 4vw, 20px)",
  maxWidth: "700px",
  margin: "24px auto 0",
  color: "#6b756d",
  lineHeight: "1.6",
};

const sectionStyle = {
  padding: "clamp(36px, 6vw, 60px) clamp(18px, 5vw, 40px)",
};

const sectionTitleStyle = {
  fontSize: "clamp(28px, 7vw, 38px)",
  marginTop: "8px",
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
  height: "clamp(200px, 55vw, 240px)",
  objectFit: "contain",
  background: "#f5f1e8",
};

const productTitleStyle = {
  fontSize: "clamp(21px, 5vw, 24px)",
  margin: "0 0 10px",
};

const productPreviewTextStyle = {
  color: "#666",
  lineHeight: "1.6",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: "78px",
};

const priceRowStyle = {
  marginTop: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const productPriceStyle = {
  fontSize: "clamp(20px, 5vw, 22px)",
  color: "#556b5d",
};

const detailSectionStyle = {
  padding: "clamp(32px, 6vw, 60px) clamp(18px, 5vw, 40px)",
};

const detailImageStyle = {
  width: "100%",
  maxHeight: "min(520px, 70vh)",
  objectFit: "contain",
  background: "#f5f1e8",
  borderRadius: "clamp(20px, 5vw, 32px)",
  boxShadow: "0 14px 35px rgba(0,0,0,0.08)",
};

const detailTitleStyle = {
  fontSize: "clamp(32px, 8vw, 48px)",
  color: "#435749",
  lineHeight: "1.1",
};

const detailDescriptionStyle = {
  fontSize: "clamp(16px, 4vw, 18px)",
  lineHeight: "1.9",
  color: "#5f5f5f",
  maxWidth: "720px",
  marginTop: "24px",
  whiteSpace: "pre-line",
};

const detailPriceStyle = {
  fontSize: "clamp(26px, 7vw, 32px)",
  color: "#556b5d",
};

const detailRequestButtonStyle = {
  background: "#2f3e34",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  marginTop: "24px",
  fontSize: "16px",
  padding: "14px 22px",
};

const extrasPreviewBoxStyle = {
  marginTop: "26px",
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const detailExtraLineStyle = {
  background: "#f5f1e8",
  borderRadius: "14px",
  padding: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
};

const detailExtraDescriptionStyle = {
  display: "block",
  color: "#666",
  marginTop: "4px",
  lineHeight: "1.4",
};

const detailExtraPriceStyle = {
  color: "#556b5d",
  fontWeight: "bold",
};

const formStyle = {
  maxWidth: "700px",
  background: "white",
  padding: "clamp(22px, 5vw, 30px)",
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

const secondaryButtonStyle = {
  background: "white",
  color: "#556b5d",
  border: "1px solid #cfd8cf",
  padding: "12px 18px",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "15px",
  marginTop: "14px",
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

const smallDeleteButtonStyle = {
  background: "#9b4d4d",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "13px",
};

const editButtonStyle = {
  background: "#d9c7a2",
  color: "#2f3e34",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

const completeInquiryButtonStyle = {
  background: "#556b5d",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

const reopenInquiryButtonStyle = {
  background: "#eef3ea",
  color: "#435749",
  border: "1px solid #cfd8cf",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
};

const adminTitleStyle = {
  marginTop: "30px",
  fontSize: "clamp(30px, 8vw, 42px)",
  color: "#435749",
};

const adminProductStyle = {
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const adminActionRowStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "16px",
  flexWrap: "wrap",
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

const statusFilterRowStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "14px",
  flexWrap: "wrap",
};

const statusFilterButtonStyle = {
  background: "white",
  color: "#556b5d",
  border: "1px solid #d6d3cc",
  padding: "9px 14px",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
};

const statusFilterActiveStyle = {
  background: "#d9c7a2",
  color: "#2f3e34",
  border: "1px solid #d9c7a2",
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
  padding: "clamp(18px, 5vw, 22px)",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const inquiryCardDoneStyle = {
  opacity: 0.72,
  background: "#fbfaf6",
};

const statusBadgeStyle = {
  display: "inline-block",
  marginBottom: "12px",
  padding: "5px 10px",
  borderRadius: "999px",
  background: "#eef3ea",
  color: "#435749",
  fontSize: "13px",
  fontWeight: "bold",
};

const statusBadgeDoneStyle = {
  background: "#eee9df",
  color: "#777",
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

const adminExtrasBoxStyle = {
  background: "#f5f1e8",
  borderRadius: "18px",
  padding: "18px",
  margin: "16px 0",
};

const customExtraCardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "14px",
};

const customExtraHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
};

const adminExtraLabelStyle = {
  display: "block",
  color: "#435749",
  fontWeight: "bold",
  marginTop: "10px",
  marginBottom: "-4px",
};

const checkboxRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#435749",
  fontWeight: "bold",
};

const adminHintStyle = {
  color: "#667",
  fontSize: "14px",
  lineHeight: "1.5",
};

const adminProductExtrasInfoStyle = {
  margin: "8px 0 0",
  color: "#7f8f82",
  fontSize: "14px",
  lineHeight: "1.5",
};

const adminTotalStyle = {
  marginTop: "14px",
  color: "#435749",
  background: "#eef3ea",
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
};

const adminSelectedExtrasStyle = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "14px",
  background: "#f5f1e8",
  color: "#444",
  lineHeight: "1.6",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "16px",
  zIndex: 9999,
};

const modalStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "560px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "clamp(20px, 5vw, 28px)",
  padding: "clamp(22px, 5vw, 32px)",
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

const modalHeaderStyle = {
  marginBottom: "22px",
};

const modalBadgeStyle = {
  display: "inline-block",
  background: "#f5f1e8",
  color: "#556b5d",
  padding: "7px 13px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
  marginBottom: "14px",
};

const modalTitleStyle = {
  margin: "0",
  color: "#435749",
  fontSize: "clamp(26px, 6vw, 34px)",
  lineHeight: "1.15",
};

const modalIntroStyle = {
  color: "#6b756d",
  lineHeight: "1.6",
  marginTop: "12px",
};

const modalProductBoxStyle = {
  background: "linear-gradient(135deg, #f5f1e8, #eef3ea)",
  border: "1px solid #e2ded3",
  borderRadius: "20px",
  padding: "18px",
  marginBottom: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const modalProductLabelStyle = {
  display: "block",
  fontSize: "13px",
  color: "#7f8f82",
  marginBottom: "5px",
};

const modalProductTitleStyle = {
  color: "#435749",
  fontSize: "18px",
};

const modalProductPriceStyle = {
  background: "white",
  color: "#556b5d",
  padding: "8px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
};

const extrasBoxStyle = {
  background: "#f5f1e8",
  border: "1px solid #e2ded3",
  borderRadius: "20px",
  padding: "18px",
  marginBottom: "20px",
};

const extraChoiceCardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "14px",
  marginTop: "12px",
};

const extraOptionStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  margin: "0",
  color: "#435749",
  fontWeight: "bold",
};

const extraDescriptionStyle = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "8px 0 0 26px",
};

const totalBoxStyle = {
  marginTop: "16px",
  background: "white",
  color: "#435749",
  padding: "12px 14px",
  borderRadius: "14px",
};

const labelStyle = {
  display: "block",
  color: "#435749",
  fontWeight: "bold",
  marginTop: "14px",
  marginBottom: "-4px",
};

const privacyHintStyle = {
  fontSize: "13px",
  color: "#7f8f82",
  lineHeight: "1.5",
  marginTop: "4px",
};

const fullButtonStyle = {
  ...buttonStyle,
  width: "100%",
  marginTop: "14px",
  padding: "14px 18px",
};

const disabledButtonStyle = {
  ...fullButtonStyle,
  opacity: 0.65,
  cursor: "not-allowed",
};

const successBoxStyle = {
  marginTop: "16px",
  background: "#eef5ee",
  color: "#435749",
  border: "1px solid #cddfcd",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: "bold",
};

const errorBoxStyle = {
  marginTop: "16px",
  background: "#f8eeee",
  color: "#8a3d3d",
  border: "1px solid #e2bcbc",
  padding: "14px",
  borderRadius: "14px",
  fontWeight: "bold",
};

const footerStyle = {
  padding: "28px 20px",
  textAlign: "center",
  color: "#7f8f82",
  fontSize: "13px",
  lineHeight: "2",
};

const footerDotStyle = {
  margin: "0 8px",
  color: "#a1a89f",
};

const footerLinkStyle = {
  color: "#7f8f82",
  textDecoration: "none",
};

const footerLoginStyle = {
  color: "#9aa79b",
  textDecoration: "none",
  opacity: 0.65,
  fontSize: "12px",
};

const legalContentStyle = {
  maxWidth: "820px",
  margin: "0 auto",
  background: "white",
  padding: "clamp(24px, 5vw, 36px)",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  lineHeight: "1.8",
  color: "#555",
};

const legalTitleStyle = {
  color: "#435749",
  fontSize: "clamp(32px, 8vw, 42px)",
};
