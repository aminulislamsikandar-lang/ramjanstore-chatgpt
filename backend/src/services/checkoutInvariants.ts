export interface InventoryItem { id: string; stockQuantity: number }

export function canReserveStock(stockQuantity: number, quantity: number): boolean {
  return Number.isInteger(stockQuantity) && stockQuantity >= 0 && Number.isInteger(quantity) && quantity > 0 && stockQuantity >= quantity;
}

export function reserveStock(stockQuantity: number, quantity: number): number {
  if (!canReserveStock(stockQuantity, quantity)) throw new Error("INSUFFICIENT_STOCK");
  return stockQuantity - quantity;
}

export function restoreStock(stockQuantity: number, quantity: number): number {
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0 || !Number.isInteger(quantity) || quantity <= 0) throw new Error("INVALID_STOCK_OPERATION");
  return stockQuantity + quantity;
}

export function isValidIdempotencyKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{16,100}$/.test(key);
}
