import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────

const mockAuth = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockRedirect = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/components/admin/AdminSidebar", () => ({
  AdminSidebar: () => <div data-testid="admin-sidebar">AdminSidebar</div>,
}));

// ── Import after mocks ────────────────────────

import AdminLayout from "@/app/admin/layout";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AdminAuthGuard (integration)", () => {
  it("renders children for admin user — guard passes", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", name: "Admin" },
    });

    const element = await AdminLayout({
      children: <div data-testid="dashboard-content">Dashboard</div>,
    });
    render(element);

    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toHaveTextContent("Dashboard");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects CLIENT user to / — guard blocks non-admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1", role: "CLIENT", name: "Client" },
    });

    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      AdminLayout({ children: <div>Content</div> }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects unauthenticated user to / — guard blocks no session", async () => {
    mockAuth.mockResolvedValue(null);

    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      AdminLayout({ children: <div>Content</div> }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects user with undefined role to / — edge case", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
    });

    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      AdminLayout({ children: <div>Content</div> }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});
