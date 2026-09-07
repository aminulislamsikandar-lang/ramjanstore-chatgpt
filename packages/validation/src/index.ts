import { z } from "zod";

export const idSchema = z.string().trim().min(1).max(128);
export const postalCodeSchema = z.string().regex(/^\d{6}$/, "Postal code must be 6 digits");
export const moneySchema = z.number().finite().nonnegative();

export const productCategorySchema = z.enum(["clothes", "gas", "rice", "agriculture"]);
export const gasBrandSchema = z.enum(["indane", "hp", "bharat"]);

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(10_000),
  category: productCategorySchema,
  subcategory: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(100).optional(),
  gasBrand: gasBrandSchema.optional(),
  sku: z.string().trim().min(1).max(100),
  price: moneySchema,
  compareAtPrice: moneySchema.optional(),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  tags: z.array(z.string().trim().min(1).max(50)).max(50).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const orderItemSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().positive().max(100),
  variantId: idSchema.optional(),
});

export const addressSchema = z.object({
  label: z.enum(["home", "work", "other"]),
  fullName: z.string().trim().min(2).max(120),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  addressLine1: z.string().trim().min(3).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: postalCodeSchema,
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(100),
  addressId: idSchema.optional(),
  address: addressSchema.optional(),
  couponCode: z.string().trim().max(50).optional(),
  paymentMethod: z.enum(["cod", "upi"]).default("cod"),
  customerNote: z.string().trim().max(500).optional(),
}).refine((value) => Boolean(value.addressId) !== Boolean(value.address), {
  message: "Provide exactly one of addressId or address",
  path: ["addressId"],
});

export const couponCodeSchema = z.object({ code: z.string().trim().min(1).max(50) });
export const ratingSchema = z.object({
  productId: idSchema,
  orderId: idSchema,
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(2_000).optional(),
});
export const commentSchema = z.object({
  productId: idSchema,
  content: z.string().trim().min(1).max(2_000),
  parentCommentId: idSchema.nullable().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["confirmed", "preparing", "ready_for_delivery", "out_for_delivery", "delivered", "cancelled"]),
  note: z.string().trim().max(500).optional(),
});
