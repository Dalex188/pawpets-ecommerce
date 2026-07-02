import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────

const mockProductFindMany = vi.hoisted(() => vi.fn());
const mockProductFindUnique = vi.hoisted(() => vi.fn());
const mockProductCount = vi.hoisted(() => vi.fn());
const mockCategoryFindMany = vi.hoisted(() => vi.fn());
const mockSubcategoryFindMany = vi.hoisted(() => vi.fn());
const mockOrderFindMany = vi.hoisted(() => vi.fn());
const mockOrderFindUnique = vi.hoisted(() => vi.fn());
const mockOrderCount = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  db: {
    product: {
      findMany: mockProductFindMany,
      findUnique: mockProductFindUnique,
      count: mockProductCount,
    },
    category: {
      findMany: mockCategoryFindMany,
    },
    subcategory: {
      findMany: mockSubcategoryFindMany,
    },
    order: {
      findMany: mockOrderFindMany,
      findUnique: mockOrderFindUnique,
      count: mockOrderCount,
    },
  },
}));

// ── Import after mocks ────────────────────────

import {
  getProductsAdmin,
  getProductById,
  getCategoriesForSelect,
  getSubcategoriesForSelect,
  getAllOrders,
  getOrderDetailAdmin,
} from "@/lib/admin";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock data ─────────────────────────────────

const mockProducts = [
  {
    id: "prod-1",
    name: "Dog Food Premium",
    slug: "dog-food-premium",
    description: "Premium dog food",
    price: 2500,
    stock: 10,
    images: JSON.stringify(["https://example.com/img1.jpg"]),
    weight: "1kg",
    ageGroup: "adult",
    size: null,
    brand: "Acme",
    isFeatured: true,
    categoryId: "cat-1",
    subcategoryId: "sub-1",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    category: { name: "Perros", slug: "perros" },
    subcategory: { name: "Alimento", slug: "alimento" },
  },
  {
    id: "prod-2",
    name: "Cat Food Deluxe",
    slug: "cat-food-deluxe",
    description: "Deluxe cat food",
    price: 1800,
    stock: 15,
    images: JSON.stringify([]),
    weight: "500g",
    ageGroup: "adult",
    size: null,
    brand: "BestPet",
    isFeatured: false,
    categoryId: "cat-2",
    subcategoryId: null,
    createdAt: new Date("2026-06-02"),
    updatedAt: new Date("2026-06-02"),
    category: { name: "Gatos", slug: "gatos" },
    subcategory: null,
  },
];

const mockOrders = [
  {
    id: "ord-1",
    orderNumber: 1001,
    status: "PENDING",
    total: 5000,
    createdAt: new Date("2026-06-23"),
    items: [{ quantity: 2 }, { quantity: 1 }],
    user: { name: "Juan Pérez", email: "juan@example.com" },
  },
  {
    id: "ord-2",
    orderNumber: 1002,
    status: "CONFIRMED",
    total: 3000,
    createdAt: new Date("2026-06-22"),
    items: [{ quantity: 1 }],
    user: { name: "María García", email: "maria@example.com" },
  },
];

// ── Tests: getProductsAdmin ───────────────────

describe("getProductsAdmin", () => {
  it("returns paginated products with category/subcategory names", async () => {
    mockProductFindMany.mockResolvedValue(mockProducts);
    mockProductCount.mockResolvedValue(2);

    const result = await getProductsAdmin({ page: 1, limit: 15 });

    expect(result.products).toHaveLength(2);
    expect(result.products[0].name).toBe("Dog Food Premium");
    expect(result.products[0].category?.name).toBe("Perros");
    expect(result.products[0].subcategory?.name).toBe("Alimento");
    expect(result.products[1].name).toBe("Cat Food Deluxe");
    expect(result.products[1].category?.name).toBe("Gatos");
    expect(result.total).toBe(2);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("filters products by search query", async () => {
    mockProductFindMany.mockResolvedValue([mockProducts[0]]);
    mockProductCount.mockResolvedValue(1);

    const result = await getProductsAdmin({ search: "Dog Food", page: 1 });

    expect(result.products).toHaveLength(1);
    expect(result.products[0].slug).toBe("dog-food-premium");
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: "Dog Food" } }),
          ]),
        }),
      }),
    );
  });

  it("handles empty search results", async () => {
    mockProductFindMany.mockResolvedValue([]);
    mockProductCount.mockResolvedValue(0);

    const result = await getProductsAdmin({ search: "NonExistentProduct", page: 1 });

    expect(result.products).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("respects pagination parameters", async () => {
    mockProductFindMany.mockResolvedValue([mockProducts[0]]);
    mockProductCount.mockResolvedValue(2);

    const result = await getProductsAdmin({ page: 2, limit: 1 });

    expect(result.products).toHaveLength(1);
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 1, take: 1 }),
    );
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(2);
  });
});

// ── Tests: getProductById ─────────────────────

