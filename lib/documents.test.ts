import { beforeEach, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ document: { findMany: vi.fn() } }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { documentSchema, publishedDocuments } = await import("./documents");

const valid = {
  title: "Plan de travail annuel",
  description: "Les activités prévues pour la mandature.",
  fileUrl: "https://project.supabase.co/storage/v1/object/public/documents/1-pta.pdf",
  date: "2026-01-15",
};

beforeEach(() => vi.resetAllMocks());

it("stores the date at midnight UTC and defaults to an unpublished draft", () => {
  const parsed = documentSchema.parse(valid);
  expect(parsed.date.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  expect(parsed.published).toBe(false);
  expect(parsed.featured).toBe(false);
});

it.each([
  ["a file from another site", { ...valid, fileUrl: "https://evil.example/pta.pdf" }],
  [
    "a file from the photos bucket",
    { ...valid, fileUrl: "https://project.supabase.co/storage/v1/object/public/photos/1.jpg" },
  ],
  ["no file", { ...valid, fileUrl: "" }],
  ["no description", { ...valid, description: "  " }],
  ["an impossible date", { ...valid, date: "2026-02-31" }],
])("refuses %s", (_label, input) => {
  expect(documentSchema.safeParse(input).success).toBe(false);
});

it("separates the featured document from the others", async () => {
  const pta = { id: "1", featured: true };
  const report = { id: "2", featured: false };
  db.document.findMany.mockResolvedValue([report, pta]);
  expect(await publishedDocuments()).toEqual({ featured: pta, others: [report] });
  expect(db.document.findMany.mock.calls[0][0].where).toEqual({ published: true });
});
