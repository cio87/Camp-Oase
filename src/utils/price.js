import { getVariantPriceAdjustment, serializeProductVariant } from "./productVariants";

export function getEmptyProduct() {
  return {
    title: "",
    short_description: "",
    slug: "",
    description: "",
    price: "",
    image: "",
    file: null,
    gallery_images: [],
    galleryFiles: [],
    product_variants: [],
    sort_order: 0,
    availability_status: "available",
    product_badges: [],
    stock_quantity: 0,
    discount_enabled: false,
    discount_percent: "",
    discount_label: "",
    extras_enabled: false,
    custom_extras: [],
  };
}

export function getEmptyInquiryForm() {
  return {
    name: "",
    email: "",
    message: "",
    selectedExtras: {},
  };
}

export function getProductExtras(product) {
  if (!product || !product.extras_enabled || !Array.isArray(product.custom_extras)) {
    return [];
  }

  return product.custom_extras
    .filter((extra) => String(extra.name || "").trim())
    .map((extra) => {
      const originalPrice = Number(extra.price || 0);
      const discountPercent = extra.discount_enabled
        ? clampDiscountPercent(extra.discount_percent)
        : 0;
      const discountedPrice =
        discountPercent > 0
          ? Math.max(0, originalPrice * (1 - discountPercent / 100))
          : originalPrice;
      const discountLabel = String(extra.discount_label || "").trim();

      return {
        name: String(extra.name || "").trim(),
        description: String(extra.description || "").trim(),
        price: discountedPrice,
        original_price: originalPrice,
        discount_enabled: Boolean(extra.discount_enabled),
        discount_percent: discountPercent,
        discount_label:
          discountPercent > 0
            ? discountLabel || `${discountPercent}% Rabatt`
            : "",
        has_discount: discountPercent > 0,
        partner_enabled: Boolean(extra.partner_enabled),
        partner_name: String(extra.partner_name || "").trim(),
        partner_text: String(extra.partner_text || "").trim(),
        partner_image_url: String(extra.partner_image_url || "").trim(),
        partner_link_url: String(extra.partner_link_url || "").trim(),
        partner_link_label: String(extra.partner_link_label || "").trim(),
      };
    });
}

export function parsePrice(value) {
  if (value === null || value === undefined) return 0;

  const normalized = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const number = Number(normalized);

  return Number.isNaN(number) ? 0 : number;
}

export function formatEuro(value) {
  const number = Number(value || 0);

  return number.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function clampDiscountPercent(value) {
  const number = Number(value || 0);

  if (Number.isNaN(number)) return 0;

  return Math.min(100, Math.max(0, number));
}

export function getStockQuantity(product) {
  const stock = Number(product?.stock_quantity ?? 0);

  return Number.isNaN(stock) ? 0 : Math.max(0, Math.floor(stock));
}

export function getDiscountPercent(product) {
  if (!product?.discount_enabled) return 0;

  return clampDiscountPercent(product.discount_percent);
}

export function getProductBasePrice(product) {
  return parsePrice(product?.price);
}

export function getDiscountedBasePrice(product) {
  const basePrice = getProductBasePrice(product);
  const discountPercent = getDiscountPercent(product);

  if (discountPercent <= 0) return basePrice;

  return Math.max(0, basePrice * (1 - discountPercent / 100));
}

export function hasActiveDiscount(product) {
  return getDiscountPercent(product) > 0;
}

export function getDiscountLabel(product) {
  const percent = getDiscountPercent(product);
  const label = String(product?.discount_label || "").trim();

  if (percent <= 0) return "";
  if (label) return label;

  return `${percent}% Rabatt`;
}

export function calculateEstimatedTotal(product, form) {
  const basePrice = getDiscountedBasePrice(product);
  const variantAdjustment = getVariantPriceAdjustment(form.selectedVariant);
  const customExtras = getProductExtras(product);
  let total = basePrice + variantAdjustment;

  customExtras.forEach((extra, index) => {
    if (form.selectedExtras?.[index]?.selected) {
      total += Number(extra.price || 0);
    }
  });

  return formatEuro(total);
}

export function buildSelectedExtras(product, form) {
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
      original_price: Number(extra.original_price ?? extra.price ?? 0),
      discount_percent: Number(extra.discount_percent || 0),
      discount_label: extra.discount_label || "",
      has_discount: Boolean(extra.has_discount),
      note: extra.note,
      partner_enabled: Boolean(extra.partner_enabled),
      partner_name: extra.partner_name || "",
      partner_text: extra.partner_text || "",
    }));

  return {
    items,
    selected_variant: form.selectedVariant
      ? serializeProductVariant(form.selectedVariant)
      : null,
  };
}

