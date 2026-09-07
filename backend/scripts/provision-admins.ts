import "dotenv/config";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const;
for (const key of required) if (!process.env[key]) throw new Error(`${key} is required`);
const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID!, clientEmail: process.env.FIREBASE_CLIENT_EMAIL!, privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n") }) });
const auth = getAuth(app);

const identifiers = process.argv.slice(2);
if (identifiers.length === 0) throw new Error("Usage: tsx scripts/provision-admins.ts <uid-or-email> [uid-or-email] ...");

for (const identifier of identifiers) {
  const user = identifier.includes("@") ? await auth.getUserByEmail(identifier) : await auth.getUser(identifier);
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), role: "owner" });
  console.log(`Provisioned owner: ${user.email ?? user.uid}`);
}
