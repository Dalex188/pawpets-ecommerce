import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (vi.hoisted to avoid hoisting issues) ─

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockDb = vi.hoisted(() => ({
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

// ── Import after mocks ───────────────────────

import { createOrder } from "@/lib/actions/checkout";

// ── Helpers ───────────────────────────────────

function buildFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set("cartItems", JSON.stringify([{ id: "prod-1", quantity: 2 }]));
  fd.set("shippingName", "Juan Pérez");
  fd.set("shippingPhone", "11 1234-5678");
  fd.set("shippingProvince", "Buenos Aires");
  fd.set("shippingCity", "La Plata");
  fd.set("shippingStreet", "Calle 123");
  fd.set("shippingZip", "1900");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────

describe("createOrder", () => {
  describe("validation errors", () => {
    it("returns redirect error when user is not authenticated", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await createOrder(null, buildFormData());

      expect(result.error).toBe("redirect:/login");
      expect(result.orderNumber).toBeUndefined();
    });

    it("returns error when cart is empty (no cartItems field)", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const fd = buildFormData();
      fd.delete("cartItems");
      const result = await createOrder(null, fd);

      expect(result.error).toBe("El carrito está vacío");
    });

    it("returns error when cartItems is empty array", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const fd = buildFormData();
      fd.set("cartItems", JSON.stringify([]));
      const result = await createOrder(null, fd);

      expect(result.error).toBe("El carrito está vacío");
    });

    it("returns error when cartItems is invalid JSON", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const fd = buildFormData();
      fd.set("cartItems", "not-json");
      const result = await createOrder(null, fd);

      expect(result.error).toBe("Error al procesar el carrito");
    });

    it("returns error when a shipping field is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const result = await createOrder(
        null,
        buildFormData({ shippingName: "" }),
      );

      expect(result.error).toBe("Todos los campos de envío son obligatorios");
    });
  });

  describe("stock failure", () => {
    it("returns error when product is not found", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        order: {
          create: vi.fn(),
          findFirst: vi.fn(),
        },
      };
      mockDb.$transaction.mockImplementation(
        async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      );

      const result = await createOrder(null, buildFormData());

      expect(result.error).toBe("Producto no encontrado");
    });

    it("returns error when stock is insufficient", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue({
            id: "prod-1",
            name: "Dog Food Premium",
            price: 1500,
            stock: 1,
          }),
          update: vi.fn(),
        },
        order: {
          create: vi.fn(),
          findFirst: vi.fn(),
        },
      };
      mockDb.$transaction.mockImplementation(
        async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      );

      const result = await createOrder(null, buildFormData());

      expect(result.error).toBe("Stock insuficiente para Dog Food Premium");
    });
  });

  describe("transactional atomicity", () => {
    it("creates order + items + decrements stock inside a single $transaction", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue({
            id: "prod-1",
            name: "Dog Food Premium",
            price: 1500,
            stock: 10,
          }),
          update: vi.fn().mockResolvedValue({}),
        },
        order: {
          create: vi.fn().mockResolvedValue({
            id: "order-1",
            orderNumber: 1001,
            status: "PENDING",
            total: 3000,
          }),
          findFirst: vi.fn().mockResolvedValue({ orderNumber: 1000 }),
        },
      };
      mockDb.$transaction.mockImplementation(
        async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      );

      const result = await createOrder(null, buildFormData());

      expect(result.orderNumber).toBe(1001);
      expect(result.error).toBeUndefined();

      expect(txMock.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { stock: { decrement: 2 } },
      });

      expect(txMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            status: "PENDING",
            total: 3000,
            orderNumber: 1001,
            shippingName: "Juan Pérez",
            items: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  productId: "prod-1",
                  quantity: 2,
                  price: 1500,
                }),
              ]),
            }),
          }),
        }),
      );
    });

    it("uses DB prices, never client-submitted prices", async () => {
      mockAuth.mockResolvedValue({ user: { id: "user-1" } });

      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue({
            id: "prod-1",
            name: "Dog Food Premium",
            price: 1500,
            stock: 10,
          }),
          update: vi.fn(),
        },
        order: {
          create: vi.fn().mockResolvedValue({
            id: "order-1",
            orderNumber: 1002,
            total: 3000,
          }),
          findFirst: vi.fn().mockResolvedValue({ orderNumber: 1001 }),
        },
      };
      mockDb.$transaction.mockImplementation(
        async (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      );

      // Client only sends id + quantity — never price
      const result = await createOrder(null, buildFormData());

      expect(result.orderNumber).toBe(1002);

      expect(txMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 3000,
            items: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ price: 1500 }),
              ]),
            }),
          }),
        }),
      );
    });
  });
});
