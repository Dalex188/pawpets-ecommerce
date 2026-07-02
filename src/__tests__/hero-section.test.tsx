import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/home/HeroSection";

describe("HeroSection", () => {
  it("renders the headline", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { name: /todo para tu mascota/i }),
    ).toBeInTheDocument();
  });

  it("renders the subheadline", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/encontrá todo lo que necesitás/i),
    ).toBeInTheDocument();
  });

  it("renders the CTA link pointing to /productos", () => {
    render(<HeroSection />);
    const link = screen.getByRole("link", { name: /ver productos/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/productos");
  });

  it("has a background image style", () => {
    render(<HeroSection />);
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveStyle({
      backgroundImage: 'url("https://picsum.photos/seed/pawpets-hero/1920/600")',
    });
  });

  it("renders without crashing", () => {
    const { container } = render(<HeroSection />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
