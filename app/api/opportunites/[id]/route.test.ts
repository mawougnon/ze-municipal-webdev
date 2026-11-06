import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const removePublicFile = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  opportunity: { delete: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase-admin", () => ({ removePublicFile }));

const { DELETE, PUT } = await import("./route");

const context = { params: Promise.resolve({ id: "o1" }) };
const poster = (name: string) =>
  `https://project.supabase.co/storage/v1/object/public/photos/${name}.jpg`;
const body = {
  type: "TRAINING",
  title: "Une formation",
  description: "Texte",
  deadline: null,
  isFree: true,
  price: null,
  published: true,
};
const put = (imageUrl: string) =>
  PUT(
    new Request("http://localhost/api/opportunites/o1", {
      method: "PUT",
      body: JSON.stringify({ ...body, imageUrl }),
    }),
    context,
  );

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation((work) => work(db));
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  db.opportunity.findUniqueOrThrow.mockResolvedValue({ imageUrl: poster("old") });
  db.opportunity.update.mockImplementation(async ({ data }) => ({ ...data, id: "o1" }));
});

it("removes the old poster when it is replaced", async () => {
  expect((await put(poster("new"))).status).toBe(200);
  expect(removePublicFile).toHaveBeenCalledWith("photos", poster("old"));
});

it("keeps the poster when it does not change", async () => {
  expect((await put(poster("old"))).status).toBe(200);
  expect(removePublicFile).not.toHaveBeenCalled();
});

it("stores no address when the poster is taken out", async () => {
  await put("");
  expect(db.opportunity.update.mock.calls[0][0].data.imageUrl).toBeNull();
  expect(removePublicFile).toHaveBeenCalledWith("photos", poster("old"));
});

it("refuses a poster hosted anywhere else", async () => {
  expect((await put("https://tracker.example/pixel.gif")).status).toBe(400);
  expect(db.opportunity.update).not.toHaveBeenCalled();
});

it("removes the poster with the offer", async () => {
  db.opportunity.delete.mockResolvedValue({ title: "Une formation", imageUrl: poster("old") });
  const res = await DELETE(
    new Request("http://localhost/api/opportunites/o1", { method: "DELETE" }),
    context,
  );
  expect(res.status).toBe(200);
  expect(removePublicFile).toHaveBeenCalledWith("photos", poster("old"));
});
