import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockRedirect = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

const mockGetProductsAdmin = vi.hoisted(() => vi.fn());
const mockGetProductById = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin", () => ({
  getProductsAdmin: mockGetProductsAdmin,
  getProductById: mockGetProductById,
}));

const mockProductFindUnique = vi.hoisted(() => vi.fn());
const mockProductCreate = vi.hoisted(() => vi.fn());
const mockProductUpdate = vi.hoisted(() => vi.fn());
const mockProductDelete = vi.hoisted(() => vi.fn());
const mockOrderItemCount = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findUnique: mockProductFindUnique,
      create: mockProductCreate,
      update: mockProductUpdate,
      delete: mockProductDelete,
    },
    orderItem: {
      count: mockOrderItemCount,
    },
  },
}));

vi.mock("@/components/admin/DeleteProductButton", () => ({
  DeleteProductButton: ({ productId, productName }: { productId: string; productName: string }) => (
    <button data-testid="delete-btn" data-product-id={productId}>
      Eliminar {productName}
    </button>
  ),
}));

// ── Import after mocks ────────────────────────

import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/admin-products";
import AdminProductsList from "@/app/admin/products/page";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ────────────────────────────────────

function mockAdmin() {
  mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN", name: "Admin" } });
}

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    name: "Premium Dog Food",
    slug: "premium-dog-food",
    description: "High quality dog food",
    price: "25.99",
    stock: "50",
    images: '["https://example.com/img.jpg"]',
    brand: "Acme",
    isFeatured: "on",
    categoryId: "cat-1",
    subcategoryId: "sub-1",
    weight: "1kg",
    ageGroup: "adult",
    size: "",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.append(key, value);
  }
  return fd;
}

// ── Tests ─────────────────────────────────────

describe("Admin product CRUD integration", () => {
  it("creates product → appears in list", async () => {
    mockAdmin();
    mockProductFindUnique.mockResolvedValue(null); // slug unique check
    mockProductCreate.mockResolvedValue({
      id: "prod-new-1",
      name: "Premium Dog Food",
      slug: "premium-dog-food",
      description: "High quality dog food",
      price: "25.99",
      stock: 50,
      images: '["https://example.com/img.jpg"]',
      brand: "Acme",
      isFeatured: true,
      categoryId: "cat-1",
      subcategoryId: "sub-1",
      weight: "1kg",
      ageGroup: "adult",
      size: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 1: Create product
    const createResult = await createProduct(makeFormData());
    expect(createResult.success).toBe(true);
    expect(mockProductCreate).toHaveBeenCalledOnce();

    // Step 2: Mock list to include the new product
    mockGetProductsAdmin.mockResolvedValue({
      products: [
        {
          id: "prod-new-1",
          name: "Premium Dog Food",
          slug: "premium-dog-food",
          price: 25.99,
          stock: 50,
          images: ["https://example.com/img.jpg"],
          category: { name: "Perros", slug: "perros" },
          subcategory: { name: "Adulto", slug: "adulto" },
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });

    // Step 3: Render list and verify product appears
    const element = await AdminProductsList({ searchParams: {} });
    render(element);

    expect(screen.getByText("Premium Dog Food")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("creates → edit → updates and reflects changes in list", async () => {
    mockAdmin();
    mockProductFindUnique
      .mockResolvedValueOnce({ id: "prod-1", slug: "premium-dog-food" }) // current product found
      .mockResolvedValueOnce(null); // slug check passes
    mockProductUpdate.mockResolvedValue({
      id: "prod-1",
      name: "Premium Dog Food Updated",
      slug: "premium-dog-food-updated",
      description: "Updated description",
      price: "29.99",
      stock: 40,
      images: '["https://example.com/new-img.jpg"]',
      brand: "Acme",
      isFeatured: true,
      categoryId: "cat-1",
      subcategoryId: "sub-1",
      weight: "1kg",
      ageGroup: "adult",
      size: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 1: Update product
    const updateResult = await updateProduct(
      "prod-1",
      makeFormData({
        name: "Premium Dog Food Updated",
        slug: "premium-dog-food-updated",
        price: "29.99",
        stock: "40",
        images: '["https://example.com/new-img.jpg"]',
      }),
    );
    expect(updateResult.success).toBe(true);
    expect(mockProductUpdate).toHaveBeenCalledOnce();

    // Step 2: Mock list to reflect updated product
    mockGetProductsAdmin.mockResolvedValue({
      products: [
        {
          id: "prod-1",
          name: "Premium Dog Food Updated",
          slug: "premium-dog-food-updated",
          price: 29.99,
          stock: 40,
          images: ["https://example.com/new-img.jpg"],
          category: { name: "Perros", slug: "perros" },
          subcategory: { name: "Adulto", slug: "adulto" },
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });

    // Step 3: Render list and verify updated content
    const element = await AdminProductsList({ searchParams: {} });
    render(element);

    expect(screen.getByText("Premium Dog Food Updated")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("deletes product without orderItems → removed from list", async () => {
    mockAdmin();
    mockOrderItemCount.mockResolvedValue(0);
    mockProductDelete.mockResolvedValue({ id: "prod-1" });

    // Step 1: List shows product before delete
    mockGetProductsAdmin.mockResolvedValue({
      products: [
        {
          id: "prod-1",
          name: "Premium Dog Food",
          slug: "premium-dog-food",
          price: 25.99,
          stock: 50,
          images: [],
          category: { name: "Perros", slug: "perros" },
          subcategory: null,
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });

    let element = await AdminProductsList({ searchParams: {} });
    render(element);
    expect(screen.getByText("Premium Dog Food")).toBeInTheDocument();

    // Step 2: Delete product
    const deleteResult = await deleteProduct("prod-1");
    expect(deleteResult.success).toBe(true);
    expect(mockProductDelete).toHaveBeenCalledOnce();

    // Step 3: List no longer shows the product
    cleanup();

    mockGetProductsAdmin.mockResolvedValue({
      products: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    });

    const elementAfter = await AdminProductsList({ searchParams: {} });
    render(elementAfter);

    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument();
    expect(screen.queryByText("Premium Dog Food")).not.toBeInTheDocument();
  });

  it("rejects delete when product has orderItems", async () => {
    mockAdmin();
    mockOrderItemCount.mockResolvedValue(3);

    // List still shows product
    mockGetProductsAdmin.mockResolvedValue({
      products: [
        {
          id: "prod-1",
          name: "Premium Dog Food",
          slug: "premium-dog-food",
          price: 25.99,
          stock: 50,
          images: [],
          category: { name: "Perros", slug: "perros" },
          subcategory: null,
        },
      ],
      total: 1,
      totalPages: 1,
      currentPage: 1,
    });

    // Attempt delete — should be rejected
    const deleteResult = await deleteProduct("prod-1");
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain("ordered");
    expect(mockProductDelete).not.toHaveBeenCalled();

    // Verify product still in list
    const element = await AdminProductsList({ searchParams: {} });
    render(element);
    expect(screen.getByText("Premium Dog Food")).toBeInTheDocument();
  });
});
