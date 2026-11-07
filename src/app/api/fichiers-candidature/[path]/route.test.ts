import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const signedReadUrl = vi.hoisted(() => vi.fn());
const db = vi.hoisted(() => ({
  applicationFile: { findUnique: vi.fn() },
  auditLog: { create: vi.fn() },
}));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/application-files", () => ({ signedReadUrl }));

const { GET } = await import("./route");
const open = () =>
  GET(new Request("http://localhost/api/fichiers-candidature/a.pdf"), {
    params: Promise.resolve({ path: "a.pdf" }),
  });

beforeEach(() => {
  vi.resetAllMocks();
  auth.mockResolvedValue({ user: { email: "admin@example.com" } });
  signedReadUrl.mockResolvedValue("https://project.supabase.co/signed/a.pdf");
});

it("refuses an anonymous visitor before looking for the file", async () => {
  auth.mockResolvedValue(null);
  expect((await open()).status).toBe(401);
  expect(signedReadUrl).not.toHaveBeenCalled();
});

it("answers 404 for a file that belongs to no application", async () => {
  db.applicationFile.findUnique.mockResolvedValue({ applicationId: null });
  expect((await open()).status).toBe(404);
  expect(signedReadUrl).not.toHaveBeenCalled();
});

it("redirects an admin to a short lived link and records the reading", async () => {
  db.applicationFile.findUnique.mockResolvedValue({ applicationId: "c1" });
  const response = await open();
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://project.supabase.co/signed/a.pdf");
  expect(db.auditLog.create.mock.calls[0][0].data).toMatchObject({
    action: "APPLICATION_FILE_OPENED",
    target: "c1",
    userEmail: "admin@example.com",
  });
});
