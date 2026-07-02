import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockUsePathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

// ── Import after mocks ────────────────────────

import { AdminSidebar } from "@/components/admin/AdminSidebar";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminSidebar", () => {
  it("renders all navigation links", () => {
    mockUsePathname.mockReturnValue("/admin");

    render(<AdminSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Productos")).toBeInTheDocument();
    expect(screen.getByText("Pedidos")).toBeInTheDocument();
  });

  it("links point to correct routes", () => {
    mockUsePathname.mockReturnValue("/admin");

    render(<AdminSidebar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(screen.getByRole("link", { name: /productos/i })).toHaveAttribute(
      "href",
      "/admin/products",
    );
    expect(screen.getByRole("link", { name: /pedidos/i })).toHaveAttribute(
      "href",
      "/admin/orders",
    );
  });

  it("highlights the active route", () => {
    mockUsePathname.mockReturnValue("/admin/products");

    render(<AdminSidebar />);

    const productosLink = screen.getByRole("link", { name: /productos/i });
    expect(productosLink.className).toContain("bg-primary");
    expect(productosLink.className).toContain("text-white");
  });

  it("does not highlight non-active routes with primary bg", () => {
    mockUsePathname.mockReturnValue("/admin");

    render(<AdminSidebar />);

    // Dashboard should be active, others should not
    const productosLink = screen.getByRole("link", { name: /productos/i });
    const pedidosLink = screen.getByRole("link", { name: /pedidos/i });

    expect(productosLink.className).not.toContain("bg-primary");
    expect(pedidosLink.className).not.toContain("bg-primary");
  });
});
