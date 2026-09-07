export const ORDER_FLOW = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type OrderStatus = (typeof ORDER_FLOW)[number];
export const TERMINAL_ORDER_STATUSES = ["DELIVERED", "CANCELLED", "REFUNDED", "RETURNED"] as const;
export type TerminalOrderStatus = (typeof TERMINAL_ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_FLOW as readonly string[]).includes(value);
}

export function isTerminalOrderStatus(value: string): value is TerminalOrderStatus {
  return (TERMINAL_ORDER_STATUSES as readonly string[]).includes(value);
}

export function isValidNextOrderStatus(current: string, next: string): boolean {
  if (!isOrderStatus(current) || !isOrderStatus(next)) return false;
  return ORDER_FLOW.indexOf(next) === ORDER_FLOW.indexOf(current) + 1;
}
