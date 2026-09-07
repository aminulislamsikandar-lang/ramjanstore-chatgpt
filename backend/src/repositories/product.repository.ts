import { db, Timestamp } from "../firebase/firestore.js";
import type { ProductCreateInput, ProductUpdateInput } from "../schemas/product.schema.js";

const products = db.collection("products");

export interface ProductQuery { category?: string; subcategory?: string; gasBrand?: string; search?: string; sort?: "price_asc" | "price_desc" | "rating" | "newest"; pageSize: number; cursor?: string; }

function normalize<T extends Record<string, unknown>>(id: string, data: T) { return { id, ...data }; }

export async function findProducts(query: ProductQuery) {
  let q: FirebaseFirestore.Query = products.where("isActive", "==", true);
  if (query.category) q = q.where("category", "==", query.category);
  if (query.subcategory) q = q.where("subcategory", "==", query.subcategory);
  if (query.gasBrand) q = q.where("gasBrand", "==", query.gasBrand);
  const order = query.sort === "price_asc" ? ["price", "asc"] : query.sort === "price_desc" ? ["price", "desc"] : query.sort === "rating" ? ["ratingSummary.average", "desc"] : ["createdAt", "desc"];
  q = q.orderBy(order[0], order[1] as FirebaseFirestore.OrderByDirection).limit(query.pageSize + 1);
  if (query.cursor) {
    const cursor = await products.doc(query.cursor).get();
    if (cursor.exists) q = q.startAfter(cursor);
  }
  const snap = await q.get();
  let items = snap.docs.slice(0, query.pageSize).map((d) => normalize(d.id, d.data()));
  if (query.search) {
    const term = query.search.trim().toLowerCase();
    items = items.filter((p) => `${String(p.name)} ${String(p.description)} ${(p.tags as string[] | undefined)?.join(" ") ?? ""}`.toLowerCase().includes(term));
  }
  const hasMore = snap.docs.length > query.pageSize;
  return { items, nextCursor: hasMore ? snap.docs[query.pageSize - 1]?.id : null };
}

export async function findById(id: string) { const snap = await products.doc(id).get(); return snap.exists ? normalize(snap.id, snap.data()!) : null; }
export async function findBySlug(slug: string) { const snap = await products.where("slug", "==", slug).where("isActive", "==", true).limit(1).get(); return snap.empty ? null : normalize(snap.docs[0].id, snap.docs[0].data()); }
export async function findAdminProducts(pageSize: number, cursor?: string) {
  let q: FirebaseFirestore.Query = products.orderBy("createdAt", "desc").limit(pageSize + 1);
  if (cursor) { const c = await products.doc(cursor).get(); if (c.exists) q = q.startAfter(c); }
  const snap = await q.get();
  return { items: snap.docs.slice(0, pageSize).map((d) => normalize(d.id, d.data())), nextCursor: snap.docs.length > pageSize ? snap.docs[pageSize - 1].id : null };
}
export async function createProduct(input: ProductCreateInput) { const ref = products.doc(); const now = Timestamp.now(); await ref.create({ ...input, createdAt: now, updatedAt: now }); return findById(ref.id); }
export async function updateProduct(id: string, input: ProductUpdateInput) { const ref = products.doc(id); const snap = await ref.get(); if (!snap.exists) return null; await ref.update({ ...input, updatedAt: Timestamp.now() }); return findById(id); }
export async function deactivateProduct(id: string) { return updateProduct(id, { isActive: false }); }
export async function updateStock(id: string, stockQuantity: number, variantId?: string) {
  const ref = products.doc(id);
  const snap = await ref.get(); if (!snap.exists) return null;
  if (!variantId) { await ref.update({ stockQuantity, updatedAt: Timestamp.now() }); }
  else {
    const variants = (snap.data()?.variants ?? []) as Record<string, unknown>[];
    const index = variants.findIndex((v) => v.id === variantId); if (index < 0) return null;
    variants[index] = { ...variants[index], stockQuantity };
    await ref.update({ variants, updatedAt: Timestamp.now() });
  }
  return findById(id);
}
