import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const bucket = vi.hoisted(() => ({ createSignedUploadUrl: vi.fn() }));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: { storage: { from: () => bucket } },
}));

const { POST } = await import("./route");
const post = (body: unknown) =>
  POST(new Request("http://localhost/api/envois", { method: "POST", body: JSON.stringify(body) }));

beforeEach(() => {
  vi.resetAllMocks();
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  bucket.createSignedUploadUrl.mockResolvedValue({ data: { token: "t" }, error: null });
});

it("refuses an anonymous visitor", async () => {
  auth.mockResolvedValue(null);
  expect((await post({ bucket: "photos", fileName: "a.jpg" })).status).toBe(401);
  expect(bucket.createSignedUploadUrl).not.toHaveBeenCalled();
});

it("refuses the private bucket", async () => {
  const response = await post({ bucket: "applications", fileName: "a.pdf" });
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Fichier invalide." });
});

it("issues a link under a cleaned name", async () => {
  const response = await post({ bucket: "documents", fileName: "Plan d'action è.pdf" });
  expect(response.status).toBe(201);
  const { path, token } = await response.json();
  expect(path).toMatch(/^\d+-Plan_d_action_e\.pdf$/);
  expect(token).toBe("t");
});

it("answers 500 when storage refuses", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  bucket.createSignedUploadUrl.mockResolvedValue({ data: null, error: new Error("down") });
  expect((await post({ bucket: "photos", fileName: "a.jpg" })).status).toBe(500);
});
