import { useEffect, useState } from "react";
import {
  formatEuro,
  getDiscountLabel,
  getDiscountPercent,
  getProductExtras,
  getStockQuantity,
  hasActiveDiscount,
} from "../utils/price";
import {
  AVAILABILITY_OPTIONS,
  getAvailabilityLabel,
} from "../utils/availability";
import { getProductBadges, PRODUCT_BADGE_OPTIONS } from "../utils/productBadges";
import {
  createEmptyProductVariant,
  getProductVariants,
} from "../utils/productVariants";
import {
  adminActionRowStyle,
  adminExtraLabelStyle,
  adminExtrasBoxStyle,
  adminAvailabilityBadgeStyle,
  adminHintStyle,
  adminImagePreviewBoxStyle,
  adminImagePreviewImageStyle,
  adminImagePreviewModalImageStyle,
  adminImagePreviewModalStyle,
  adminImagePreviewOverlayStyle,
  adminImagePreviewTextStyle,
  adminProductExtrasInfoStyle,
  adminProductStyle,
  buttonStyle,
  checkboxRowStyle,
  customExtraCardStyle,
  customExtraHeaderStyle,
  deleteButtonStyle,
  editButtonStyle,
  formStyle,
  inputStyle,
  secondaryButtonStyle,
  smallDeleteButtonStyle,
} from "../styles";

const accordionStyle = {
  border: "1px solid #e7dfd0",
  borderRadius: "18px",
  background: "#fbfaf6",
  margin: "12px 0",
  overflow: "hidden",
};

const accordionSummaryStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "13px 16px",
  cursor: "pointer",
  color: "#435749",
  fontWeight: "bold",
};

