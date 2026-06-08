import { formatEuro, getProductExtras, parsePrice } from "./price";

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
      note: extra.note,
    }));

  const basePrice = parsePrice(product.price);
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
    basePrice,
    basePriceLabel: product.price,
    selectedExtras: selectedItems,
    unitTotal,
    unitTotalLabel: formatEuro(unitTotal),
    quantity: 1,
  };

  saveCartItems([...getCartItems(), nextItem]);

  return nextItem;
}

export function updateCartItemQuantity(itemId, quantity) {
  const safeQuantity = Math.max(1, Number(quantity || 1));
  const updatedItems = getCartItems().map((item) =>
    item.id === itemId ? { ...item, quantity: safeQuantity } : item
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

    if (item.selectedExtras?.length) {
      lines.push("Ausgewählte Extras:");
      item.selectedExtras.forEach((extra) => {
        lines.push(`- ${extra.name} +${formatEuro(extra.price)}`);
        if (extra.note) lines.push(`  Hinweis: ${extra.note}`);
      });
    }

    lines.push(`Positionssumme: ${formatEuro(item.unitTotal * item.quantity)}`, "");
  });

  lines.push(`Voraussichtlicher Gesamtbetrag: ${subtotalLabel}`, "");
  lines.push("Meine Nachricht dazu:");

  return lines.join("\n");
}
