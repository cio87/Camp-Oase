import { Link } from "react-router-dom";
import {
  priceRowStyle,
  productCardStyle,
  productImageStyle,
  productPreviewTextStyle,
  productPriceStyle,
  productTitleStyle,
  requestButtonStyle,
} from "../styles";

export default function ProductCard({ product, onInquiry }) {
  return (
    <article style={productCardStyle}>
      <Link
        to={`/produkt/${product.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img src={product.image} alt={product.title} style={productImageStyle} />

        <div style={{ padding: "24px 24px 0" }}>
          <h3 style={productTitleStyle}>{product.title}</h3>

          <p style={productPreviewTextStyle}>{product.description}</p>
        </div>
      </Link>

      <div style={{ padding: "0 24px 24px" }}>
        <div style={priceRowStyle}>
          <strong style={productPriceStyle}>{product.price}</strong>

          <button type="button" style={requestButtonStyle} onClick={() => onInquiry(product)}>
            Anfragen
          </button>
        </div>
      </div>
    </article>
  );
}

