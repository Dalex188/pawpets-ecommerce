import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetFeaturedProducts = vi.hoisted(() => vi.fn());
vi.mock("@/lib/products", () => ({
  getFeaturedProducts: mockGetFeaturedProducts,
}));

// ── Import after mocks ────────────────────────

import { FeaturedProducts } from "@/components/home/FeaturedProducts";

beforeEach(() => {
  vi.clearAllMocks();
});

function buildProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-1",
    name: "Producto Ejemplo",
    slug: "producto-ejemplo",
    price: 25.99,
    images: JSON.stringify(["https://picsum.photos/seed/prod/400/400"]),
    brand: "Marca",
    stock: 10,
    category: { name: "Perros", slug: "perros" },
    subcategory: null,
    ...overrides,
  };
}

describe("FeaturedProducts", () => {
  it("renders the section title when products exist", async () => {
    mockGetFeaturedProducts.mockResolvedValue([buildProduct()]);

    render(await FeaturedProducts());

    expect(screen.getByText("Productos Destacados")).toBeInTheDocument();
  });

  it("renders product cards via ProductGrid", async () => {
    mockGetFeaturedProducts.mockResolvedValue([
      buildProduct({ id: "p1", name: "Producto 1" }),
      buildProduct({ id: "p2", name: "Producto 2" }),
    ]);

    render(await FeaturedProducts());

    expect(screen.getByText("Producto 1")).toBeInTheDocument();
    expect(screen.getByText("Producto 2")).toBeInTheDocument();
  });

  it("returns null when no products exist (empty state)", async () => {
    mockGetFeaturedProducts.mockResolvedValue([]);

    const result = await FeaturedProducts();

    expect(result).toBeNull();
  });

  it("calls getFeaturedProducts with limit 6", async () => {
    mockGetFeaturedProducts.mockResolvedValue([buildProduct()]);

    await FeaturedProducts();

    expect(mockGetFeaturedProducts).toHaveBeenCalledWith(6);
  });

  it("renders a link to /productos below the grid", async () => {
    mockGetFeaturedProducts.mockResolvedValue([buildProduct()]);

    render(await FeaturedProducts());

    const link = screen.getByRole("link", { name: /ver todos los productos/i });
    expect(link).toHaveAttribute("href", "/productos");
  });
});
