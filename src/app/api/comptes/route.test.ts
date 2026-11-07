import { Prisma } from "@prisma/client";
import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  user: { create: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const body = { name: "Astou Dossou", email: "Astou@Example.com", role: "ADMIN" };
const post = (input: unknown = body) =>
  POST(
    new Request("http://localhost/api/comptes", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.7" },
      body: JSON.stringify(input),
    }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  auth.mockResolvedValue({ user: { email: "owner@example.com", role: "SUPERADMIN" } });
});

it.each([
  ["anonymous", null, 401],
  ["a content admin", { user: { email: "admin@example.com", role: "ADMIN" } }, 403],
])("refuses %s", async (_label, session, status) => {
  auth.mockResolvedValue(session);
  expect((await post()).status).toBe(status);
  expect(db.user.create).not.toHaveBeenCalled();
});

it("creates the account and records who did it", async () => {
  expect((await post()).status).toBe(201);
  expect(db.user.create).toHaveBeenCalledWith({
    data: { name: "Astou Dossou", email: "astou@example.com", role: "ADMIN" },
  });
  expect(db.auditLog.create.mock.calls[0][0].data).toEqual({
    action: "ACCOUNT_CREATED",
    target: "astou@example.com (ADMIN)",
    userEmail: "owner@example.com",
    ipAddress: "203.0.113.7",
  });
});

it("refuses an invalid body", async () => {
  expect((await post({ ...body, role: "USER" })).status).toBe(400);
  expect(db.user.create).not.toHaveBeenCalled();
});

it("reports an address that already has an account", async () => {
  db.user.create.mockRejectedValue(
    new Prisma.PrismaClientKnownRequestError("duplicate", { code: "P2002", clientVersion: "5" }),
  );
  expect((await post()).status).toBe(409);
});
