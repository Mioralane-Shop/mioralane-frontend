import type { Product } from "@/types/product";

export type WishlistItemType = "product" | "combo";

/** Values match the catalog sort convention (`constants/site.ts` SORT_OPTIONS). */
export type WishlistSort = "newest" | "price-asc" | "price-desc" | "availability";

export type WishlistStockStatus = "in_stock" | "low_stock" | "out_of_stock";

/**
 * A saved wishlist entry enriched with live catalog data.
 *
 * `currentPrice` / `stock` / `stockStatus` always come from the backend (never
 * from stored browser state), and `priceAtAdd` is the price the customer saved
 * the item at, which `priceDrop` compares against.
 */
export interface WishlistEntry {
    id: string;
    itemId: string;
    itemType: WishlistItemType;
    addedAt: string;
    priceAtAdd: number;
    currentPrice: number;
    compareAtPrice: number | null;
    priceDrop: number;
    hasPriceDrop: boolean;
    stock: number;
    stockStatus: WishlistStockStatus;
    isPreOrder: boolean;
    isAvailable: boolean;
    /** Catalog document, ready to hand to the cart store. */
    product: Product;
}

export interface WishlistResponse {
    success: boolean;
    sort?: WishlistSort;
    /** Legacy fields — kept so existing hearts/count keep working. */
    productIds: string[];
    products: Product[];
    items: WishlistEntry[];
    isWishlisted?: boolean;
    removed?: boolean;
    message?: string;
}
