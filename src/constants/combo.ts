import type { ComboCardMeta } from "@/components/product/product-card";
import { DUMMY_PRODUCTS } from "@/constants/site";
import type { Product } from "@/types/product";

/**
 * Combo metadata per combo product — drives the extra bundle features on the
 * product card (badge, savings, included items, routine tag).
 */
export const COMBO_META: Record<string, ComboCardMeta> = {
    "combo-glass-skin": {
        badge: "MORNING ROUTINE",
        savings: 850,
        includedItems: ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen"],
        // routineTag: "For Glass Skin",
    },
    "combo-acne-set": {
        badge: "ACNE COMBO",
        savings: 800,
        includedItems: ["Low pH Cleanser", "Snail Mucin", "Glow Serum"],
        // routineTag: "For Acne Care",
    },
    "combo-travel-kit": {
        badge: "TRAVEL KIT",
        savings: 350,
        includedItems: ["Cleanser", "Toner", "Moisturizer", "Sunscreen"],
        // routineTag: "For On-the-Go",
    },
};

/** All combo / bundle products. */
export function getComboProducts(): Product[] {
    return DUMMY_PRODUCTS.filter((p) => p.category === "combo");
}

/** Combo metadata for a product, if it is a bundle. */
export function getComboMeta(
    product: Product,
): ComboCardMeta | undefined {
    return COMBO_META[product.id];
}
