import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const removePublicFile = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  document: { delete: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/supabase-admin", () => ({ removePublicFile }));

const { DELETE, PUT } = await import("./route");

const context = { params: Promise.resolve({ id: "d1" }) };
const file = (name: string) =>
  `https://project.supabase.co/storage/v1/object/public/documents/${name}.pdf`;
const put = (fileUrl: string, extra = {}) =>
  PUT(
    new Request("http://localhost/api/documents/d1", {
      method: "PUT",
      body: JSON.stringify({
        title: "Bilan",
        description: "Texte",
        date: "2026-01-15",
        fileUrl,
        ...extra,
      }),
    }),
    context,
  );
const remove = () =>
  DELETE(new Request("http://localhost/api/documents/d1", { method: "DELETE" }), context);

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  db.document.findUniqueOrThrow.mockResolvedValue({ fileUrl: file("old") });
  db.document.update.mockImplementation(async ({ data }) => data);
});

it("refuses an anonymous visitor", async () => {
  auth.mockResolvedValue(null);
  expect((await put(file("new"))).status).toBe(401);
  expect((await remove()).status).toBe(401);
  expect(db.$transaction).not.toHaveBeenCalled();
});

it("removes the old file when it is replaced", async () => {
  expect((await put(file("new"))).status).toBe(200);
  expect(removePublicFile).toHaveBeenCalledWith("documents", file("old"));
});

it("keeps the file when it does not change", async () => {
  await put(file("old"));
  expect(removePublicFile).not.toHaveBeenCalled();
});

it("gives the featured place to a published document", async () => {
  await put(file("old"), { featured: true, published: true });
  expect(db.document.updateMany).toHaveBeenCalled();
});

it("answers 404 for an unknown document", async () => {
  db.document.findUniqueOrThrow.mockRejectedValue(new Error("not found"));
  db.document.delete.mockRejectedValue(new Error("not found"));
  expect((await put(file("new"))).status).toBe(404);
  expect((await remove()).status).toBe(404);
  expect(removePublicFile).not.toHaveBeenCalled();
});

it("removes the file with the document", async () => {
  db.document.delete.mockResolvedValue({ title: "Bilan", fileUrl: file("old") });
  expect((await remove()).status).toBe(200);
  expect(removePublicFile).toHaveBeenCalledWith("documents", file("old"));
  expect(db.auditLog.create.mock.calls[0][0].data.action).toBe("DOCUMENT_DELETED");
});
