import type { Product } from "@ramjanstore/types";
import { apiFetch } from "../lib/api";

export interface ProductListParams { category?: Product["category"]; subcategory?: string; gasBrand?: Product["gasBrand"]; search?: string; sort?: "price_asc" | "price_desc" | "rating" | "newest"; pageSize?: number; cursor?: string; }
interface ProductPage { items: Product[]; nextCursor: string | null; }
export const productApi = {
  list: (params: ProductListParams = {}) => { const qs = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => v !== undefined && qs.set(k, String(v))); return apiFetch<ProductPage>(`/products?${qs}`); },
  get: (identifier: string) => apiFetch<Product>(`/products/${encodeURIComponent(identifier)}`),
};
