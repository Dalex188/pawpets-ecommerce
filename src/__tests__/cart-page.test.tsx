import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartPage from "@/app/cart/page";
import { useCartStore } from "@/store/cart-store";

const mockProduct1 = {
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

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe("empty state", () => {
    it("renders the empty cart message when there are no items", () => {
      render(<CartPage />);
      expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    it("renders a CTA link to /productos when cart is empty", () => {
      render(<CartPage />);
      const link = screen.getByRole("link", { name: /ver productos/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/productos");
    });
  });

  describe("with items", () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct2);
    });

    it("renders the cart title", () => {
      render(<CartPage />);
      expect(screen.getByText("Carrito de compras")).toBeInTheDocument();
    });

    it("renders each product name", () => {
      render(<CartPage />);
      expect(screen.getByText("Dog Food Premium")).toBeInTheDocument();
      expect(screen.getByText("Cat Toy Mouse")).toBeInTheDocument();
    });

    it("renders the correct item count in summary", () => {
      render(<CartPage />);
      expect(screen.getByText(/Productos \(2\)/)).toBeInTheDocument();
    });

    it("renders the total amount (in summary and total)", () => {
      render(<CartPage />);
      // US$ 1,500 + US$ 800 = US$ 2,300
      // Appears twice: in subtotal and in total
      const totals = screen.getAllByText(/2\.300,00/);
      expect(totals.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("checkout button", () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct1);
    });

    it("renders the checkout link pointing to /checkout", () => {
      render(<CartPage />);
      const checkoutLink = screen.getByRole("link", { name: /proceder al pago/i });
      expect(checkoutLink).toBeInTheDocument();
      expect(checkoutLink).toHaveAttribute("href", "/checkout");
    });

    it("renders the 'Seguir comprando' link", () => {
      render(<CartPage />);
      const link = screen.getByRole("link", { name: /seguir comprando/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/productos");
    });
  });

  describe("quantity controls", () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct1);
    });

    it("increases quantity when + button is clicked", async () => {
      const user = userEvent.setup();
      render(<CartPage />);

      const increaseBtn = screen.getByRole("button", { name: /aumentar cantidad/i });
      await user.click(increaseBtn);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(2);
    });

    it("decreases quantity when - button is clicked", async () => {
      useCartStore.getState().updateQuantity("prod-1", 3);
      const user = userEvent.setup();
      render(<CartPage />);

      const decreaseBtn = screen.getByRole("button", { name: /disminuir cantidad/i });
      await user.click(decreaseBtn);

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(2);
    });

    it("removes item when quantity reaches 0 via decrease", async () => {
      const user = userEvent.setup();
      render(<CartPage />);

      const decreaseBtn = screen.getByRole("button", { name: /disminuir cantidad/i });
      await user.click(decreaseBtn);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<CartPage />);

      const removeBtn = screen.getByRole("button", { name: /eliminar dog food premium/i });
      await user.click(removeBtn);

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });
});