describe("getProductById", () => {
  it("returns the product with full relations", async () => {
    mockProductFindUnique.mockResolvedValue(mockProducts[0]);

    const result = await getProductById("prod-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("prod-1");
    expect(result!.name).toBe("Dog Food Premium");
    expect(result!.category?.name).toBe("Perros");
    expect(result!.subcategory?.name).toBe("Alimento");
  });

  it("returns null when product does not exist", async () => {
    mockProductFindUnique.mockResolvedValue(null);

    const result = await getProductById("non-existent-id");

    expect(result).toBeNull();
  });
});

// ── Tests: getCategoriesForSelect ─────────────

describe("getCategoriesForSelect", () => {
  it("returns categories with id and name", async () => {
    mockCategoryFindMany.mockResolvedValue([
      { id: "cat-1", name: "Perros" },
      { id: "cat-2", name: "Gatos" },
      { id: "cat-3", name: "Aves" },
    ]);

    const result = await getCategoriesForSelect();

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: "cat-1", name: "Perros" });
    expect(result[1]).toEqual({ id: "cat-2", name: "Gatos" });
    expect(result[2]).toEqual({ id: "cat-3", name: "Aves" });
  });

  it("returns empty array when no categories exist", async () => {
    mockCategoryFindMany.mockResolvedValue([]);

    const result = await getCategoriesForSelect();

    expect(result).toEqual([]);
  });
});

// ── Tests: getSubcategoriesForSelect ──────────

describe("getSubcategoriesForSelect", () => {
  it("returns subcategories filtered by categoryId", async () => {
    mockSubcategoryFindMany.mockResolvedValue([
      { id: "sub-1", name: "Alimento" },
      { id: "sub-2", name: "Juguetes" },
    ]);

    const result = await getSubcategoriesForSelect("cat-1");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alimento");
    expect(mockSubcategoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { categoryId: "cat-1" },
      }),
    );
  });

  it("returns empty array for category with no subcategories", async () => {
    mockSubcategoryFindMany.mockResolvedValue([]);

    const result = await getSubcategoriesForSelect("cat-empty");

    expect(result).toEqual([]);
  });
});

// ── Tests: getAllOrders ───────────────────────

describe("getAllOrders", () => {
  it("returns paginated orders with user relation", async () => {
    mockOrderFindMany.mockResolvedValue(mockOrders);
    mockOrderCount.mockResolvedValue(2);

    const result = await getAllOrders({ page: 1 });

    expect(result.orders).toHaveLength(2);
    expect(result.orders[0].orderNumber).toBe(1001);
    expect(result.orders[0].user?.name).toBe("Juan Pérez");
    expect(result.orders[0].user?.email).toBe("juan@example.com");
    expect(result.orders[0].itemCount).toBe(3);
    expect(result.orders[1].orderNumber).toBe(1002);
    expect(result.total).toBe(2);
  });

  it("filters orders by status", async () => {
    mockOrderFindMany.mockResolvedValue([mockOrders[0]]);
    mockOrderCount.mockResolvedValue(1);

    const result = await getAllOrders({ status: "PENDING" });

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].status).toBe("PENDING");
    expect(mockOrderFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PENDING" },
      }),
    );
  });

  it("returns empty list when no orders match status filter", async () => {
    mockOrderFindMany.mockResolvedValue([]);
    mockOrderCount.mockResolvedValue(0);

    const result = await getAllOrders({ status: "CANCELLED" });

    expect(result.orders).toEqual([]);
    expect(result.total).toBe(0);
  });
});

// ── Tests: getOrderDetailAdmin ────────────────

describe("getOrderDetailAdmin", () => {
  it("returns full order detail with items and user", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "ord-1",
      orderNumber: 1001,
      status: "PENDING",
      total: 5000,
      createdAt: new Date("2026-06-23"),
      shippingName: "Juan Pérez",
      shippingPhone: "11 1234-5678",
      shippingProvince: "Buenos Aires",
      shippingCity: "La Plata",
      shippingStreet: "Calle 123",
      shippingZip: "1900",
      items: [
        {
          id: "item-1",
          quantity: 2,
          price: 2500,
          product: { name: "Dog Food Premium" },
        },
      ],
      user: { name: "Juan Pérez", email: "juan@example.com" },
    });

    const result = await getOrderDetailAdmin("ord-1");

    expect(result).not.toBeNull();
    expect(result!.orderNumber).toBe(1001);
    expect(result!.status).toBe("PENDING");
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].name).toBe("Dog Food Premium");
    expect(result!.items[0].lineTotal).toBe(5000);
    expect(result!.user?.name).toBe("Juan Pérez");
    expect(result!.shippingName).toBe("Juan Pérez");
  });

  it("returns null when order does not exist", async () => {
    mockOrderFindUnique.mockResolvedValue(null);

    const result = await getOrderDetailAdmin("non-existent");

    expect(result).toBeNull();
  });
});
