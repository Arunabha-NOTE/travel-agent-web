import { cn } from "@/lib/utils";
import { parseApiError } from "@/lib/utils/api-error";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("a", "b")).toBe("a b");
      expect(cn("a", { b: true, c: false })).toBe("a b");
    });
  });

  describe("parseApiError", () => {
    it("should return fallback if error is unknown", () => {
      const result = parseApiError({}, "Fallback");
      expect(result.message).toBe("Fallback");
    });

    it("should extract message from Error object", () => {
      const result = parseApiError(new Error("Real error"), "Fallback");
      expect(result.message).toBe("Real error");
    });
  });
});
