import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (vi.hoisted to avoid hoisting issues) ─

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockOrderFindMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findMany: mockOrderFindMany,
    },
  },
}));

// ── Import after mocks ───────────────────────

import { getOrdersByUser } from "@/lib/orders";

const mockOrders = [
  {
    orderNumber: 1001,
    status: "PENDING",
    total: 3000,
    createdAt: new Date("2026-06-23T12:00:00Z"),
    userId: "user-1",
    items: [
      { quantity: 2, price: 1500 },
      { quantity: 1, price: 800 },
    ],
  },
  {
    orderNumber: 1002,
    status: "CONFIRMED",
    total: 1500,
    createdAt: new Date("2026-06-20T10:00:00Z"),
    userId: "user-1",
    items: [{ quantity: 1, price: 1500 }],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrdersByUser", () => {
  it("returns orders with computed itemCount when user is authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockOrderFindMany.mockResolvedValue(mockOrders);

    const result = await getOrdersByUser();

    expect(result).toHaveLength(2);
    expect(result[0].orderNumber).toBe(1001);
    expect(result[0].itemCount).toBe(3); // 2 + 1
    expect(result[0].status).toBe("PENDING");
    expect(result[0].total).toBe(3000);
    expect(result[1].orderNumber).toBe(1002);
    expect(result[1].itemCount).toBe(1);
    expect(result[1].status).toBe("CONFIRMED");
  });

  it("returns orders sorted by newest first", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockOrderFindMany.mockResolvedValue(mockOrders);

    const result = await getOrdersByUser();

    expect(result).toHaveLength(2);
    expect(result[0].createdAt > result[1].createdAt).toBe(true);
    // Verify the query passed orderBy descending
    expect(mockOrderFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("returns empty array when user has no orders", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockOrderFindMany.mockResolvedValue([]);

    const result = await getOrdersByUser();

    expect(result).toEqual([]);
  });

  it("returns empty array when user is not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await getOrdersByUser();

    expect(result).toEqual([]);
    expect(mockOrderFindMany).not.toHaveBeenCalled();
  });
});
