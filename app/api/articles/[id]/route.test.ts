import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  article: { delete: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { DELETE } = await import("./route");
const remove = () =>
  DELETE(new Request("http://localhost/api/articles/a1", { method: "DELETE" }), {
    params: Promise.resolve({ id: "a1" }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
});

it("records the title of a deleted article", async () => {
  db.article.delete.mockResolvedValue({ title: "Rentrée citoyenne" });
  expect((await remove()).status).toBe(200);
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "ARTICLE_DELETED",
    target: "Rentrée citoyenne",
    userEmail: "admin@example.com",
  });
});

it("writes nothing to the log when the deletion fails", async () => {
  db.article.delete.mockRejectedValue(new Error("not found"));
  expect((await remove()).status).toBe(404);
  expect(db.auditLog.create).not.toHaveBeenCalled();
});
