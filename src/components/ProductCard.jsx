import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductAvailabilityBadge } from "../utils/availability";
import { getProductExtras } from "../utils/price";
import {
  priceRowStyle,
  productAvailabilityBadgeStyle,
  productCardContentStyle,
  productCardHintStyle,
  productCardMetaRowStyle,
  productCardStyle,
  productExtrasBadgeStyle,
  productImageStyle,
  productPreviewTextStyle,
  productPriceStyle,
  productTitleStyle,
} from "../styles";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const availabilityBadge = getProductAvailabilityBadge(product);
  const hasExtras = getProductExtras(product).length > 0;

  return (
    <Link
      to={`/produkt/${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...productCardStyle,
        ...(isHovered
          ? {
              boxShadow: "0 18px 42px rgba(0,0,0,0.12)",
              transform: "translateY(-3px)",
            }
          : {}),
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <article>
        {availabilityBadge && (
          <span style={productAvailabilityBadgeStyle}>{availabilityBadge}</span>
        )}

        <img src={product.image} alt={product.title} style={productImageStyle} />

        <div style={productCardContentStyle}>
          <div style={productCardMetaRowStyle}>
            {hasExtras && (
              <span style={productExtrasBadgeStyle}>Extras möglich</span>
            )}
          </div>

          <h3 style={productTitleStyle}>{product.title}</h3>

          <p style={productPreviewTextStyle}>{product.description}</p>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div style={priceRowStyle}>
            <strong style={productPriceStyle}>{product.price}</strong>

            <span style={productCardHintStyle}>Details ansehen →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
