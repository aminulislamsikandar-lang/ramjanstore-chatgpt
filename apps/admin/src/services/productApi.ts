import type { Product } from "@ramjanstore/types";
import { apiFetch } from "../lib/api";
export type ProductWrite = Omit<Product, "id" | "createdAt" | "updatedAt">;
interface ProductPage { items: Product[]; nextCursor: string | null; }
export const productApi = {
  list: (params: { pageSize?: number; cursor?: string } = {}) => { const qs = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => v !== undefined && qs.set(k, String(v))); return apiFetch<ProductPage>(`/products/admin/list?${qs}`); },
  create: (product: ProductWrite) => apiFetch<Product>("/products/admin", { method: "POST", body: JSON.stringify(product) }),
  update: (id: string, patch: Partial<ProductWrite>) => apiFetch<Product>(`/products/admin/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deactivate: (id: string) => apiFetch<Product>(`/products/admin/${encodeURIComponent(id)}`, { method: "DELETE" }),
  updateStock: (id: string, stockQuantity: number, variantId?: string) => apiFetch<Product>(`/products/admin/${encodeURIComponent(id)}/stock`, { method: "PATCH", body: JSON.stringify({ stockQuantity, variantId }) }),
};
