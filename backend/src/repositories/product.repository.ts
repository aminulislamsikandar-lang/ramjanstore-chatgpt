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
  if (query.cursor) { const cursor = await products.doc(query.cursor).get(); if (cursor.exists) q = q.startAfter(cursor); }
  const snap = await q.get();
  let items = snap.docs.slice(0, query.pageSize).map(d => normalize(d.id, d.data()));
  if (query.search) { const term=query.search.trim().toLowerCase(); items=items.filter(p=>`${String(p.name)} ${String(p.description)} ${(p.tags as string[]|undefined)?.join(" ")??""}`.toLowerCase().includes(term)); }
  return { items, nextCursor: snap.docs.length > query.pageSize ? snap.docs[query.pageSize-1]?.id : null };
}
export async function findById(id:string){const s=await products.doc(id).get();return s.exists?normalize(s.id,s.data()!):null;}
export async function findBySlug(slug:string){const s=await products.where("slug","==",slug).where("isActive","==",true).limit(1).get();return s.empty?null:normalize(s.docs[0].id,s.docs[0].data());}
export async function findAdminProducts(pageSize:number,cursor?:string){let q:FirebaseFirestore.Query=products.orderBy("createdAt","desc").limit(pageSize+1);if(cursor){const c=await products.doc(cursor).get();if(c.exists)q=q.startAfter(c);}const s=await q.get();return{items:s.docs.slice(0,pageSize).map(d=>normalize(d.id,d.data())),nextCursor:s.docs.length>pageSize?s.docs[pageSize-1].id:null};}
export async function createProduct(input:ProductCreateInput){const ref=products.doc();const now=Timestamp.now();await ref.create({...input,createdAt:now,updatedAt:now});return findById(ref.id);}
export async function updateProduct(id:string,input:ProductUpdateInput){const ref=products.doc(id);const s=await ref.get();if(!s.exists)return null;await ref.update({...input,updatedAt:Timestamp.now()});return findById(id);}
export async function deactivateProduct(id:string){return updateProduct(id,{isActive:false});}

export async function updateStock(id:string,stockQuantity:number,variantId?:string){
  if(!Number.isInteger(stockQuantity)||stockQuantity<0) throw new Error("Stock quantity must be a non-negative integer");
  const ref=products.doc(id);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref); if(!snap.exists) throw new Error("PRODUCT_NOT_FOUND");
    const data=snap.data()!;
    if(!variantId){ tx.update(ref,{stockQuantity,updatedAt:Timestamp.now()}); return; }
    const variants=Array.isArray(data.variants)?[...(data.variants as Record<string,unknown>[])]:[];
    const index=variants.findIndex(v=>v.id===variantId); if(index<0) throw new Error("VARIANT_NOT_FOUND");
    variants[index]={...variants[index],stockQuantity};
    tx.update(ref,{variants,updatedAt:Timestamp.now()});
  });
  return findById(id);
}
