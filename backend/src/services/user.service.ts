import { adminAuth, db } from "../config/firebase.js";
import type { AddressInput } from "../schemas/auth.schema.js";
import { FieldValue, Timestamp } from "../firebase/firestore.js";

const users = db.collection("users");
const addresses = db.collection("addresses");

export async function syncUserProfile(uid: string, input: { displayName?: string; photoURL?: string | null }) {
  const authUser = await adminAuth.getUser(uid);
  const ref = users.doc(uid);
  const snap = await ref.get();
  const now = Timestamp.now();
  const existing = snap.exists ? snap.data() : undefined;
  const data = {
    phoneNumber: authUser.phoneNumber ?? null,
    email: authUser.email ?? null,
    displayName: input.displayName ?? authUser.displayName ?? existing?.displayName ?? "Customer",
    photoURL: input.photoURL !== undefined ? input.photoURL : (authUser.photoURL ?? existing?.photoURL ?? null),
    role: existing?.role ?? "customer",
    isActive: existing?.isActive ?? true,
    isBlocked: existing?.isBlocked ?? false,
    stats: existing?.stats ?? { totalOrders: 0, totalSpent: 0 },
    updatedAt: now,
    ...(snap.exists ? {} : { createdAt: now }),
  };
  await ref.set(data, { merge: true });
  return { id: uid, ...data };
}

export async function getUserProfile(uid: string) {
  const snap = await users.doc(uid).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

export async function listAddresses(uid: string) {
  const snap = await addresses.where("userId", "==", uid).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createAddress(uid: string, input: AddressInput) {
  const ref = addresses.doc();
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    if (input.isDefault) {
      const existing = await addresses.where("userId", "==", uid).where("isDefault", "==", true).get();
      existing.docs.forEach((doc) => tx.update(doc.ref, { isDefault: false, updatedAt: now }));
    }
    tx.set(ref, { ...input, userId: uid, createdAt: now, updatedAt: now });
  });
  return { id: ref.id, ...input, userId: uid, createdAt: now, updatedAt: now };
}

export async function updateAddress(uid: string, addressId: string, input: Partial<AddressInput>) {
  const ref = addresses.doc(addressId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.userId !== uid) return null;
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    if (input.isDefault) {
      const existing = await addresses.where("userId", "==", uid).where("isDefault", "==", true).get();
      existing.docs.filter((doc) => doc.id !== addressId).forEach((doc) => tx.update(doc.ref, { isDefault: false, updatedAt: now }));
    }
    tx.update(ref, { ...input, updatedAt: now });
  });
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

export async function deleteAddress(uid: string, addressId: string) {
  const ref = addresses.doc(addressId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.userId !== uid) return false;
  await ref.delete();
  return true;
}
