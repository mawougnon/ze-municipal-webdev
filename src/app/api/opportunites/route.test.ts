import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  opportunity: { create: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const body = {
  type: "TRAINING",
  title: "Une formation",
  description: "Texte",
  deadline: null,
  isFree: false,
  price: 25000,
};
const post = (input: unknown = body) =>
  POST(
    new Request("http://localhost/api/opportunites", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  db.opportunity.create.mockImplementation(async ({ data }) => data);
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
});

it("refuses an anonymous visitor", async () => {
  auth.mockResolvedValue(null);
  expect((await post()).status).toBe(401);
  expect(db.opportunity.create).not.toHaveBeenCalled();
});

it("refuses a price that is not a whole number", async () => {
  expect((await post({ ...body, price: 25000.5 })).status).toBe(400);
});

it("saves a draft and records it", async () => {
  expect((await post()).status).toBe(201);
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "OPPORTUNITY_SAVED_DRAFT",
    target: "Une formation",
  });
});
