export const PRODUCT_BADGE_OPTIONS = [
  { value: "personalizable", label: "Personalisierbar" },
  { value: "handmade", label: "Handmade" },
  { value: "gift", label: "Geschenkidee" },
];

export function getProductBadgeValues(product) {
  if (!Array.isArray(product?.product_badges)) return [];

  const allowedValues = PRODUCT_BADGE_OPTIONS.map((option) => option.value);

  return product.product_badges.filter((badge) => allowedValues.includes(badge));
}

export function getProductBadges(product) {
  const values = getProductBadgeValues(product);

  return PRODUCT_BADGE_OPTIONS.filter((option) => values.includes(option.value));
}
