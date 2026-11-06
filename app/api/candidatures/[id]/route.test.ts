import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  application: { delete: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { DELETE } = await import("./route");
const remove = () =>
  DELETE(new Request("http://localhost/api/candidatures/c1", { method: "DELETE" }), {
    params: Promise.resolve({ id: "c1" }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
});

it("refuses to delete without a session", async () => {
  auth.mockResolvedValue(null);
  expect((await remove()).status).toBe(401);
  expect(db.application.delete).not.toHaveBeenCalled();
});

it("deletes for a signed in admin", async () => {
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  expect((await remove()).status).toBe(200);
  expect(db.application.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "APPLICATION_DELETED",
    target: "c1",
    userEmail: "admin@example.com",
  });
});
