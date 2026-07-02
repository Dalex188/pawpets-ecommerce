import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockOrderFindUnique = vi.hoisted(() => vi.fn());
const mockOrderUpdate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: mockOrderFindUnique,
      update: mockOrderUpdate,
    },
  },
}));

// ── Import after mocks ────────────────────────

import { updateOrderStatus } from "@/lib/actions/admin-orders";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateOrderStatus", () => {
  it("returns an ActionResult with success true when admin updates PENDING → CONFIRMED", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mockOrderFindUnique.mockResolvedValue({
      id: "ord-1",
      status: "PENDING",
    });
    mockOrderUpdate.mockResolvedValue({
      id: "ord-1",
      status: "CONFIRMED",
      total: 5000,
    });

    const result = await updateOrderStatus("ord-1", "CONFIRMED");

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.status).toBe("CONFIRMED");
  });

  it("returns an error when user is not admin", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", role: "CLIENT" } });

    const result = await updateOrderStatus("ord-1", "CONFIRMED");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("returns an error when no user is authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateOrderStatus("ord-1", "CONFIRMED");

    expect(result.success).toBe(false);
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("returns an error for invalid status transition", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mockOrderFindUnique.mockResolvedValue({
      id: "ord-1",
      status: "CONFIRMED",
    });

    const result = await updateOrderStatus("ord-1", "PENDING");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Transición");
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("returns an error when order is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    mockOrderFindUnique.mockResolvedValue(null);

    const result = await updateOrderStatus("non-existent", "CONFIRMED");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });
});
