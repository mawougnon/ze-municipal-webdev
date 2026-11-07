import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const removePublicFile = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  article: { delete: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/supabase-admin", () => ({ removePublicFile }));

const { DELETE, PUT } = await import("./route");
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
  db.article.delete.mockResolvedValue({
    title: "Rentrée citoyenne",
    coverImageUrl: "cover",
    photos: [{ url: "photo" }],
  });
  expect((await remove()).status).toBe(200);
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "ARTICLE_DELETED",
    target: "Rentrée citoyenne",
    userEmail: "admin@example.com",
  });
  expect(removePublicFile).toHaveBeenCalledWith("photos", "cover");
  expect(removePublicFile).toHaveBeenCalledWith("photos", "photo");
});

it("writes nothing to the log when the deletion fails", async () => {
  db.article.delete.mockRejectedValue(new Error("not found"));
  expect((await remove()).status).toBe(404);
  expect(db.auditLog.create).not.toHaveBeenCalled();
});

it("saves the gallery in order and removes only the photos taken out", async () => {
  const file = (name: string) =>
    `https://project.supabase.co/storage/v1/object/public/photos/${name}.jpg`;
  db.article.findUniqueOrThrow.mockResolvedValue({
    coverImageUrl: file("cover"),
    photos: [{ url: file("kept") }, { url: file("gone") }],
  });
  db.article.update.mockResolvedValue({
    id: "a1",
    title: "Titre",
    published: true,
    coverImageUrl: file("cover"),
  });

  const res = await PUT(
    new Request("http://localhost/api/articles/a1", {
      method: "PUT",
      body: JSON.stringify({
        title: "Titre",
        content: "<p>x</p>",
        coverImageUrl: file("cover"),
        photos: [file("new"), file("kept")],
        published: true,
      }),
    }),
    { params: Promise.resolve({ id: "a1" }) },
  );

  expect(res.status).toBe(200);
  expect(db.article.update.mock.calls[0][0].data.photos).toEqual({
    deleteMany: {},
    create: [
      { url: file("new"), position: 0 },
      { url: file("kept"), position: 1 },
    ],
  });
  expect(removePublicFile.mock.calls).toEqual([["photos", file("gone")]]);
});
