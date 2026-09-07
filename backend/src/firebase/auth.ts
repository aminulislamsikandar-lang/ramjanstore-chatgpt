import { adminAuth } from "../config/firebase.js";

export async function verifyIdToken(idToken: string) {
  return adminAuth.verifyIdToken(idToken, true);
}

export async function setUserRole(uid: string, role: "owner" | "staff" | "customer") {
  await adminAuth.setCustomUserClaims(uid, { role });
}
