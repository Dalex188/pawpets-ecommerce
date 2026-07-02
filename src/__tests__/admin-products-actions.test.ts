import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockRedirect = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
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

// ── Import after mocks ────────────────────────

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/admin-products";

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ────────────────────────────────────

function mockAdmin() {
  mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
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

// ── Tests: createProduct ───────────────────────

describe("createProduct", () => {
  it("creates a product with valid data", async () => {
    mockAdmin();
    mockProductFindUnique.mockResolvedValue(null); // slug is unique
    mockProductCreate.mockResolvedValue({
      id: "prod-1",
      name: "Premium Dog Food",
      slug: "premium-dog-food",
    });

    const result = await createProduct(makeFormData());

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockProductCreate).toHaveBeenCalledOnce();
  });

  it("returns validation error when name is missing", async () => {
    mockAdmin();

    const result = await createProduct(makeFormData({ name: "" }));

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockProductCreate).not.toHaveBeenCalled();
  });

  it("returns validation error when slug is missing", async () => {
    mockAdmin();

    const result = await createProduct(makeFormData({ slug: "" }));

    expect(result.success).toBe(false);
    expect(mockProductCreate).not.toHaveBeenCalled();
  });

  it("returns validation error when price is missing", async () => {
    mockAdmin();

    const result = await createProduct(makeFormData({ price: "" }));

    expect(result.success).toBe(false);
    expect(mockProductCreate).not.toHaveBeenCalled();
  });

  it("returns error when slug already exists", async () => {
    mockAdmin();
    mockProductFindUnique.mockResolvedValue({ id: "existing", slug: "premium-dog-food" });

    const result = await createProduct(makeFormData());

    expect(result.success).toBe(false);
    expect(result.error).toContain("Slug already exists");
    expect(mockProductCreate).not.toHaveBeenCalled();
  });

  it("returns error for invalid price (zero)", async () => {
    mockAdmin();

    const result = await createProduct(makeFormData({ price: "0" }));

    expect(result.success).toBe(false);
    expect(result.error).toContain("Valid price");
    expect(mockProductCreate).not.toHaveBeenCalled();
  });
});

// ── Tests: updateProduct ───────────────────────

describe("updateProduct", () => {
  it("updates a product with valid data", async () => {
    mockAdmin();
    mockProductFindUnique
      .mockResolvedValueOnce({ id: "prod-1", slug: "premium-dog-food" }) // current
      .mockResolvedValueOnce(null); // slug is available (not taken)
    mockProductUpdate.mockResolvedValue({
      id: "prod-1",
      name: "Updated Dog Food",
      slug: "updated-dog-food",
    });

    const result = await updateProduct(
      "prod-1",
      makeFormData({ name: "Updated Dog Food", slug: "updated-dog-food" }),
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockProductUpdate).toHaveBeenCalledOnce();
  });

  it("returns error when product is not found", async () => {
    mockAdmin();
    mockProductFindUnique.mockResolvedValue(null);

    const result = await updateProduct("non-existent", makeFormData());

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
    expect(mockProductUpdate).not.toHaveBeenCalled();
  });

  it("returns error when slug is taken by another product", async () => {
    mockAdmin();
    mockProductFindUnique
      .mockResolvedValueOnce({ id: "prod-1", slug: "original-slug" }) // current
      .mockResolvedValueOnce({ id: "prod-2", slug: "taken-slug" }); // slug check

    const result = await updateProduct(
      "prod-1",
      makeFormData({ slug: "taken-slug" }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Slug already exists");
    expect(mockProductUpdate).not.toHaveBeenCalled();
  });
});

// ── Tests: deleteProduct ───────────────────────

describe("deleteProduct", () => {
  it("deletes a product when no order items exist", async () => {
    mockAdmin();
    mockOrderItemCount.mockResolvedValue(0);
    mockProductDelete.mockResolvedValue({ id: "prod-1" });

    const result = await deleteProduct("prod-1");

    expect(result.success).toBe(true);
    expect(mockProductDelete).toHaveBeenCalledOnce();
  });

  it("rejects deletion when product has order items", async () => {
    mockAdmin();
    mockOrderItemCount.mockResolvedValue(3);

    const result = await deleteProduct("prod-1");

    expect(result.success).toBe(false);
    expect(result.error).toContain("ordered");
    expect(mockProductDelete).not.toHaveBeenCalled();
  });
});
