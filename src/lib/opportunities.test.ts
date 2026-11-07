import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isOpen, opportunitySchema, openOpportunitiesWhere } from "@/lib/opportunities";

const HOUR = 60 * 60 * 1000;

describe("deadlines", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // A deadline typed as 15 November is stored as 2026-11-15T00:00:00Z
  const deadline = new Date("2026-11-15T00:00:00Z");

  it("keeps the offer open during the whole deadline day in Benin", () => {
    vi.setSystemTime(new Date("2026-11-15T00:30:00Z")); // 01:30 in Benin
    expect(isOpen(deadline)).toBe(true);
    vi.setSystemTime(new Date("2026-11-15T22:59:00Z")); // 23:59 in Benin
    expect(isOpen(deadline)).toBe(true);
  });

  it("closes the offer at midnight in Benin", () => {
    vi.setSystemTime(new Date("2026-11-15T23:00:00Z")); // 00:00 on 16 November in Benin
    expect(isOpen(deadline)).toBe(false);
  });

  it("never closes an offer without a deadline", () => {
    expect(isOpen(null)).toBe(true);
  });

  it("filters in the database exactly like isOpen", () => {
    vi.setSystemTime(new Date("2026-11-15T12:00:00Z"));
    const where = openOpportunitiesWhere();
    const limit = (where.OR[1] as { deadline: { gt: Date } }).deadline.gt.getTime();
    for (const deadlineItem of [
      Date.now() - 23 * HOUR + 1000,
      Date.now() - 23 * HOUR - 1000,
      Date.now() + HOUR,
    ]) {
      expect(deadlineItem > limit).toBe(isOpen(new Date(deadlineItem)));
    }
  });
});

describe("opportunitySchema", () => {
  const base = {
    type: "JOB",
    title: "Stage en informatique",
    description: "Ligne 1\nLigne 2",
    deadline: null,
    isFree: true,
    price: null,
    published: false,
  };

  it("accepts what the admin forms send", () => {
    expect(opportunitySchema.safeParse(base).success).toBe(true);
    expect(
      opportunitySchema.safeParse({ ...base, deadline: new Date("2026-11-15").toISOString() })
        .success,
    ).toBe(true);
    const paid = opportunitySchema.parse({
      ...base,
      type: "TRAINING",
      isFree: false,
      price: 25000,
    });
    expect(paid.price).toBe(25000);
  });

  it("drops the price of a free offer", () => {
    expect(opportunitySchema.parse({ ...base, price: 5000 }).price).toBeNull();
  });

  it.each([
    ["an unknown type", { ...base, type: "SCAM" }],
    ["a paid offer without price", { ...base, isFree: false, price: null }],
    ["a negative price", { ...base, isFree: false, price: -5 }],
    ["an invalid date", { ...base, deadline: "pas une date" }],
    ["a one letter title", { ...base, title: "x" }],
    ["an unreadable body", null],
  ])("rejects %s", (_, payload) => {
    expect(opportunitySchema.safeParse(payload).success).toBe(false);
  });
});
