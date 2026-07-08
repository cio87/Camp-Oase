import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductAvailabilityBadge } from "../utils/availability";
import { stripMarkdown } from "../utils/markdown";
import { getProductBadges } from "../utils/productBadges";
import {
  formatEuro,
  getDiscountLabel,
  getDiscountedBasePrice,
  getProductExtras,
  hasActiveDiscount,
} from "../utils/price";
import { getProductPath } from "../utils/slug";
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
  taxHintStyle,
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
      to={getProductPath(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...productCardStyle,
        ...(isHovered
          ? {
              boxShadow: "0 16px 34px rgba(72, 54, 34, 0.1)",
              transform: "translateY(-3px)",
            }
          : {}),
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <article
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 auto",
          height: "100%",
        }}
      >
        {availabilityBadge && (
          <span style={productAvailabilityBadgeStyle}>{availabilityBadge}</span>
        )}

        <img
          src={product.image}
          alt={
            product.title
              ? `${product.title} von Camp Oase`
              : "Camp Oase Produktbild"
          }
          style={productImageStyle}
        />

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

          <p style={productPreviewTextStyle}>{stripMarkdown(product.description)}</p>
        </div>

        <div
          style={{
            padding:
              "0 clamp(18px, 5vw, 24px) clamp(18px, 5vw, 24px)",
            marginTop: "auto",
          }}
        >
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

            <span style={productCardHintStyle}>Details ansehen</span>
          </div>
          <p style={taxHintStyle}>
            Endpreis. Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen.
          </p>
        </div>
      </article>
    </Link>
  );
}
