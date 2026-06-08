import { formatEuro, getProductExtras } from "../utils/price";
import {
  AVAILABILITY_OPTIONS,
  getAvailabilityLabel,
} from "../utils/availability";
import {
  adminActionRowStyle,
  adminExtraLabelStyle,
  adminExtrasBoxStyle,
  adminHintStyle,
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

          return (
            <div key={product.id} style={adminProductStyle}>
              <div>
                <strong>{product.title}</strong>
                <p style={{ margin: "6px 0", color: "#666" }}>{product.price}</p>
                <p style={{ margin: "6px 0", color: "#7f8f82", fontSize: "14px" }}>
                  Status: {getAvailabilityLabel(product)}
                </p>

                {extras.length > 0 && (
                  <p style={adminProductExtrasInfoStyle}>
                    Extras aktiv ·{" "}
                    {extras
                      .map((extra) => extra.name + " +" + formatEuro(extra.price))
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

