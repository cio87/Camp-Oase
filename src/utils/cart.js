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
import { getVariantPriceAdjustment, serializeProductVariant } from "./productVariants";

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

function normalizeCartQuantity(quantity) {
  const requestedQuantity = Number(quantity || 1);

  if (Number.isNaN(requestedQuantity)) return 1;

  return Math.max(1, Math.floor(requestedQuantity));
}

function buildCartSelectionKey(item) {
  return JSON.stringify({
    productId: String(item.productId || ""),
    selectedVariant: item.selectedVariant
      ? {
          id: item.selectedVariant.id || "",
          name: item.selectedVariant.name || "",
          price_adjustment: Number(item.selectedVariant.price_adjustment || 0),
          image_url: item.selectedVariant.image_url || "",
        }
      : null,
    selectedExtras: Array.isArray(item.selectedExtras)
      ? item.selectedExtras.map((extra) => ({
          name: extra.name || "",
          description: extra.description || "",
          price: Number(extra.price || 0),
          original_price: Number(extra.original_price ?? extra.price ?? 0),
          discount_percent: Number(extra.discount_percent || 0),
          discount_label: extra.discount_label || "",
          has_discount: Boolean(extra.has_discount),
          note: extra.note || "",
        }))
      : [],
    unitTotal: Number(item.unitTotal || 0),
  });
}

export function addProductToCart(
  product,
  selectedExtras = {},
  selectedVariant = null,
  quantity = 1
) {
  const requestedQuantity = normalizeCartQuantity(quantity);
  const stockQuantity = getStockQuantity(product);
  const availabilityStatus = getAvailabilityStatus(product);
  const isPreorder = availabilityStatus === "preorder";

  if (availabilityStatus !== "available" && !isPreorder) {
    return { status: "unavailable", item: null, quantityAdded: 0 };
  }

  if (!isPreorder && stockQuantity <= 0) {
    return { status: "unavailable", item: null, quantityAdded: 0 };
  }

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

  const variant = selectedVariant ? serializeProductVariant(selectedVariant) : null;
  const variantAdjustment = getVariantPriceAdjustment(variant);
  const originalBasePrice = getProductBasePrice(product) + variantAdjustment;
  const basePrice = getDiscountedBasePrice(product) + variantAdjustment;
  const extrasTotal = selectedItems.reduce(
    (sum, extra) => sum + Number(extra.price || 0),
    0
  );
  const unitTotal = basePrice + extrasTotal;
  const maxQuantity = !isPreorder && stockQuantity > 0 ? Number(stockQuantity) : Infinity;

  const nextItem = {
    id: createCartId(),
    productId: product.id,
    title: product.title,
    image: variant?.image_url || product.image,
    selectedVariant: variant,
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
    quantity: Math.min(requestedQuantity, maxQuantity),
  };

  const currentItems = getCartItems();
  const nextItemKey = buildCartSelectionKey(nextItem);
  const existingIndex = currentItems.findIndex(
    (item) => buildCartSelectionKey(item) === nextItemKey
  );

  if (existingIndex >= 0) {
    const existingItem = currentItems[existingIndex];
    const currentQuantity = normalizeCartQuantity(existingItem.quantity);

    if (currentQuantity >= maxQuantity) {
      return {
        status: "max_reached",
        item: existingItem,
        quantityAdded: 0,
      };
    }

    const nextQuantity = Math.min(maxQuantity, currentQuantity + requestedQuantity);
    const quantityAdded = nextQuantity - currentQuantity;

    if (quantityAdded <= 0) {
      return {
        status: "max_reached",
        item: existingItem,
        quantityAdded: 0,
      };
    }

    const updatedItem = {
      ...existingItem,
      availabilityStatus,
      isPreorder,
      stockQuantity,
      quantity: nextQuantity,
    };
    const updatedItems = [...currentItems];
    updatedItems[existingIndex] = updatedItem;

    saveCartItems(updatedItems);

    return {
      status: "increased",
      item: updatedItem,
      quantityAdded,
    };
  }

  saveCartItems([...currentItems, nextItem]);

  return {
    status: "created",
    item: nextItem,
    quantityAdded: nextItem.quantity,
  };
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

    if (item.selectedVariant?.name) {
      lines.push(`Variante: ${item.selectedVariant.name}`);
      if (item.selectedVariant.description) {
        lines.push(`Variantenhinweis: ${item.selectedVariant.description}`);
      }
      if (Number(item.selectedVariant.price_adjustment || 0) !== 0) {
        lines.push(
          `Varianten-Aufpreis: ${formatEuro(item.selectedVariant.price_adjustment)}`
        );
      }
    }

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
      variant: item.selectedVariant || null,
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
