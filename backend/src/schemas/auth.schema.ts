import { z } from "zod";

export const profileSyncSchema = z.object({ displayName: z.string().trim().min(1).max(120).optional(), photoURL: z.string().url().nullable().optional() });
export const addressSchema = z.object({ label: z.enum(["home", "work", "other"]), fullName: z.string().trim().min(2).max(120), phoneNumber: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/), addressLine1: z.string().trim().min(3).max(200), addressLine2: z.string().trim().max(200).optional(), landmark: z.string().trim().max(160).optional(), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), postalCode: z.string().trim().regex(/^\d{6}$/), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), deliveryZoneId: z.string().min(1).optional(), isDefault: z.boolean().default(false) });
export type AddressInput = z.infer<typeof addressSchema>;
