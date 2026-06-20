import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("smoke", () => {
  it("runs a basic assertion", () => {
    expect(true).toBe(true);
  });
});

describe("alias resolution", () => {
  it("resolves @/lib/utils import", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("merges Tailwind classes correctly", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });
});
