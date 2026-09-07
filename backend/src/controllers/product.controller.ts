import type { Request, Response } from "express";
import { productCreateSchema, productUpdateSchema, stockUpdateSchema } from "../schemas/product.schema.js";
import * as repo from "../repositories/product.repository.js";

export async function listProducts(req: Request, res: Response) {
  const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 50);
  const result = await repo.findProducts({ category: req.query.category as string | undefined, subcategory: req.query.subcategory as string | undefined, gasBrand: req.query.gasBrand as string | undefined, search: req.query.search as string | undefined, sort: req.query.sort as never, pageSize, cursor: req.query.cursor as string | undefined });
  res.json({ success: true, data: result });
}
export async function getProduct(req: Request, res: Response) {
  const value = req.params.identifier;
  const product = value.includes("-") ? await repo.findBySlug(value) : await repo.findById(value);
  if (!product) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } });
  return res.json({ success: true, data: product });
}
export async function listAdminProducts(req: Request, res: Response) { const result = await repo.findAdminProducts(Math.min(Math.max(Number(req.query.pageSize ?? 30), 1), 100), req.query.cursor as string | undefined); res.json({ success: true, data: result }); }
export async function createProduct(req: Request, res: Response) { const input = productCreateSchema.parse(req.body); const product = await repo.createProduct(input); res.status(201).json({ success: true, data: product }); }
export async function updateProduct(req: Request, res: Response) { const input = productUpdateSchema.parse(req.body); const product = await repo.updateProduct(req.params.id, input); if (!product) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } }); return res.json({ success: true, data: product }); }
export async function deactivateProduct(req: Request, res: Response) { const product = await repo.deactivateProduct(req.params.id); if (!product) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." } }); return res.json({ success: true, data: product }); }
export async function updateStock(req: Request, res: Response) { const input = stockUpdateSchema.parse(req.body); const product = await repo.updateStock(req.params.id, input.stockQuantity, input.variantId); if (!product) return res.status(404).json({ success: false, error: { code: "PRODUCT_NOT_FOUND", message: "Product or variant not found." } }); return res.json({ success: true, data: product }); }
