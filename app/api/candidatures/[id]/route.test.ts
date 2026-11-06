import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const removeFiles = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  application: { delete: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/application-files", () => ({ removeFiles }));

const { DELETE } = await import("./route");
const remove = () =>
  DELETE(new Request("http://localhost/api/candidatures/c1", { method: "DELETE" }), {
    params: Promise.resolve({ id: "c1" }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  db.application.delete.mockResolvedValue({ files: [{ path: "a.pdf" }] });
  removeFiles.mockResolvedValue(undefined);
});

it("refuses to delete without a session", async () => {
  auth.mockResolvedValue(null);
  expect((await remove()).status).toBe(401);
  expect(db.application.delete).not.toHaveBeenCalled();
});

it("deletes for a signed in admin", async () => {
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  expect((await remove()).status).toBe(200);
  expect(removeFiles).toHaveBeenCalledWith(["a.pdf"]);
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "APPLICATION_DELETED",
    target: "c1",
    userEmail: "admin@example.com",
  });
});

it("still answers 200 when a file cannot be removed: the daily purge retries", async () => {
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  removeFiles.mockRejectedValue(new Error("down"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect((await remove()).status).toBe(200);
});
