import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { useCartStore } from "@/store/cart-store";

const defaultProps = {
  productId: "prod-1",
  slug: "dog-food",
  name: "Dog Food Premium",
  price: 1500,
  image: "/img/dog-food.jpg",
  inStock: true,
};

describe("AddToCartButton", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("renders the add to cart button with correct text", () => {
    render(<AddToCartButton {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Agregar al carrito");
  });

  it("adds the product to the cart store on click", async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...defaultProps} />);

    await user.click(screen.getByRole("button"));

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "prod-1",
      name: "Dog Food Premium",
      quantity: 1,
    });
  });

  it("is disabled when inStock is false and shows 'Sin stock'", () => {
    render(<AddToCartButton {...defaultProps} inStock={false} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Sin stock");
  });

  it("does not add to cart when out of stock", async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...defaultProps} inStock={false} />);

    await user.click(screen.getByRole("button"));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("shows visual confirmation after adding (text changes briefly)", async () => {
    const user = userEvent.setup();
    render(<AddToCartButton {...defaultProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    // After clicking, the button text should briefly change to a confirmation
    expect(button).toHaveTextContent("✓ Agregado");
  });
});
