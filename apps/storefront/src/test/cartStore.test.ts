import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "../lib/cartStore";

const item = { productId: "p1", name: "Rice", unitPrice: 50, quantity: 2 };

beforeEach(() => {
  localStorage.clear();
  useCartStore.getState().clear();
});

describe("useCartStore", () => {
  it("adds items and calculates the subtotal", () => {
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().subtotal()).toBe(100);
  });

  it("merges identical product variants", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem({ ...item, quantity: 3 });
    expect(useCartStore.getState().items[0]?.quantity).toBe(5);
  });

  it("keeps different variants separate", () => {
    useCartStore.getState().addItem({ ...item, variantId: "a" });
    useCartStore.getState().addItem({ ...item, variantId: "b" });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("removes an item when quantity is set to zero", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().setQuantity("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
