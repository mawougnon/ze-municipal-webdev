import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  document: { create: vi.fn(), updateMany: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const body = {
  title: "Plan de travail annuel",
  description: "Les activités prévues.",
  fileUrl: "https://project.supabase.co/storage/v1/object/public/documents/1-pta.pdf",
  date: "2026-01-15",
};
const post = (input: unknown = body) =>
  POST(
    new Request("http://localhost/api/documents", { method: "POST", body: JSON.stringify(input) }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  db.document.create.mockImplementation(async ({ data }) => data);
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
});

it("refuses an anonymous visitor", async () => {
  auth.mockResolvedValue(null);
  expect((await post()).status).toBe(401);
  expect(db.document.create).not.toHaveBeenCalled();
});

it("refuses a file from outside the project", async () => {
  expect((await post({ ...body, fileUrl: "https://evil.example/a.pdf" })).status).toBe(400);
  expect(db.document.create).not.toHaveBeenCalled();
});

it("gives the featured place to a published document", async () => {
  expect((await post({ ...body, featured: true, published: true })).status).toBe(201);
  expect(db.document.updateMany).toHaveBeenCalledWith({
    where: { featured: true },
    data: { featured: false },
  });
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "DOCUMENT_SAVED_ONLINE",
    target: "Plan de travail annuel",
  });
});

it("leaves the online featured document alone when saving a draft", async () => {
  expect((await post({ ...body, featured: true, published: false })).status).toBe(201);
  expect(db.document.updateMany).not.toHaveBeenCalled();
  expect(db.auditLog.create.mock.calls[0][0].data.action).toBe("DOCUMENT_SAVED_DRAFT");
});
