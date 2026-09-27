import type { DeliveryZone } from "@/types/order";

export interface SavedAddress {
    id: string;
    userId: string;
    name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    fullAddress: string;
    landmark?: string;
    deliveryZone: DeliveryZone;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SavedAddressPayload {
    name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    fullAddress: string;
    landmark?: string;
    isDefault?: boolean;
}

export interface DeleteAddressResult {
    success: boolean;
    message?: string;
    addressId: string;
    /** Address automatically promoted to default after deleting the default one. */
    promotedDefaultAddressId?: string;
}
