import "dotenv/config";
import { z } from "zod";

const secret = (name: string) => z.string().min(1, `${name} is required`).refine(value => !/[\r\n]/.test(value), `${name} must not contain newlines`);
const envSchema = z.object({
 NODE_ENV:z.enum(["development","test","production"]).default("development"), HOST:z.string().default("0.0.0.0"), PORT:z.coerce.number().int().min(1).max(65535).default(5000),
 CLIENT_URL:z.string().url().default("http://localhost:5173"), ADMIN_URL:z.string().url().default("http://localhost:5174"), CLIENT_URLS:z.string().optional(), TRUST_PROXY:z.enum(["true","false"]).default("false"),
 FIREBASE_PROJECT_ID:secret("FIREBASE_PROJECT_ID"), FIREBASE_CLIENT_EMAIL:z.string().email(), FIREBASE_PRIVATE_KEY:secret("FIREBASE_PRIVATE_KEY"), CLOUDINARY_CLOUD_NAME:secret("CLOUDINARY_CLOUD_NAME"), CLOUDINARY_API_KEY:secret("CLOUDINARY_API_KEY"), CLOUDINARY_API_SECRET:secret("CLOUDINARY_API_SECRET"), DEFAULT_CURRENCY:z.literal("INR").default("INR"), RETURN_WINDOW_DAYS:z.coerce.number().int().positive().default(7)
});
const parsed=envSchema.safeParse(process.env);
if(!parsed.success){const issues=parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).join("; ");throw new Error(`Invalid environment configuration: ${issues}`);}
export const env=parsed.data;
