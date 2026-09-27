import { z } from "zod";

/**
 * Mirrors the checkout shipping-address rules so a saved address can always be
 * used to place an order without re-entering details.
 */
export const addressSchema = z.object({
    name: z.string().trim().min(2, "Recipient name must be at least 2 characters"),
    phone: z
        .string()
        .trim()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
    division: z.string().trim().min(1, "Division is required"),
    district: z.string().trim().min(1, "District is required"),
    area: z.string().trim().min(2, "Area / Thana must be at least 2 characters"),
    fullAddress: z.string().trim().min(5, "Full address must be at least 5 characters"),
    landmark: z.string().trim().optional(),
    isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
    name: "",
    phone: "",
    division: "",
    district: "",
    area: "",
    fullAddress: "",
    landmark: "",
    isDefault: false,
};
