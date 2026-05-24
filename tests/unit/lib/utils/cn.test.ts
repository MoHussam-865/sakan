import { cn } from "@/lib/utils/cn";

describe("cn()", () => {
  it("returns a single class string unchanged", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("joins multiple class strings", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("resolves Tailwind conflicts: last value wins", () => {
    // tailwind-merge should keep only the last conflicting padding utility
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", false, undefined, null, "font-medium")).toBe(
      "text-sm font-medium"
    );
  });

  it("handles conditional class objects", () => {
    expect(cn({ "bg-red-500": false, "bg-green-500": true })).toBe(
      "bg-green-500"
    );
  });

  it("returns an empty string when all inputs are falsy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});
