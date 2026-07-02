import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useCartStore } from "@/store/cart-store";

const mockProduct = {
  id: "prod-1",
  slug: "dog-food",
  name: "Dog Food Premium",
  price: 1500,
  image: "/img/dog-food.jpg",
};

const mockProduct2 = {
  id: "prod-2",
  slug: "cat-toy",
  name: "Cat Toy Mouse",
  price: 800,
  image: "/img/cat-toy.jpg",
};

describe("CartStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("adds a product to an empty cart with quantity 1", () => {
      useCartStore.getState().addItem(mockProduct);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        id: "prod-1",
        name: "Dog Food Premium",
        quantity: 1,
      });
    });

    it("increments quantity when adding an existing product", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("adds a different product as a separate item", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes an item by product id", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);
      useCartStore.getState().removeItem("prod-1");

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("prod-2");
    });

    it("does nothing when removing a non-existent id", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().removeItem("non-existent");

      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates the quantity of an existing item", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().updateQuantity("prod-1", 5);

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes the item when quantity is 0", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().updateQuantity("prod-1", 0);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes the item when quantity is negative", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().updateQuantity("prod-1", -1);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("caps quantity at 99", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().updateQuantity("prod-1", 100);

      expect(useCartStore.getState().items[0].quantity).toBe(99);
    });

    it("does nothing when updating a non-existent id", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().updateQuantity("non-existent", 5);

      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);
      useCartStore.getState().clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("totalItems", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().totalItems()).toBe(0);
    });

    it("returns the sum of all item quantities", () => {
      useCartStore.getState().addItem({ ...mockProduct });
      useCartStore.getState().addItem({ ...mockProduct });
      useCartStore.getState().addItem({ ...mockProduct2 });
      useCartStore.getState().addItem({ ...mockProduct2 });
      useCartStore.getState().addItem({ ...mockProduct2 });

      expect(useCartStore.getState().totalItems()).toBe(5);
    });
  });

  describe("persist (localStorage)", () => {
    afterEach(() => {
      localStorage.clear();
    });

    it("persists items to localStorage on mutation", () => {
      useCartStore.getState().addItem(mockProduct);

      const stored = localStorage.getItem("pawpets-cart");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.items).toHaveLength(1);
      expect(parsed.state.items[0].id).toBe("prod-1");
    });

    it("roundtrips items correctly through localStorage persist", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem(mockProduct2);

      const stored = localStorage.getItem("pawpets-cart");
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.state.items).toHaveLength(2);

      // Verify partialize excludes computed properties
      expect(parsed.state.totalItems).toBeUndefined();
      expect(parsed.state.subtotal).toBeUndefined();

      // Verify stored data can reconstruct valid items
      expect(parsed.state.items[0].id).toBe("prod-1");
      expect(parsed.state.items[1].id).toBe("prod-2");
    });

    it("falls back to empty cart when localStorage is unavailable", async () => {
      // Mock localStorage.getItem to throw (simulates private browsing or quota exceeded)
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      useCartStore.setState({ items: [] });
      await useCartStore.persist.rehydrate();

      expect(useCartStore.getState().items).toHaveLength(0);

      getItemSpy.mockRestore();
    });

    it("only persists items (partialize), not computed values", () => {
      useCartStore.getState().addItem(mockProduct);
      useCartStore.getState().addItem({ ...mockProduct, id: "prod-2" });

      const stored = localStorage.getItem("pawpets-cart");
      const parsed = JSON.parse(stored!);

      // totalItems and subtotal are computed, not stored
      expect(parsed.state.items).toHaveLength(2);
      expect(parsed.state.totalItems).toBeUndefined();
      expect(parsed.state.subtotal).toBeUndefined();
    });
  });

  describe("subtotal", () => {
    it("returns 0 for an empty cart", () => {
      expect(useCartStore.getState().subtotal()).toBe(0);
    });

    it("returns the sum of price * quantity for all items", () => {
      useCartStore.getState().addItem(mockProduct); // 1500 * 1
      useCartStore.getState().addItem(mockProduct); // 1500 * 2 total
      useCartStore.getState().addItem(mockProduct2); // 800 * 1

      // Item 1: 1500 * 2 = 3000
      // Item 2: 800 * 1 = 800
      expect(useCartStore.getState().subtotal()).toBe(3800);
    });
  });
});
