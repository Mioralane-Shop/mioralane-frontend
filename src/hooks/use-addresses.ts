"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";
import type { SavedAddressPayload } from "@/types/address";

export const ADDRESSES_QUERY_KEY = ["addresses"] as const;

export function useMyAddresses(enabled = true) {
    return useQuery({
        queryKey: ADDRESSES_QUERY_KEY,
        queryFn: () => addressService.getMine(),
        enabled,
        retry: false,
    });
}

const refreshAddresses = async (queryClient: ReturnType<typeof useQueryClient>) => {
    await queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
};

export function useCreateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SavedAddressPayload) => addressService.create(payload),
        onSuccess: () => refreshAddresses(queryClient),
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<SavedAddressPayload> }) =>
            addressService.update(id, payload),
        onSuccess: () => refreshAddresses(queryClient),
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.remove(id),
        onSuccess: () => refreshAddresses(queryClient),
    });
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => addressService.setDefault(id),
        onSuccess: () => refreshAddresses(queryClient),
    });
}
