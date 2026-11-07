import { expect, it } from "vitest";
import { formatDate, formatPrice } from "@/lib/format";

it("shows dates in Benin time, not in the server's UTC", () => {
  // 23:30 UTC on 14 November is 00:30 on 15 November in Benin
  expect(formatDate("2026-11-14T23:30:00Z")).toBe("15/11/2026");
  expect(formatDate("2026-11-14T23:30:00Z", { hour: "2-digit", minute: "2-digit" })).toBe(
    "15/11/2026 00:30",
  );
});

it("keeps a deadline typed as 15 November on the 15th", () => {
  expect(formatDate(new Date("2026-11-15"))).toBe("15/11/2026");
});

it("writes prices the French way", () => {
  expect(formatPrice(25000).replace(/\s/g, " ")).toBe("25 000");
  expect(formatPrice(null)).toBe("0");
});
