export function getEmptyProduct() {
  return {
    title: "",
    description: "",
    price: "",
    image: "",
    file: null,
    availability_status: "available",
    product_badges: [],
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
    .map((extra) => ({
      name: String(extra.name || "").trim(),
      description: String(extra.description || "").trim(),
      price: Number(extra.price || 0),
    }));
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

export function calculateEstimatedTotal(product, form) {
  const basePrice = parsePrice(product.price);
  const customExtras = getProductExtras(product);
  let total = basePrice;

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
      note: extra.note,
    }));

  return { items };
}

