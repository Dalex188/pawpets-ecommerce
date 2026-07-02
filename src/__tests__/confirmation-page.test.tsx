import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks (vi.hoisted to avoid hoisting issues) ─

const mockGetOrderByNumber = vi.hoisted(() => vi.fn());
vi.mock("@/lib/orders", () => ({
  getOrderByNumber: mockGetOrderByNumber,
}));

const mockNotFound = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

// ── Import after mocks ───────────────────────

import OrderPage from "@/app/orden/[orderNumber]/page";

const mockOrder = {
  orderNumber: 1001,
  status: "PENDING",
  total: 3800,
  createdAt: new Date("2026-06-23T12:00:00Z"),
  shippingName: "Juan Pérez",
  shippingPhone: "11 1234-5678",
  shippingProvince: "Buenos Aires",
  shippingCity: "La Plata",
  shippingStreet: "Calle 123",
  shippingZip: "1900",
  items: [
    { name: "Dog Food Premium", quantity: 2, price: 1500, lineTotal: 3000 },
    { name: "Cat Toy Mouse", quantity: 1, price: 800, lineTotal: 800 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Order confirmation page", () => {
  it("renders order details when order is found", async () => {
    mockGetOrderByNumber.mockResolvedValue(mockOrder);

    const Page = await OrderPage({ params: { orderNumber: "1001" } });
    render(Page);

    expect(screen.getByText("Orden #1001")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("Dog Food Premium")).toBeInTheDocument();
    expect(screen.getByText("Cat Toy Mouse")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("11 1234-5678")).toBeInTheDocument();
    expect(
      screen.getByText(/Calle 123, La Plata, Buenos Aires — CP 1900/),
    ).toBeInTheDocument();
  });

  it("calls notFound() when order is null", async () => {
    mockGetOrderByNumber.mockResolvedValue(null);

    await expect(
      OrderPage({ params: { orderNumber: "99999" } }),
    ).rejects.toThrow();
  });
});
