import { describe, expect, it } from "vitest";
import { formatDate, getInitials, setPriorityColor } from "./utils";

describe("utils", () => {
  describe("setPriorityColor", () => {
    it("returns correct color for Low priority", () => {
      expect(setPriorityColor("Low")).toContain("bg-blue");
    });

    it("returns correct color for Urgent priority", () => {
      expect(setPriorityColor("Urgent")).toContain("bg-red");
    });

    it("returns correct color for Medium priority", () => {
      expect(setPriorityColor("Medium")).toContain("bg-green");
    });

    it("returns correct color for High priority", () => {
      expect(setPriorityColor("High")).toContain("bg-yellow");
    });
  });

  describe("getInitials", () => {
    it("returns initials from full name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("handles single names", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("handles three part names", () => {
      expect(getInitials("John Paul Jones")).toBe("JPJ");
    });
  });

  describe("formatDate", () => {
    it('returns "Today" for current date', () => {
      const today = new Date().toISOString().split("T")[0];
      expect(formatDate(today)).toBe("Today");
    });

    it('returns "Tomorrow" for next day', () => {
      const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
      expect(formatDate(tomorrow)).toBe("Tomorrow");
    });
  });
});
