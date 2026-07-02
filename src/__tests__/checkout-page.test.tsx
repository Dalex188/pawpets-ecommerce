import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CheckoutPage from "@/app/checkout/page";
import { useCartStore } from "@/store/cart-store";

// Mock useRouter
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// Mock createOrder server action
vi.mock("@/lib/actions/checkout", () => ({
  createOrder: vi.fn(),
}));

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

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [] });
  });

  describe("empty cart", () => {
    it("redirects to /cart when cart is empty", async () => {
      render(<CheckoutPage />);

      // useEffect fires after render
      await vi.waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/cart");
      });
    });

    it("shows loading text while redirecting", () => {
      render(<CheckoutPage />);

      expect(
        screen.getByText("Redirigiendo al carrito..."),
      ).toBeInTheDocument();
    });
  });

  describe("with items", () => {
    beforeEach(() => {
      useCartStore.getState().addItem(mockProduct1);
      useCartStore.getState().addItem(mockProduct2);
    });

    it("renders the checkout title", () => {
      render(<CheckoutPage />);
      expect(screen.getByText("Checkout")).toBeInTheDocument();
    });

    it("renders product names in the order summary", () => {
      render(<CheckoutPage />);
      expect(screen.getByText("Dog Food Premium")).toBeInTheDocument();
      expect(screen.getByText("Cat Toy Mouse")).toBeInTheDocument();
    });

    it("renders the total amount (US$ 1,500 + US$ 800 = US$ 2,300)", () => {
      render(<CheckoutPage />);
      // formatPrice(2300) = "US$ 2.300,00"
      const totals = screen.getAllByText(/2\.300,00/);
      expect(totals.length).toBeGreaterThanOrEqual(1);
    });

    it("renders all 6 shipping form fields", () => {
      render(<CheckoutPage />);

      expect(
        screen.getByLabelText("Nombre completo"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
      expect(screen.getByLabelText("Provincia")).toBeInTheDocument();
      expect(screen.getByLabelText("Ciudad")).toBeInTheDocument();
      expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
      expect(screen.getByLabelText("Código postal")).toBeInTheDocument();
    });

    it("renders submit button with correct text", () => {
      render(<CheckoutPage />);
      expect(
        screen.getByRole("button", { name: /confirmar compra/i }),
      ).toBeInTheDocument();
    });

    it("renders a back-to-cart link", () => {
      render(<CheckoutPage />);
      const link = screen.getByRole("link", { name: /volver al carrito/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/cart");
    });
  });
});
