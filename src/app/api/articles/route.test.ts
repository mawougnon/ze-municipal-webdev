import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  article: { create: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const photo = "https://project.supabase.co/storage/v1/object/public/photos/1.jpg";
const body = { title: "Une actualité", content: "<p>Texte</p>", photos: [photo], published: true };
const post = (input: unknown = body) =>
  POST(
    new Request("http://localhost/api/articles", { method: "POST", body: JSON.stringify(input) }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  db.article.create.mockImplementation(async ({ data }) => data);
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
});

it("refuses an anonymous visitor", async () => {
  auth.mockResolvedValue(null);
  expect((await post()).status).toBe(401);
  expect(db.article.create).not.toHaveBeenCalled();
});

it("refuses an invalid body", async () => {
  expect((await post({ ...body, title: "" })).status).toBe(400);
});

it("saves the photos in order and records the publication", async () => {
  expect((await post()).status).toBe(201);
  expect(db.article.create.mock.calls[0][0].data.photos).toEqual({
    create: [{ url: photo, position: 0 }],
  });
  expect(db.auditLog.create.mock.calls[0][0].data.action).toBe("ARTICLE_SAVED_ONLINE");
});
