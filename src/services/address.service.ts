import api from "@/lib/axios";
import type { DeleteAddressResult, SavedAddress, SavedAddressPayload } from "@/types/address";

export const addressService = {
    getMine: async (): Promise<SavedAddress[]> => {
        const { data } = await api.get<{ success: boolean; addresses: SavedAddress[] }>("/addresses");
        return data.addresses;
    },

    getById: async (id: string): Promise<SavedAddress> => {
        const { data } = await api.get<{ success: boolean; address: SavedAddress }>(`/addresses/${id}`);
        return data.address;
    },

    create: async (payload: SavedAddressPayload): Promise<SavedAddress> => {
        const { data } = await api.post<{ success: boolean; address: SavedAddress }>(
            "/addresses",
            payload,
        );
        return data.address;
    },

    update: async (id: string, payload: Partial<SavedAddressPayload>): Promise<SavedAddress> => {
        const { data } = await api.patch<{ success: boolean; address: SavedAddress }>(
            `/addresses/${id}`,
            payload,
        );
        return data.address;
    },

    remove: async (id: string): Promise<DeleteAddressResult> => {
        const { data } = await api.delete<DeleteAddressResult>(`/addresses/${id}`);
        return data;
    },

    setDefault: async (id: string): Promise<SavedAddress> => {
        const { data } = await api.patch<{ success: boolean; address: SavedAddress }>(
            `/addresses/${id}/default`,
        );
        return data.address;
    },
};
