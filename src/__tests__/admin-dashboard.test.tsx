import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockProductCount = vi.hoisted(() => vi.fn());
const mockOrderCount = vi.hoisted(() => vi.fn());
const mockOrderFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  db: {
    product: { count: mockProductCount },
    order: {
      count: mockOrderCount,
      findMany: mockOrderFindMany,
    },
  },
}));

// ── Import after mocks ────────────────────────

import AdminDashboard from "@/app/admin/page";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockRecentOrders = [
  {
    id: "ord-1",
    orderNumber: 1001,
    status: "PENDING",
    total: 5000,
    createdAt: new Date("2026-06-23T12:00:00Z"),
    shippingName: "Juan Pérez",
    shippingPhone: "11 1234-5678",
    shippingProvince: "Buenos Aires",
    shippingCity: "La Plata",
    shippingStreet: "Calle 123",
    shippingZip: "1900",
    items: [
      { quantity: 2, price: 2500, product: { name: "Dog Food" } },
    ],
    user: { name: "Juan Pérez", email: "juan@example.com" },
  },
  {
    id: "ord-2",
    orderNumber: 1002,
    status: "CONFIRMED",
    total: 3000,
    createdAt: new Date("2026-06-22T10:00:00Z"),
    shippingName: "María García",
    shippingPhone: "11 5678-1234",
    shippingProvince: "CABA",
    shippingCity: "Buenos Aires",
    shippingStreet: "Av Siempre Viva 742",
    shippingZip: "1000",
    items: [
      { quantity: 1, price: 3000, product: { name: "Cat Food" } },
    ],
    user: { name: "María García", email: "maria@example.com" },
  },
];

describe("AdminDashboard", () => {
  it("renders summary cards with correct counts", async () => {
    mockProductCount.mockResolvedValueOnce(25); // total products
    mockProductCount.mockResolvedValueOnce(5);  // featured products
    mockOrderCount.mockResolvedValueOnce(3);     // pending orders
    mockOrderCount.mockResolvedValueOnce(50);    // total orders
    mockOrderFindMany.mockResolvedValue(mockRecentOrders);

    const element = await AdminDashboard();
    render(element);

    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders recent orders list with links", async () => {
    mockProductCount.mockResolvedValue(10);
    mockOrderCount.mockResolvedValue(0);
    mockOrderFindMany.mockResolvedValue(mockRecentOrders);

    const element = await AdminDashboard();
    render(element);

    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();

    const orderLink = screen.getByRole("link", { name: /#1001/i });
    expect(orderLink).toHaveAttribute("href", "/admin/orders/ord-1");

    const orderLink2 = screen.getByRole("link", { name: /#1002/i });
    expect(orderLink2).toHaveAttribute("href", "/admin/orders/ord-2");
  });

  it("handles empty state with zero counts", async () => {
    mockProductCount.mockResolvedValue(0);
    mockOrderCount.mockResolvedValue(0);
    mockOrderFindMany.mockResolvedValue([]);

    const element = await AdminDashboard();
    render(element);

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
    expect(screen.getByText("Productos Destacados")).toBeInTheDocument();
  });

  it("renders section titles", async () => {
    mockProductCount.mockResolvedValue(10);
    mockOrderCount.mockResolvedValue(0);
    mockOrderFindMany.mockResolvedValue(mockRecentOrders);

    const element = await AdminDashboard();
    render(element);

    expect(screen.getByText("Resumen")).toBeInTheDocument();
    expect(screen.getByText("Pedidos Recientes")).toBeInTheDocument();
    expect(screen.getByText("Total Productos")).toBeInTheDocument();
    expect(screen.getByText("Pedidos Pendientes")).toBeInTheDocument();
  });
});
