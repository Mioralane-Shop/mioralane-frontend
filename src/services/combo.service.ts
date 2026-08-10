import api from "@/lib/axios";
import type { Product } from "@/types/product";
import type { ComboCardMeta } from "@/components/product/product-card";

/** A combo product returned by the API — Product fields + ComboCardMeta fields in one object. */
export type ComboProduct = Product & ComboCardMeta;

export interface PaginatedCombosResponse {
    success: boolean;
    count: number;
    page: number;
    limit: number;
    totalPages: number;
    combos: ComboProduct[];
}

export const comboService = {
    getAll: async (params?: Record<string, string>): Promise<PaginatedCombosResponse> => {
        const { data } = await api.get<PaginatedCombosResponse>("/combos", { params });
        return data;
    },

    getBySlug: async (slug: string): Promise<ComboProduct> => {
        const { data } = await api.get<{ success: boolean; combo: ComboProduct }>(`/combos/${slug}`);
        return data.combo;
    },
};
