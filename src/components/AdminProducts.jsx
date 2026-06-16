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
  adminActionRowStyle,
  adminExtraLabelStyle,
  adminExtrasBoxStyle,
  adminAvailabilityBadgeStyle,
  adminHintStyle,
  adminImagePreviewBoxStyle,
  adminImagePreviewImageStyle,
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
  const selectedProductBadges = Array.isArray(newProduct.product_badges)
    ? newProduct.product_badges
    : [];

  function toggleProductBadge(value, checked) {
    const nextBadges = checked
      ? [...new Set([...selectedProductBadges, value])]
      : selectedProductBadges.filter((badge) => badge !== value);

    setNewProduct({ ...newProduct, product_badges: nextBadges });
  }

  return (
    <>
      <form onSubmit={onSubmit} style={formStyle}>
        <h2>{editingId ? "Produkt bearbeiten" : "Neues Produkt hinzufügen"}</h2>

        <input
          placeholder="Produktname"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          style={inputStyle}
        />

        <textarea
          placeholder="Beschreibung"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          style={{ ...inputStyle, minHeight: "120px" }}
        />

        <input
          placeholder="Preis z.B. 14,99 €"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          style={inputStyle}
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
          style={inputStyle}
        />

        <div style={adminExtrasBoxStyle}>
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
                style={inputStyle}
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
                style={inputStyle}
              />
            </>
          )}
        </div>

        <label style={adminExtraLabelStyle}>Verfügbarkeit</label>
        <select
          value={newProduct.availability_status || "available"}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              availability_status: e.target.value,
            })
          }
          style={inputStyle}
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div style={adminExtrasBoxStyle}>
          <strong style={{ color: "#435749" }}>Produkt-Hinweise</strong>
          <p style={adminHintStyle}>
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
        </div>

        {editingId && newProduct.image && (
          <div style={adminImagePreviewBoxStyle}>
            <img
              src={newProduct.image}
              alt={newProduct.title || "Aktuelles Produktbild"}
              style={adminImagePreviewImageStyle}
            />
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
          style={inputStyle}
        />

        <div style={adminExtrasBoxStyle}>
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={newProduct.extras_enabled}
              onChange={(e) =>
                setNewProduct({ ...newProduct, extras_enabled: e.target.checked })
              }
            />
            Extras für dieses Produkt aktivieren
          </label>

          {newProduct.extras_enabled && (
            <>
              <p style={adminHintStyle}>
                Lege hier frei fest, welche Extras dieses Produkt haben kann.
                Name, Beschreibung und Aufpreis sind pro Extra komplett anpassbar.
              </p>

              <div style={{ display: "grid", gap: "14px" }}>
                {(newProduct.custom_extras || []).map((extra, index) => (
                  <div key={index} style={customExtraCardStyle}>
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
                      style={inputStyle}
                    />

                    <label style={adminExtraLabelStyle}>Beschreibung</label>
                    <textarea
                      placeholder="Kurze Erklärung, was dieses Extra bedeutet."
                      value={extra.description}
                      onChange={(e) =>
                        onUpdateExtra(index, "description", e.target.value)
                      }
                      style={{ ...inputStyle, minHeight: "80px" }}
                    />

                    <label style={adminExtraLabelStyle}>Aufpreis</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="z. B. 3.50"
                      value={extra.price}
                      onChange={(e) => onUpdateExtra(index, "price", e.target.value)}
                      style={inputStyle}
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
                          style={inputStyle}
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
                          style={inputStyle}
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
          const productBadges = getProductBadges(product);
          const stockQuantity = getStockQuantity(product);
          const discountActive = hasActiveDiscount(product);

          return (
            <div key={product.id} style={adminProductStyle}>
              <div>
                <strong>{product.title}</strong>
                <p style={{ margin: "6px 0", color: "#666" }}>{product.price}</p>
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
    </>
  );
}

