import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductAvailabilityBadge } from "../utils/availability";
import { getProductBadges } from "../utils/productBadges";
import {
  formatEuro,
  getDiscountLabel,
  getDiscountedBasePrice,
  getProductExtras,
  hasActiveDiscount,
} from "../utils/price";
import {
  priceRowStyle,
  productActionPriceStyle,
  productAvailabilityBadgeStyle,
  productCardContentStyle,
  productCardHintStyle,
  productCardMetaRowStyle,
  productCardStyle,
  productExtrasBadgeStyle,
  productImageStyle,
  productOldPriceStyle,
  productPreviewTextStyle,
  productPriceStyle,
  productPriceStackStyle,
  productTitleStyle,
} from "../styles";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const availabilityBadge = getProductAvailabilityBadge(product);
  const hasExtras = getProductExtras(product).length > 0;
  const productBadges = getProductBadges(product);
  const discountActive = hasActiveDiscount(product);
  const discountPrice = formatEuro(getDiscountedBasePrice(product));

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
            {productBadges.map((badge) => (
              <span key={badge.value} style={productExtrasBadgeStyle}>
                {badge.label}
              </span>
            ))}

            {discountActive && (
              <span style={productExtrasBadgeStyle}>{getDiscountLabel(product)}</span>
            )}

            {hasExtras && (
              <span style={productExtrasBadgeStyle}>Extras möglich</span>
            )}
          </div>

          <h3 style={productTitleStyle}>{product.title}</h3>

          <p style={productPreviewTextStyle}>{product.description}</p>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div style={priceRowStyle}>
            <span style={productPriceStackStyle}>
              {discountActive && (
                <span style={productOldPriceStyle}>{product.price}</span>
              )}
              <strong
                style={discountActive ? productActionPriceStyle : productPriceStyle}
              >
                {discountActive ? discountPrice : product.price}
              </strong>
            </span>

            <span style={productCardHintStyle}>Details ansehen →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
