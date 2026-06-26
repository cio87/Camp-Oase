import {
  formatEuro,
  getDiscountLabel,
  getDiscountPercent,
  getDiscountedBasePrice,
  getProductBasePrice,
  getProductExtras,
  getStockQuantity,
  hasActiveDiscount,
} from "./price";
import { getAvailabilityStatus } from "./availability";

const CART_STORAGE_KEY = "campoase_cart";
export const CART_UPDATED_EVENT = "campoase-cart-updated";

function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

function createCartId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

export function getCartItems() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    const items = JSON.parse(stored || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartUpdated();
}

export function getCartItemCount(items = getCartItems()) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
}

export function getCartSubtotal(items = getCartItems()) {
  return items.reduce(
    (sum, item) => sum + Number(item.unitTotal || 0) * Number(item.quantity || 1),
    0
  );
}

export function addProductToCart(product, selectedExtras = {}) {
  const stockQuantity = getStockQuantity(product);
  const availabilityStatus = getAvailabilityStatus(product);
  const isPreorder = availabilityStatus === "preorder";

  if (availabilityStatus !== "available" && !isPreorder) return null;
  if (!isPreorder && stockQuantity <= 0) return null;

  const customExtras = getProductExtras(product);
  const selectedItems = customExtras
    .map((extra, index) => ({
      ...extra,
      note: selectedExtras[index]?.note || "",
      selected: selectedExtras[index]?.selected || false,
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
    }));

  const originalBasePrice = getProductBasePrice(product);
  const basePrice = getDiscountedBasePrice(product);
  const extrasTotal = selectedItems.reduce(
    (sum, extra) => sum + Number(extra.price || 0),
    0
  );
  const unitTotal = basePrice + extrasTotal;

  const nextItem = {
    id: createCartId(),
    productId: product.id,
    title: product.title,
    image: product.image,
    availabilityStatus,
    isPreorder,
    stockQuantity,
    originalBasePrice,
    originalBasePriceLabel: formatEuro(originalBasePrice),
    basePrice,
    basePriceLabel: formatEuro(basePrice),
    discountPercent: getDiscountPercent(product),
    discountLabel: getDiscountLabel(product),
    discountActive: hasActiveDiscount(product),
    selectedExtras: selectedItems,
    unitTotal,
    unitTotalLabel: formatEuro(unitTotal),
    quantity: 1,
  };

  saveCartItems([...getCartItems(), nextItem]);

  return nextItem;
}

export function updateCartItemQuantity(itemId, quantity) {
  const requestedQuantity = Number(quantity || 1);
  const safeQuantity = Number.isNaN(requestedQuantity)
    ? 1
    : Math.max(1, requestedQuantity);

  const updatedItems = getCartItems().map((item) =>
    item.id === itemId
      ? {
          ...item,
          quantity: Math.min(
            item.stockQuantity > 0 ? Number(item.stockQuantity) : Infinity,
            safeQuantity
          ),
        }
      : item
  );

  saveCartItems(updatedItems);
}

export function removeCartItem(itemId) {
  saveCartItems(getCartItems().filter((item) => item.id !== itemId));
}

export function clearCart() {
  saveCartItems([]);
}

export function buildCartMessage(items, subtotalLabel) {
  const lines = [
    "Hallo Camp Oase,",
    "",
    "ich möchte meinen Warenkorb unverbindlich anfragen:",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.title}`,
      `Menge: ${item.quantity || 1}`,
      `Basispreis: ${item.basePriceLabel || formatEuro(item.basePrice)}`,
      `Einzelpreis mit Extras: ${formatEuro(item.unitTotal)}`
    );

    if (item.isPreorder) {
      lines.push("Hinweis: Vorbestellung");
    }

    if (item.discountActive) {
      lines.push(
        `Rabatt: ${item.discountLabel || item.discountPercent + "% Rabatt"}`,
        `Ursprünglicher Basispreis: ${
          item.originalBasePriceLabel || formatEuro(item.originalBasePrice)
        }`
      );
    }

    if (item.selectedExtras?.length) {
      lines.push("Ausgewählte Extras:");
      item.selectedExtras.forEach((extra) => {
        lines.push(`- ${extra.name} +${formatEuro(extra.price)}`);
        if (extra.has_discount) {
          lines.push(
            `  Rabatt: ${extra.discount_label || extra.discount_percent + "% Rabatt"}`,
            `  Vorher: ${formatEuro(extra.original_price)}`
          );
        }
        if (extra.note) lines.push(`  Hinweis: ${extra.note}`);
      });
    }

    lines.push(`Positionssumme: ${formatEuro(item.unitTotal * item.quantity)}`, "");
  });

  lines.push(`Voraussichtlicher Gesamtbetrag: ${subtotalLabel}`, "");
  lines.push("Meine Nachricht dazu:");

  return lines.join("\n");
}

export function buildCartSelectedExtras(items) {
  return {
    type: "cart",
    positions: items.map((item) => ({
      product_id: item.productId,
      product_title: item.title,
      availability_status: item.availabilityStatus || "",
      is_preorder: Boolean(item.isPreorder),
      quantity: Number(item.quantity || 1),
      base_price: item.basePrice,
      base_price_label: item.basePriceLabel || formatEuro(item.basePrice),
      original_base_price: item.originalBasePrice,
      original_base_price_label: item.originalBasePriceLabel,
      discount_percent: item.discountPercent || 0,
      discount_label: item.discountLabel || "",
      unit_total: Number(item.unitTotal || 0),
      unit_total_label: formatEuro(item.unitTotal),
      line_total: Number(item.unitTotal || 0) * Number(item.quantity || 1),
      line_total_label: formatEuro(
        Number(item.unitTotal || 0) * Number(item.quantity || 1)
      ),
      extras: Array.isArray(item.selectedExtras) ? item.selectedExtras : [],
    })),
  };
}
