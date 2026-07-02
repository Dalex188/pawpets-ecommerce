import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────

const mockDb = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
  },
}));
vi.mock("@/lib/db", () => ({ db: mockDb }));

// ── Import after mocks ────────────────────────

import { getFeaturedProducts } from "@/lib/products";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ───────────────────────────────────

function buildMockProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-1",
    name: "Producto",
    slug: "producto",
    description: "Descripción",
    price: 25.99,
    stock: 10,
    images: JSON.stringify([
      "https://picsum.photos/seed/producto/400/400",
    ]),
    weight: null,
    ageGroup: null,
    size: null,
    brand: "Marca",
    isFeatured: true,
    categoryId: "cat-1",
    subcategoryId: "sub-1",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    category: { name: "Perros", slug: "perros" },
    subcategory: { name: "Alimentos", slug: "alimentos" },
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────

describe("getFeaturedProducts", () => {
  it("returns featured products ordered by newest first", async () => {
    const products = [
      buildMockProduct({ id: "p1", slug: "feat-1", createdAt: new Date("2024-06-02") }),
      buildMockProduct({ id: "p2", slug: "feat-2", createdAt: new Date("2024-06-01") }),
    ];
    mockDb.product.findMany.mockResolvedValue(products);

    const result = await getFeaturedProducts(6);

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    );
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("feat-1");
    expect(result[1].slug).toBe("feat-2");
  });

  it("falls back to newest products when no featured exist", async () => {
    // First call (featured) returns empty
    mockDb.product.findMany
      .mockResolvedValueOnce([])
      // Second call (fallback) returns newest
      .mockResolvedValueOnce([
        buildMockProduct({ id: "p3", slug: "new-1", isFeatured: false }),
        buildMockProduct({ id: "p4", slug: "new-2", isFeatured: false }),
      ]);

    const result = await getFeaturedProducts(6);

    // Should have called findMany twice
    expect(mockDb.product.findMany).toHaveBeenCalledTimes(2);
    expect(mockDb.product.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { isFeatured: true } }),
    );
    expect(mockDb.product.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ orderBy: { createdAt: "desc" }, take: 6 }),
    );
    expect(result).toHaveLength(2);
  });

  it("respects the limit parameter", async () => {
    const products = Array.from({ length: 12 }, (_, i) =>
      buildMockProduct({ id: `p${i}`, slug: `feat-${i}`, isFeatured: true }),
    );
    mockDb.product.findMany.mockResolvedValue(products.slice(0, 4));

    const result = await getFeaturedProducts(4);

    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 4 }),
    );
    expect(result).toHaveLength(4);
  });

  it("converts price from Decimal to number", async () => {
    mockDb.product.findMany.mockResolvedValue([
      buildMockProduct({ price: 45.99 }),
    ]);

    const result = await getFeaturedProducts(1);

    expect(result[0].price).toBe(45.99);
    expect(typeof result[0].price).toBe("number");
  });

  it("returns empty array when db is empty", async () => {
    mockDb.product.findMany.mockResolvedValue([]);

    const result = await getFeaturedProducts(6);

    expect(result).toHaveLength(0);
  });
});
