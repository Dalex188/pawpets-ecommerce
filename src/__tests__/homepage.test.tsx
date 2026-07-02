import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mock child components ─────────────────────

vi.mock("@/components/home/HeroSection", () => ({
  HeroSection: () => <div data-testid="hero-section" />,
}));
vi.mock("@/components/home/CategoryGrid", () => ({
  CategoryGrid: () => <div data-testid="category-grid" />,
}));
vi.mock("@/components/home/FeaturedProducts", () => ({
  FeaturedProducts: () => <div data-testid="featured-products" />,
}));

// ── Import after mocks ────────────────────────

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("composes HeroSection", async () => {
    render(await HomePage());
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
  });

  it("composes CategoryGrid", async () => {
    render(await HomePage());
    expect(screen.getByTestId("category-grid")).toBeInTheDocument();
  });

  it("composes FeaturedProducts", async () => {
    render(await HomePage());
    expect(screen.getByTestId("featured-products")).toBeInTheDocument();
  });

  it("renders all three sections in order", async () => {
    const { container } = render(await HomePage());
    const children = container.firstChild?.childNodes;
    expect(children).toHaveLength(3);
  });
});