const accordionMetaStyle = {
  color: "#7f8f82",
  fontSize: "13px",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const accordionContentStyle = {
  padding: "0 16px 16px",
};

const compactInputStyle = {
  ...inputStyle,
  padding: "11px 12px",
  marginTop: "7px",
  marginBottom: "8px",
  fontSize: "15px",
};

const compactHintStyle = {
  ...adminHintStyle,
  margin: "6px 0 10px",
  fontSize: "13px",
};

const compactBoxStyle = {
  ...adminExtrasBoxStyle,
  padding: "13px",
  margin: "10px 0",
  borderRadius: "14px",
};

const compactCardStyle = {
  ...customExtraCardStyle,
  padding: "12px",
  border: "1px solid #eee7da",
};

function AccordionSection({ title, meta, defaultOpen = false, children }) {
  return (
    <details style={accordionStyle} open={defaultOpen}>
      <summary style={accordionSummaryStyle}>
        <span>{title}</span>
        {meta && <span style={accordionMetaStyle}>{meta}</span>}
      </summary>
      <div style={accordionContentStyle}>{children}</div>
    </details>
  );
}

export default function AdminProducts({
  products,
  newProduct,
  setNewProduct,
  editingId,
  onSubmit,
  onCancelEdit,
  onAddExtra,
  onUpdateExtra,
  onRemoveExtra,
  onEditProduct,
  onDeleteProduct,
}) {
  const [previewImage, setPreviewImage] = useState(null);
  const selectedProductBadges = Array.isArray(newProduct.product_badges)
    ? newProduct.product_badges
    : [];
  const galleryImages = Array.isArray(newProduct.gallery_images)
    ? newProduct.gallery_images.slice(0, 3)
    : [];
  const galleryFiles = Array.isArray(newProduct.galleryFiles)
    ? newProduct.galleryFiles.slice(0, 3)
    : [];
  const productVariants = Array.isArray(newProduct.product_variants)
    ? newProduct.product_variants
    : [];

  useEffect(() => {
    function closePreviewOnEscape(event) {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    }

    window.addEventListener("keydown", closePreviewOnEscape);

    return () => {
      window.removeEventListener("keydown", closePreviewOnEscape);
    };
  }, []);

  function toggleProductBadge(value, checked) {
    const nextBadges = checked
      ? [...new Set([...selectedProductBadges, value])]
      : selectedProductBadges.filter((badge) => badge !== value);

    setNewProduct({ ...newProduct, product_badges: nextBadges });
  }

  function updateGalleryFile(index, file) {
    const nextFiles = [...galleryFiles];
    nextFiles[index] = file || null;

    setNewProduct({ ...newProduct, galleryFiles: nextFiles });
  }

  function removeGalleryImage(index) {
    const nextImages = [...galleryImages];
    const nextFiles = [...galleryFiles];

    nextImages[index] = "";
    nextFiles[index] = null;

    setNewProduct({
      ...newProduct,
      gallery_images: nextImages.filter(Boolean).slice(0, 3),
      galleryFiles: nextFiles,
    });
  }

  function addProductVariant() {
    setNewProduct({
      ...newProduct,
      product_variants: [...productVariants, createEmptyProductVariant()],
    });
  }

  function updateProductVariant(index, field, value) {
    const nextVariants = [...productVariants];
    nextVariants[index] = { ...nextVariants[index], [field]: value };

    setNewProduct({ ...newProduct, product_variants: nextVariants });
  }

  function removeProductVariant(index) {
    const nextVariants = [...productVariants];
    nextVariants.splice(index, 1);

    setNewProduct({ ...newProduct, product_variants: nextVariants });
  }

  const galleryCount = Math.min(
    3,
    galleryImages.filter(Boolean).length + galleryFiles.filter(Boolean).length
  );
  const extrasCount = (newProduct.custom_extras || []).filter((extra) =>
    String(extra.name || "").trim()
  ).length;
  const variantsCount = productVariants.filter((variant) =>
    String(variant.name || "").trim()
  ).length;
  const badgesCount = selectedProductBadges.length;
  const discountMeta = newProduct.discount_enabled ? "aktiv" : "inaktiv";
  const visibilityMeta = [
    getAvailabilityLabel(newProduct),
    badgesCount > 0 ? `${badgesCount} Hinweise` : "",
    newProduct.extras_enabled ? "Extras aktiv" : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <form onSubmit={onSubmit} style={formStyle}>
        <h2>{editingId ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}</h2>

        <AccordionSection title="Grunddaten" defaultOpen>
        <input
          placeholder="Produktname"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          style={compactInputStyle}
        />

        <textarea
          placeholder="Beschreibung"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          style={{ ...compactInputStyle, minHeight: "100px" }}
        />
        <p style={compactHintStyle}>
          Markdown möglich: <strong>**fett**</strong>, <em>*kursiv*</em>, -
          Listen möglich
        </p>

        <input
          placeholder="Preis z.B. 14,99 €"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          style={compactInputStyle}
        />

        <label style={adminExtraLabelStyle}>Reihenfolge</label>
        <input
          type="number"
          step="1"
          placeholder="z. B. 1"
          value={newProduct.sort_order ?? 0}
          onChange={(e) =>
            setNewProduct({ ...newProduct, sort_order: e.target.value })
          }
          style={compactInputStyle}
        />

        <label style={adminExtraLabelStyle}>Bestand / Stückzahl</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="z. B. 3"
          value={newProduct.stock_quantity ?? 0}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock_quantity: e.target.value })
          }
          style={compactInputStyle}
        />

        </AccordionSection>

        <AccordionSection
          title="Preis & Rabatt"
          meta={discountMeta}
          defaultOpen={Boolean(newProduct.discount_enabled)}
        >
        <div style={compactBoxStyle}>
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={Boolean(newProduct.discount_enabled)}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  discount_enabled: e.target.checked,
                })
              }
            />
            Rabatt aktivieren
          </label>

          {newProduct.discount_enabled && (
            <>
              <label style={adminExtraLabelStyle}>Rabatt in Prozent</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="z. B. 15"
                value={newProduct.discount_percent ?? ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    discount_percent: e.target.value,
                  })
                }
                style={compactInputStyle}
              />

              <label style={adminExtraLabelStyle}>Rabatt-Label optional</label>
              <input
                placeholder="z. B. Sommeraktion"
                value={newProduct.discount_label || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    discount_label: e.target.value,
                  })
                }
                style={compactInputStyle}
              />
            </>
          )}
        </div>

        </AccordionSection>

        <AccordionSection
          title="Sichtbarkeit & Hinweise"
          meta={visibilityMeta}
          defaultOpen={editingId && (badgesCount > 0 || newProduct.extras_enabled)}
        >
        <label style={adminExtraLabelStyle}>Verfügbarkeit</label>
        <select
          value={newProduct.availability_status || "available"}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              availability_status: e.target.value,
            })
          }
          style={compactInputStyle}
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div style={compactBoxStyle}>
          <strong style={{ color: "#435749" }}>Produkt-Hinweise</strong>
          <p style={compactHintStyle}>
            Diese Hinweise erscheinen dezent auf der Produktkarte und bei der
            Produktdetailseite. Sie sind unabhängig von den Extras.
          </p>

          <div style={{ display: "grid", gap: "10px" }}>
            {PRODUCT_BADGE_OPTIONS.map((badge) => (
              <label key={badge.value} style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={selectedProductBadges.includes(badge.value)}
                  onChange={(e) =>
                    toggleProductBadge(badge.value, e.target.checked)
                  }
                />
                {badge.label}
              </label>
            ))}
          </div>

          <label style={{ ...checkboxRowStyle, marginTop: "12px" }}>
            <input
              type="checkbox"
              checked={newProduct.extras_enabled}
              onChange={(e) =>
                setNewProduct({ ...newProduct, extras_enabled: e.target.checked })
              }
            />
            Extras für dieses Produkt aktivieren
          </label>
        </div>

        </AccordionSection>

        <AccordionSection
          title="Bilder & Galerie"
          meta={`${galleryCount}/3`}
          defaultOpen={editingId && (Boolean(newProduct.image) || galleryCount > 0)}
        >
        {editingId && newProduct.image && (
          <div style={adminImagePreviewBoxStyle}>
            <button
              type="button"
              onClick={() => setPreviewImage(newProduct.image)}
              style={{
                border: "none",
                padding: 0,
                background: "transparent",
                cursor: "zoom-in",
              }}
              aria-label="Produktbild größer anzeigen"
            >
              <img
                src={newProduct.image}
                alt={newProduct.title || "Aktuelles Produktbild"}
                style={adminImagePreviewImageStyle}
              />
            </button>
            <div>
              <strong>Aktuelles Produktbild</strong>
              <p style={adminImagePreviewTextStyle}>
                Wenn du eine neue Datei auswählst, wird dieses Bild beim
                Speichern ersetzt.
              </p>
            </div>
          </div>
        )}

        {newProduct.file && (
          <p style={adminImagePreviewTextStyle}>
            Neue Datei ausgewählt: <strong>{newProduct.file.name}</strong>
          </p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewProduct({ ...newProduct, file: e.target.files[0] })
          }
          style={compactInputStyle}
        />

        <div style={compactBoxStyle}>
          <strong style={{ color: "#435749" }}>Produktgalerie</strong>
          <p style={compactHintStyle}>
            Optional bis zu 3 zusätzliche Bilder. Das Hauptbild bleibt weiterhin
            das Bild für Produktkarten und Übersicht.
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            {[0, 1, 2].map((index) => {
              const image = galleryImages[index];
              const file = galleryFiles[index];

              return (
                <div key={index} style={adminImagePreviewBoxStyle}>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(image)}
                      style={{
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        cursor: "zoom-in",
                      }}
                      aria-label={`Galeriebild ${index + 1} größer anzeigen`}
                    >
                      <img
                        src={image}
                        alt={`Galeriebild ${index + 1}`}
                        style={adminImagePreviewImageStyle}
                      />
                    </button>
                  )}

                  <div style={{ flex: "1 1 220px" }}>
                    <strong>Galeriebild {index + 1}</strong>
                    {file && (
                      <p style={adminImagePreviewTextStyle}>
                        Neue Datei ausgewählt: <strong>{file.name}</strong>
                      </p>
                    )}
                    {!image && !file && (
                      <p style={adminImagePreviewTextStyle}>
                        Noch kein Galeriebild ausgewählt.
                      </p>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateGalleryFile(index, e.target.files[0])}
          style={compactInputStyle}
                    />

                    {(image || file) && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={smallDeleteButtonStyle}
                      >
                        Galeriebild entfernen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </AccordionSection>

        <AccordionSection
          title="Produktvarianten"
          meta={`${variantsCount}`}
          defaultOpen={editingId && variantsCount > 0}
        >
        <div style={compactBoxStyle}>
          <strong style={{ color: "#435749" }}>Produktvarianten</strong>
          <p style={compactHintStyle}>
            Optional: Varianten mit eigenem Bild und Preisaufschlag oder
            Preisabschlag. Ohne Varianten bleibt das Produkt wie bisher.
          </p>

          {productVariants.length > 0 && (
            <div style={{ display: "grid", gap: "14px" }}>
              {productVariants.map((variant, index) => (
                <div key={variant.id || index} style={compactCardStyle}>
                  <div style={customExtraHeaderStyle}>
                    <strong>Variante {index + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeProductVariant(index)}
                      style={smallDeleteButtonStyle}
                    >
                      Entfernen
                    </button>
                  </div>

                  <label style={checkboxRowStyle}>
                    <input
                      type="checkbox"
                      checked={variant.enabled !== false}
                      onChange={(e) =>
                        updateProductVariant(index, "enabled", e.target.checked)
                      }
                    />
                    Variante aktiv
                  </label>

                  <label style={adminExtraLabelStyle}>Name</label>
                  <input
                    placeholder="z. B. Salbei, Natur, Variante 1"
                    value={variant.name || ""}
                    onChange={(e) =>
                      updateProductVariant(index, "name", e.target.value)
                    }
                    style={compactInputStyle}
                  />

                  <label style={adminExtraLabelStyle}>Beschreibung optional</label>
                  <textarea
                    placeholder="Kurzer Hinweis zu dieser Variante."
                    value={variant.description || ""}
                    onChange={(e) =>
                      updateProductVariant(index, "description", e.target.value)
                    }
                    style={{ ...compactInputStyle, minHeight: "70px" }}
                  />

                  <label style={adminExtraLabelStyle}>
                    Preisaufschlag / Preisabschlag
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="z. B. 2 oder -1"
                    value={variant.price_adjustment ?? "0"}
                    onChange={(e) =>
                      updateProductVariant(
                        index,
                        "price_adjustment",
                        e.target.value
                      )
                    }
                    style={compactInputStyle}
                  />

                  {(variant.image_url || variant.image_file) && (
                    <div style={adminImagePreviewBoxStyle}>
                      {variant.image_url && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(variant.image_url)}
                          style={{
                            border: "none",
                            padding: 0,
                            background: "transparent",
                            cursor: "zoom-in",
                          }}
                          aria-label={`Variantenbild ${index + 1} größer anzeigen`}
                        >
                          <img
                            src={variant.image_url}
                            alt={variant.name || `Variante ${index + 1}`}
                            style={adminImagePreviewImageStyle}
                          />
                        </button>
                      )}

                      <div>
                        <strong>Variantenbild</strong>
                        {variant.image_file && (
                          <p style={adminImagePreviewTextStyle}>
                            Neue Datei ausgewählt:{" "}
                            <strong>{variant.image_file.name}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateProductVariant(index, "image_file", e.target.files[0])
                    }
                    style={compactInputStyle}
                  />

                  {variant.image_url && (
                    <button
                      type="button"
                      onClick={() => updateProductVariant(index, "image_url", "")}
                      style={smallDeleteButtonStyle}
                    >
                      Variantenbild entfernen
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addProductVariant}
            style={secondaryButtonStyle}
          >
            + Variante hinzufügen
          </button>
        </div>

        </AccordionSection>

        <AccordionSection
          title="Extras"
          meta={newProduct.extras_enabled ? `${extrasCount}` : "inaktiv"}
          defaultOpen={editingId && newProduct.extras_enabled}
        >
        <div style={compactBoxStyle}>
          {!newProduct.extras_enabled && (
            <p style={compactHintStyle}>
              Extras sind aktuell deaktiviert. Du kannst sie im Bereich
              Sichtbarkeit & Hinweise aktivieren.
            </p>
          )}

          {newProduct.extras_enabled && (
            <>
              <p style={compactHintStyle}>
                Lege hier frei fest, welche Extras dieses Produkt haben kann.
                Name, Beschreibung und Aufpreis sind pro Extra komplett anpassbar.
              </p>

              <div style={{ display: "grid", gap: "14px" }}>
                {(newProduct.custom_extras || []).map((extra, index) => (
                  <div key={index} style={compactCardStyle}>
                    <div style={customExtraHeaderStyle}>
                      <strong>Extra {index + 1}</strong>
                      <button
                        type="button"
                        onClick={() => onRemoveExtra(index)}
                        style={smallDeleteButtonStyle}
                      >
                        Entfernen
                      </button>
                    </div>

                    <label style={adminExtraLabelStyle}>Name</label>
                    <input
                      placeholder="z. B. Versiegelung, NFC, Logo-Druck"
                      value={extra.name}
                      onChange={(e) => onUpdateExtra(index, "name", e.target.value)}
                      style={compactInputStyle}
                    />

                    <label style={adminExtraLabelStyle}>Beschreibung</label>
                    <textarea
                      placeholder="Kurze Erklärung, was dieses Extra bedeutet."
                      value={extra.description}
                      onChange={(e) =>
                        onUpdateExtra(index, "description", e.target.value)
                      }
                      style={{ ...compactInputStyle, minHeight: "70px" }}
                    />

                    <label style={adminExtraLabelStyle}>Aufpreis</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="z. B. 3.50"
                      value={extra.price}
                      onChange={(e) => onUpdateExtra(index, "price", e.target.value)}
                      style={compactInputStyle}
                    />

                    <label style={checkboxRowStyle}>
                      <input
                        type="checkbox"
                        checked={Boolean(extra.discount_enabled)}
                        onChange={(e) =>
                          onUpdateExtra(
                            index,
                            "discount_enabled",
                            e.target.checked
                          )
                        }
                      />
                      Rabatt für dieses Extra aktivieren
                    </label>

                    {extra.discount_enabled && (
                      <>
                        <label style={adminExtraLabelStyle}>
                          Extra-Rabatt in Prozent
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="z. B. 20"
                          value={extra.discount_percent ?? ""}
                          onChange={(e) =>
                            onUpdateExtra(
                              index,
                              "discount_percent",
                              e.target.value
                            )
                          }
                          style={compactInputStyle}
                        />

                        <label style={adminExtraLabelStyle}>
                          Extra-Rabatt-Label optional
                        </label>
                        <input
                          placeholder="z. B. Aktion"
                          value={extra.discount_label || ""}
                          onChange={(e) =>
                            onUpdateExtra(
                              index,
                              "discount_label",
                              e.target.value
                            )
                          }
                          style={compactInputStyle}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" onClick={onAddExtra} style={secondaryButtonStyle}>
                + Extra hinzufügen
              </button>
            </>
          )}
        </div>

        </AccordionSection>

        <button style={buttonStyle}>
          {editingId ? "Änderungen speichern" : "Produkt speichern"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={{ ...buttonStyle, background: "#9b4d4d", marginLeft: "10px" }}
          >
            Abbrechen
          </button>
        )}
      </form>

      <h2 style={{ marginTop: "50px" }}>Produkte verwalten</h2>

      <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
        {products.map((product) => {
          const extras = getProductExtras(product);
          const variants = getProductVariants(product);
          const productBadges = getProductBadges(product);
          const stockQuantity = getStockQuantity(product);
          const discountActive = hasActiveDiscount(product);

          return (
            <div key={product.id} style={adminProductStyle}>
              <div>
                <strong>{product.title}</strong>
                <p style={{ margin: "6px 0", color: "#666" }}>{product.price}</p>
                <p style={{ margin: "6px 0", color: "#667", fontSize: "14px" }}>
                  Reihenfolge: {Number(product.sort_order || 0)}
                </p>
                <span style={adminAvailabilityBadgeStyle}>
                  {getAvailabilityLabel(product)}
                </span>
                <span style={{ ...adminAvailabilityBadgeStyle, marginLeft: "8px" }}>
                  Bestand: {stockQuantity}
                </span>

                {discountActive && (
                  <span style={{ ...adminAvailabilityBadgeStyle, marginLeft: "8px" }}>
                    Rabatt {getDiscountPercent(product)} % aktiv
                    {product.discount_label
                      ? " · " + getDiscountLabel(product)
                      : ""}
                  </span>
                )}

                {productBadges.length > 0 && (
                  <p style={adminProductExtrasInfoStyle}>
                    Hinweise aktiv ·{" "}
                    {productBadges.map((badge) => badge.label).join(" · ")}
                  </p>
                )}

                {extras.length > 0 && (
                  <p style={adminProductExtrasInfoStyle}>
                    Extras aktiv ·{" "}
                    {extras
                      .map(
                        (extra) =>
                          extra.name +
                          " +" +
                          formatEuro(extra.price) +
                          (extra.has_discount
                            ? " (" + extra.discount_label + ")"
                            : "")
                      )
                      .join(" · ")}
                  </p>
                )}

                {variants.length > 0 && (
                  <p style={adminProductExtrasInfoStyle}>
                    Varianten aktiv ·{" "}
                    {variants
                      .map(
                        (variant) =>
                          variant.name +
                          (variant.enabled ? "" : " (deaktiviert)") +
                          (Number(variant.price_adjustment || 0) !== 0
                            ? " " + formatEuro(variant.price_adjustment)
                            : "")
                      )
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div style={adminActionRowStyle}>
                <button onClick={() => onEditProduct(product)} style={editButtonStyle}>
                  Bearbeiten
                </button>

                <button onClick={() => onDeleteProduct(product.id)} style={deleteButtonStyle}>
                  Löschen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <div
          style={adminImagePreviewOverlayStyle}
          onClick={() => setPreviewImage(null)}
          role="presentation"
        >
          <div
            style={adminImagePreviewModalStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                right: "14px",
                top: "10px",
                border: "none",
                background: "rgba(255,255,255,0.82)",
                color: "#556b5d",
                borderRadius: "999px",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                fontSize: "24px",
                lineHeight: "1",
              }}
              aria-label="Bildvorschau schließen"
            >
              ×
            </button>

            <img
              src={previewImage}
              alt={newProduct.title || "Große Produktbild-Vorschau"}
              style={adminImagePreviewModalImageStyle}
            />
          </div>
        </div>
      )}
    </>
  );
}

