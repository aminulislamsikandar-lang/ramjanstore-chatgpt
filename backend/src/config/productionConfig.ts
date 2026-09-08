import type { z } from "zod";
import type { envSchema } from "./productionSchema.js";

export type ProductionConfig = z.infer<typeof envSchema>;

export function validateProductionConfig(values: ProductionConfig): void {
  if (values.NODE_ENV !== "production") return;

  for (const [name, value] of [["CLIENT_URL", values.CLIENT_URL], ["ADMIN_URL", values.ADMIN_URL]] as const) {
    const hostname = new URL(value).hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      throw new Error(`Production ${name} cannot use localhost/127.0.0.1.`);
    }
  }

  if (values.TRUST_PROXY !== "true") {
    throw new Error("Production configuration requires TRUST_PROXY=true.");
  }

  if (values.CLIENT_URLS) {
    for (const value of values.CLIENT_URLS.split(",").map((url) => url.trim()).filter(Boolean)) {
      const parsed = new URL(value);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        throw new Error("Production CLIENT_URLS cannot contain localhost/127.0.0.1.");
      }
    }
  }
}
