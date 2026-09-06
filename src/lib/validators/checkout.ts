import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Recipient name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters"),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"]),
  area: z.string().trim().min(2, "City / area must be at least 2 characters"),
  address: z.string().trim().min(5, "Detailed address must be at least 5 characters"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
