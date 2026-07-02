import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (vi.hoisted to avoid hoisting issues) ─

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockOrderFindUnique = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: mockOrderFindUnique,
    },
  },
}));

// ── Import after mocks ───────────────────────

import { getOrderByNumber } from "@/lib/orders";

const mockOrder = {
  orderNumber: 1001,
  status: "PENDING",
  total: 3000,
  createdAt: new Date("2026-06-23T12:00:00Z"),
  shippingName: "Juan Pérez",
  shippingPhone: "11 1234-5678",
  shippingProvince: "Buenos Aires",
  shippingCity: "La Plata",
  shippingStreet: "Calle 123",
  shippingZip: "1900",
  userId: "user-1",
  items: [
    {
      quantity: 2,
      price: 1500,
      product: { name: "Dog Food Premium" },
    },
    {
      quantity: 1,
      price: 800,
      product: { name: "Cat Toy Mouse" },
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrderByNumber", () => {
  it("returns OrderDetail when order is found and belongs to current user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockOrderFindUnique.mockResolvedValue(mockOrder);

    const result = await getOrderByNumber(1001);

    expect(result).not.toBeNull();
    expect(result!.orderNumber).toBe(1001);
    expect(result!.status).toBe("PENDING");
    expect(result!.total).toBe(3000);
    expect(result!.items).toHaveLength(2);
    expect(result!.items[0].name).toBe("Dog Food Premium");
    expect(result!.items[0].lineTotal).toBe(3000);
    expect(result!.items[1].name).toBe("Cat Toy Mouse");
    expect(result!.items[1].lineTotal).toBe(800);
    expect(result!.shippingName).toBe("Juan Pérez");
  });

  it("returns null when order is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockOrderFindUnique.mockResolvedValue(null);

    const result = await getOrderByNumber(99999);

    expect(result).toBeNull();
  });

  it("returns null when order belongs to a different user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockOrderFindUnique.mockResolvedValue(mockOrder);

    const result = await getOrderByNumber(1001);

    expect(result).toBeNull();
  });

  it("returns null when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await getOrderByNumber(1001);

    expect(result).toBeNull();
    expect(mockOrderFindUnique).not.toHaveBeenCalled();
  });
});
