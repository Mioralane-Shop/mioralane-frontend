import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Recipient name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"]),
  area: z.string().min(2, "City / area must be at least 2 characters"),
  address: z.string().min(5, "Detailed address must be at least 5 characters"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
