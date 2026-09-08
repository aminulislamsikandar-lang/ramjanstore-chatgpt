import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  setQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  subtotal: () => number;
}

const MAX_QTY = 100;
const key = (item: { productId: string; variantId?: string }) => `${item.productId}:${item.variantId ?? "default"}`;
const safeQty = (value: number) => Math.max(0, Math.min(MAX_QTY, Number.isFinite(value) ? Math.floor(value) : 0));
const safePrice = (value: number) => Number.isFinite(value) && value >= 0 ? value : 0;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (!item.productId) return state;
        const quantity = safeQty(item.quantity);
        if (!quantity) return state;
        const normalized = { ...item, unitPrice: safePrice(item.unitPrice), quantity };
        const itemKey = key(normalized);
        const index = state.items.findIndex((current) => key(current) === itemKey);
        if (index < 0) return { items: [...state.items, normalized] };
        const items = [...state.items];
        items[index] = { ...items[index], ...normalized, quantity: safeQty(items[index].quantity + quantity) };
        return { items };
      }),
      removeItem: (productId, variantId) => set((state) => ({ items: state.items.filter((item) => key(item) !== key({ productId, variantId })) })),
      setQuantity: (productId, quantity, variantId) => set((state) => {
        const next = safeQty(quantity);
        return { items: next > 0 ? state.items.map((item) => key(item) === key({ productId, variantId }) ? { ...item, quantity: next } : item) : state.items.filter((item) => key(item) !== key({ productId, variantId })) };
      }),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, item) => sum + safePrice(item.unitPrice) * safeQty(item.quantity), 0),
    }),
    { name: "ramjanstore-cart", storage: createJSONStorage(() => localStorage) },
  ),
);
