import { randomBytes } from "node:crypto";

export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `RS-${date}-${suffix}`;
}
