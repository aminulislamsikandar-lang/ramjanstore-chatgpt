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

const key = (item: { productId: string; variantId?: string }) =>
  `${item.productId}:${item.variantId ?? "default"}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const itemKey = key(item);
          const index = state.items.findIndex((current) => key(current) === itemKey);
          if (index < 0) return { items: [...state.items, item] };
          const items = [...state.items];
          items[index] = { ...items[index], quantity: items[index].quantity + item.quantity };
          return { items };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((item) => key(item) !== key({ productId, variantId })),
        })),
      setQuantity: (productId, quantity, variantId) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((item) =>
                  key(item) === key({ productId, variantId }) ? { ...item, quantity } : item,
                )
              : state.items.filter((item) => key(item) !== key({ productId, variantId })),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    }),
    {
      name: "ramjanstore-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
