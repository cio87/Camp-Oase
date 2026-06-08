export const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Verfügbar" },
  { value: "sold_out", label: "Ausverkauft" },
  { value: "coming_soon", label: "Bald verfügbar" },
  { value: "hidden", label: "Ausgeblendet" },
];

export function getAvailabilityStatus(product) {
  return product?.availability_status || "available";
}

export function getAvailabilityLabel(product) {
  const status = getAvailabilityStatus(product);
  return (
    AVAILABILITY_OPTIONS.find((option) => option.value === status)?.label ||
    "Verfügbar"
  );
}

export function isProductAvailable(product) {
  return getAvailabilityStatus(product) === "available";
}

export function isProductVisible(product) {
  return getAvailabilityStatus(product) !== "hidden";
}

export function getProductAvailabilityBadge(product) {
  const status = getAvailabilityStatus(product);

  if (status === "sold_out") return "Ausverkauft";
  if (status === "coming_soon") return "Bald wieder verfügbar";

  return "";
}

export function getProductAvailabilityNotice(product) {
  const status = getAvailabilityStatus(product);

  if (status === "sold_out") return "Dieses Produkt ist aktuell ausverkauft.";
  if (status === "coming_soon") {
    return "Dieses Produkt ist bald wieder verfügbar.";
  }

  return "";
}
