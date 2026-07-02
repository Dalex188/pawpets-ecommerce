import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CartBadge } from "@/components/cart/CartBadge";
import { useCartStore } from "@/store/cart-store";

const mockProduct = {
  id: "prod-1",
  slug: "dog-food",
  name: "Dog Food Premium",
  price: 1500,
  image: "/img/dog-food.jpg",
};

describe("CartBadge", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders 0 when the cart is empty", () => {
    render(<CartBadge />);
    const badge = screen.getByTestId("cart-badge");
    expect(badge).toHaveTextContent("0");
  });

  it("renders the current item count from the store", () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem({ ...mockProduct, id: "prod-2" });
    useCartStore.getState().addItem({ ...mockProduct, id: "prod-3" });

    render(<CartBadge />);
    const badge = screen.getByTestId("cart-badge");
    expect(badge).toHaveTextContent("3");
  });

  it("updates the count when items are cleared", () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem({ ...mockProduct, id: "prod-2" });

    useCartStore.getState().clearCart();
    render(<CartBadge />);
    const badge = screen.getByTestId("cart-badge");
    expect(badge).toHaveTextContent("0");
  });
});
