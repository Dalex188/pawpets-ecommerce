import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetProductsAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getProductsAdmin: mockGetProductsAdmin,
}));

vi.mock("@/components/admin/DeleteProductButton", () => ({
  DeleteProductButton: ({ productId, productName }: { productId: string; productName: string }) => (
    <button data-testid="delete-btn" data-product-id={productId}>
      Eliminar {productName}
    </button>
  ),
}));

// ── Import after mocks ────────────────────────

import AdminProductsPage from "@/app/admin/products/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockProducts = {
  products: [
    {
      id: "prod-1",
      name: "Dog Food Premium",
      slug: "dog-food-premium",
      price: 2500,
      stock: 10,
      images: ["https://example.com/img1.jpg"],
      category: { name: "Perros" },
    },
    {
      id: "prod-2",
      name: "Cat Food Deluxe",
      slug: "cat-food-deluxe",
      price: 1800,
      stock: 15,
      images: [],
      brand: "BestPet",
      isFeatured: false,
      categoryId: "cat-2",
      subcategoryId: null,
      createdAt: new Date("2026-06-02"),
      updatedAt: new Date("2026-06-02"),
      category: { name: "Gatos" },
    },
  ],
  total: 2,
  totalPages: 1,
  currentPage: 1,
};

const emptyResult = {
  products: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
};

// ── Tests ─────────────────────────────────────

describe("AdminProductsList", () => {
  it("renders table with product columns", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    expect(screen.getByText("Dog Food Premium")).toBeInTheDocument();
    expect(screen.getByText("Cat Food Deluxe")).toBeInTheDocument();
    expect(screen.getByText("Perros")).toBeInTheDocument();
    expect(screen.getByText("Gatos")).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("2.500"))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes("1.800"))).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("renders edit links for each product", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    const editLinks = screen.getAllByRole("link", { name: /editar/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute("href", "/admin/products/prod-1");
    expect(editLinks[1]).toHaveAttribute("href", "/admin/products/prod-2");
  });

  it("renders delete buttons for each product", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    const deleteButtons = screen.getAllByTestId("delete-btn");
    expect(deleteButtons).toHaveLength(2);
    expect(deleteButtons[0]).toHaveAttribute("data-product-id", "prod-1");
    expect(deleteButtons[1]).toHaveAttribute("data-product-id", "prod-2");
  });

  it("renders empty state when no products", async () => {
    mockGetProductsAdmin.mockResolvedValue(emptyResult);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument();
  });

  it("renders search input", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    const searchInput = screen.getByPlaceholderText(/buscar productos/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("renders 'Nuevo producto' button linking to create page", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    const element = await AdminProductsPage({ searchParams: {} });
    render(element);

    const newButton = screen.getByRole("link", { name: /nuevo producto/i });
    expect(newButton).toHaveAttribute("href", "/admin/products/new");
  });

  it("passes search query from searchParams to getProductsAdmin", async () => {
    mockGetProductsAdmin.mockResolvedValue(mockProducts);

    await AdminProductsPage({ searchParams: { search: "dog" } });

    expect(mockGetProductsAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ search: "dog" }),
    );
  });
});
