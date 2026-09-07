import { z } from "zod";

const gasBrand = z.enum(["indane", "hp", "bharat"]);
const category = z.enum(["clothes", "gas", "rice", "agriculture"]);

export const productImageSchema = z.object({
  publicId: z.string().min(1), secureUrl: z.string().url(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), altText: z.string().max(160).optional(),
});

export const productVariantSchema = z.object({
  id: z.string().min(1), name: z.string().min(1).max(120), sku: z.string().min(1).max(80), price: z.number().nonnegative(), compareAtPrice: z.number().nonnegative().optional(), stockQuantity: z.number().int().nonnegative(), lowStockThreshold: z.number().int().nonnegative(), attributes: z.record(z.string(), z.string()).optional(),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(180), slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().max(10000).default(""), category, subcategory: z.string().trim().max(100).optional(), brand: z.string().trim().max(100).optional(), gasBrand: gasBrand.optional(), sku: z.string().trim().min(1).max(80), price: z.number().nonnegative(), compareAtPrice: z.number().nonnegative().optional(), stockQuantity: z.number().int().nonnegative().default(0), lowStockThreshold: z.number().int().nonnegative().default(5), images: z.array(productImageSchema).max(20).default([]), variants: z.array(productVariantSchema).max(100).optional(), tags: z.array(z.string().trim().max(50)).max(30).default([]), isActive: z.boolean().default(true), isFeatured: z.boolean().default(false), ratingSummary: z.object({ average: z.number().min(0).max(5).default(0), count: z.number().int().nonnegative().default(0) }).default({ average: 0, count: 0 }), engagement: z.object({ likeCount: z.number().int().nonnegative().default(0), commentCount: z.number().int().nonnegative().default(0) }).default({ likeCount: 0, commentCount: 0 }), seo: z.object({ title: z.string().max(180).optional(), description: z.string().max(320).optional() }).optional(),
}).superRefine((value, ctx) => {
  if (value.category === "gas" && !value.gasBrand) ctx.addIssue({ code: "custom", path: ["gasBrand"], message: "Gas products require a gasBrand." });
  if (value.category !== "gas" && value.gasBrand) ctx.addIssue({ code: "custom", path: ["gasBrand"], message: "gasBrand is only valid for gas products." });
  if (value.compareAtPrice !== undefined && value.compareAtPrice < value.price) ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "compareAtPrice must be greater than or equal to price." });
});

export const productUpdateSchema = productCreateSchema.partial().omit({ ratingSummary: true, engagement: true });
export const stockUpdateSchema = z.object({ stockQuantity: z.number().int().nonnegative(), variantId: z.string().min(1).optional() });
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
