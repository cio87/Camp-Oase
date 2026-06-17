function getSortOrder(product) {
  const value = Number(product?.sort_order || 0);

  return Number.isNaN(value) ? 0 : value;
}

function getStableProductValue(product) {
  if (product?.created_at) {
    const timestamp = new Date(product.created_at).getTime();
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  return Number(product?.id || 0);
}

export function sortProductsByDisplayOrder(products) {
  return [...(products || [])].sort((a, b) => {
    const orderA = getSortOrder(a);
    const orderB = getSortOrder(b);
    const aIsSorted = orderA > 0;
    const bIsSorted = orderB > 0;

    if (aIsSorted && !bIsSorted) return -1;
    if (!aIsSorted && bIsSorted) return 1;
    if (aIsSorted && bIsSorted && orderA !== orderB) return orderA - orderB;

    return getStableProductValue(a) - getStableProductValue(b);
  });
}
