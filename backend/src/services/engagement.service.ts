import { db, FieldValue, Timestamp } from "../firebase/firestore.js";
import { ApiError } from "../utils/errors.js";

export async function toggleWishlist(userId: string, productId: string) {
  const ref = db.collection("wishlists").doc(`${userId}_${productId}`);
  const product = await db.collection("products").doc(productId).get();
  if (!product.exists) throw new ApiError(404, "NOT_FOUND", "Product not found");
  const existing = await ref.get();
  if (existing.exists) { await ref.delete(); return { liked: false }; }
  await ref.set({ userId, productId, createdAt: Timestamp.now() });
  return { liked: true };
}

export async function toggleLike(userId: string, productId: string) {
  const likeRef = db.collection("likes").doc(`${productId}_${userId}`);
  const productRef = db.collection("products").doc(productId);
  return db.runTransaction(async tx => {
    const like = await tx.get(likeRef);
    const product = await tx.get(productRef);
    if (!product.exists) throw new ApiError(404, "NOT_FOUND", "Product not found");
    if (like.exists) { tx.delete(likeRef); tx.update(productRef, { "engagement.likeCount": FieldValue.increment(-1), updatedAt: Timestamp.now() }); return { liked: false }; }
    tx.set(likeRef, { userId, productId, createdAt: Timestamp.now() });
    tx.update(productRef, { "engagement.likeCount": FieldValue.increment(1), updatedAt: Timestamp.now() });
    return { liked: true };
  });
}

export async function submitRating(userId: string, productId: string, stars: number, text: string) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new ApiError(400, "VALIDATION_ERROR", "Rating must be 1-5");
  const orders = await db.collection("orders").where("userId", "==", userId).get();
  const purchased = orders.docs.some(o => o.data().items?.some((i: { productId?: string }) => i.productId === productId));
  if (!purchased) throw new ApiError(403, "PURCHASE_REQUIRED", "Only verified buyers can review this product");
  const ref = db.collection("ratings").doc(`${productId}_${userId}`);
  if ((await ref.get()).exists) throw new ApiError(409, "ALREADY_REVIEWED", "You have already reviewed this product");
  await ref.set({ productId, userId, stars, text: text.trim(), isVerifiedPurchase: true, isPublished: true, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  return { id: ref.id };
}

export async function addComment(userId: string, productId: string, text: string, parentCommentId?: string) {
  if (!text.trim()) throw new ApiError(400, "VALIDATION_ERROR", "Comment text is required");
  let depth = 0;
  if (parentCommentId) {
    const parent = await db.collection("comments").doc(parentCommentId).get();
    if (!parent.exists || parent.data()?.productId !== productId || Number(parent.data()?.depth) !== 0) throw new ApiError(400, "INVALID_PARENT", "Replies may only target top-level comments");
    depth = 1;
  }
  const ref = db.collection("comments").doc();
  await ref.set({ productId, userId, text: text.trim(), parentCommentId: parentCommentId ?? null, depth, isPublished: true, isDeleted: false, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  return { id: ref.id };
}
