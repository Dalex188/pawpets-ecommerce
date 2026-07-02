import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockGetProductById = vi.hoisted(() => vi.fn());
const mockGetCategoriesForSelect = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getProductById: mockGetProductById,
  getCategoriesForSelect: mockGetCategoriesForSelect,
}));

const mockNotFound = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/admin-products", () => ({
  updateProduct: vi.fn(),
}));

// ── Import after mocks ────────────────────────

import EditProductPage from "@/app/admin/products/[id]/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockProduct = {
  id: "prod-1",
  name: "Dog Food Premium",
  slug: "dog-food-premium",
  description: "Premium dog food for adult dogs",
  price: 2500,
  stock: 10,
  images: JSON.stringify(["https://example.com/img1.jpg"]),
  brand: "Acme",
  isFeatured: true,
  categoryId: "cat-1",
  subcategoryId: "sub-1",
  category: { name: "Perros" },
  subcategory: { name: "Alimento" },
  weight: "1kg",
  ageGroup: "adult",
  size: null,
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

const mockCategories = [
  { id: "cat-1", name: "Perros" },
  { id: "cat-2", name: "Gatos" },
];

// ── Tests ─────────────────────────────────────

describe("EditProductPage", () => {
  it("renders form pre-filled with product data", async () => {
    mockGetProductById.mockResolvedValue(mockProduct);
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await EditProductPage({ params: { id: "prod-1" } });
    render(element);

    expect(screen.getByText("Editar Producto")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dog Food Premium")).toBeInTheDocument();
    expect(screen.getByDisplayValue("dog-food-premium")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Premium dog food for adult dogs")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
  });

  it("calls notFound when product does not exist", async () => {
    mockGetProductById.mockResolvedValue(null);

    mockNotFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      EditProductPage({ params: { id: "invalid-id" } }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("renders submit button with update label", async () => {
    mockGetProductById.mockResolvedValue(mockProduct);
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await EditProductPage({ params: { id: "prod-1" } });
    render(element);

    const submitButton = screen.getByRole("button", { name: /actualizar/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("renders category options", async () => {
    mockGetProductById.mockResolvedValue(mockProduct);
    mockGetCategoriesForSelect.mockResolvedValue(mockCategories);

    const element = await EditProductPage({ params: { id: "prod-1" } });
    render(element);

    expect(screen.getByText("Perros")).toBeInTheDocument();
    expect(screen.getByText("Gatos")).toBeInTheDocument();
  });
});
