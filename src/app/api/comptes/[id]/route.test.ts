import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { DELETE, PATCH } = await import("./route");

const context = { params: Promise.resolve({ id: "u2" }) };
const patch = (role: unknown = "SUPERADMIN") =>
  PATCH(
    new Request("http://localhost/api/comptes/u2", {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
    context,
  );
const remove = () =>
  DELETE(new Request("http://localhost/api/comptes/u2", { method: "DELETE" }), context);

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  auth.mockResolvedValue({ user: { email: "owner@example.com", role: "SUPERADMIN" } });
  db.user.findUnique.mockResolvedValue({ email: "other@example.com" });
});

describe.each([
  ["PATCH", patch],
  ["DELETE", remove],
])("%s", (_method, call) => {
  it.each([
    ["anonymous", null, 401],
    ["a content admin", { user: { email: "admin@example.com", role: "ADMIN" } }, 403],
  ])("refuses %s", async (_label, session, status) => {
    auth.mockResolvedValue(session);
    expect((await call()).status).toBe(status);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("refuses to touch the account of the person acting", async () => {
    db.user.findUnique.mockResolvedValue({ email: "owner@example.com" });
    expect((await call()).status).toBe(400);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("answers 404 for an unknown account", async () => {
    db.user.findUnique.mockResolvedValue(null);
    expect((await call()).status).toBe(404);
  });
});

it("changes a role and records it", async () => {
  expect((await patch()).status).toBe(200);
  expect(db.user.update).toHaveBeenCalledWith({
    where: { id: "u2" },
    data: { role: "SUPERADMIN" },
  });
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "ACCOUNT_ROLE_CHANGED",
    target: "other@example.com (SUPERADMIN)",
  });
});

it("refuses an unknown role", async () => {
  expect((await patch("USER")).status).toBe(400);
  expect(db.user.update).not.toHaveBeenCalled();
});

it("deletes an account and records it", async () => {
  expect((await remove()).status).toBe(200);
  expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "u2" } });
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "ACCOUNT_DELETED",
    target: "other@example.com",
  });
});
