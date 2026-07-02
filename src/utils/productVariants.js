export function getVariantPriceAdjustment(variant) {
  const value = Number(variant?.price_adjustment || 0);

  return Number.isNaN(value) ? 0 : value;
}

export function getProductVariants(product, options = {}) {
  const variants = Array.isArray(product?.product_variants)
    ? product.product_variants
    : [];

  return variants
    .map((variant, index) => ({
      id: String(variant.id || `variant-${index + 1}`),
      name: String(variant.name || "").trim(),
      description: String(variant.description || "").trim(),
      image_url: String(variant.image_url || "").trim(),
      price_adjustment: getVariantPriceAdjustment(variant),
      enabled: variant.enabled !== false,
    }))
    .filter((variant) => variant.name)
    .filter((variant) => !options.onlyEnabled || variant.enabled);
}

export function createEmptyProductVariant() {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    description: "",
    image_url: "",
    image_file: null,
    price_adjustment: "0",
    enabled: true,
  };
}

export function serializeProductVariant(variant) {
  return {
    id: String(variant.id || createEmptyProductVariant().id),
    name: String(variant.name || "").trim(),
    description: String(variant.description || "").trim(),
    image_url: String(variant.image_url || "").trim(),
    price_adjustment: getVariantPriceAdjustment(variant),
    enabled: variant.enabled !== false,
  };
}
