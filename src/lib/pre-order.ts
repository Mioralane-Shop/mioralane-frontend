import type { CartItem, Product } from "@/types/product";
import type { Order } from "@/types/order";

export type ProductAvailability = {
  isPreOrder: boolean;
  isAvailable: boolean;
  label: "IN STOCK" | "OUT OF STOCK" | "PRE-ORDER" | "PRE-ORDER FULL" | "PRE-ORDER CLOSED";
  ctaLabel: "Add to Cart" | "Out of Stock" | "Pre-order Now" | "Pre-order Full" | "Pre-order Closed";
  quantityLimit: number;
};

export function isPreOrderProduct(product?: Product | null) {
  return product?.availabilityMode === "pre_order";
}

export function getPreOrderRemaining(product?: Product | null) {
  if (!isPreOrderProduct(product)) {
    return product?.stock ?? 0;
  }

  return Math.max(Number(product?.preOrder?.remainingQuantity ?? 0), 0);
}

export function isAcceptingPreOrders(product?: Product | null) {
  return isPreOrderProduct(product) && product?.preOrder?.status === "accepting" && getPreOrderRemaining(product) > 0;
}

export function getPurchasableQuantityLimit(product: Product) {
  return isPreOrderProduct(product) ? getPreOrderRemaining(product) : product.stock;
}

export function isPurchasableProduct(product: Product) {
  return isPreOrderProduct(product) ? isAcceptingPreOrders(product) : product.stock > 0;
}

export function getProductAvailability(product: Product): ProductAvailability {
  if (isPreOrderProduct(product)) {
    const quantityLimit = getPreOrderRemaining(product);

    if (product.preOrder?.status !== "accepting") {
      return {
        isPreOrder: true,
        isAvailable: false,
        label: "PRE-ORDER CLOSED",
        ctaLabel: "Pre-order Closed",
        quantityLimit,
      };
    }

    if (quantityLimit <= 0) {
      return {
        isPreOrder: true,
        isAvailable: false,
        label: "PRE-ORDER FULL",
        ctaLabel: "Pre-order Full",
        quantityLimit,
      };
    }

    return {
      isPreOrder: true,
      isAvailable: true,
      label: "PRE-ORDER",
      ctaLabel: "Pre-order Now",
      quantityLimit,
    };
  }

  return {
    isPreOrder: false,
    isAvailable: product.stock > 0,
    label: product.stock > 0 ? "IN STOCK" : "OUT OF STOCK",
    ctaLabel: product.stock > 0 ? "Add to Cart" : "Out of Stock",
    quantityLimit: product.stock,
  };
}

export function formatPreOrderDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getCartPreOrderReadiness(items: CartItem[]) {
  const dates = items
    .filter((item) => isPreOrderProduct(item.product))
    .map((item) => item.product.preOrder?.expectedArrivalDate)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);

  return dates.length ? new Date(Math.max(...dates)).toISOString() : undefined;
}

export function orderContainsPreOrder(order: Order) {
  return order.containsPreOrder ?? order.items.some((item) => item.fulfillmentType === "pre_order");
}
