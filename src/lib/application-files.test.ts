import { beforeEach, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  application: { deleteMany: vi.fn() },
  applicationFile: { count: vi.fn(), create: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
  auditLog: { deleteMany: vi.fn(), create: vi.fn() },
}));
const bucket = vi.hoisted(() => ({
  createSignedUploadUrl: vi.fn(),
  createSignedUrl: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/supabase-admin", () => ({
  supabaseAdmin: { storage: { from: () => bucket } },
}));

const { issueUpload, purgeExpiredData, removeFiles } = await import("./application-files");

const NOW = Date.UTC(2026, 10, 6);
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.resetAllMocks();
  db.applicationFile.count.mockResolvedValue(0);
  bucket.createSignedUploadUrl.mockResolvedValue({ data: { token: "t" }, error: null });
  bucket.remove.mockResolvedValue({ error: null });
  db.application.deleteMany.mockResolvedValue({ count: 0 });
  db.applicationFile.findMany.mockResolvedValue([]);
  db.auditLog.deleteMany.mockResolvedValue({ count: 0 });
});

it("issues a random PDF name and records it before the upload", async () => {
  const upload = await issueUpload("203.0.113.7");
  expect(upload?.path).toMatch(/^[0-9a-f-]{36}\.pdf$/);
  expect(db.applicationFile.create).toHaveBeenCalledWith({
    data: { path: upload?.path, ipAddress: "203.0.113.7" },
  });
});

it("stops one visitor after 15 uploads in an hour", async () => {
  db.applicationFile.count.mockResolvedValueOnce(15).mockResolvedValueOnce(15);
  expect(await issueUpload("203.0.113.7")).toBeNull();
  expect(db.applicationFile.create).not.toHaveBeenCalled();
});

it("stops everyone after 50 uploads in an hour", async () => {
  db.applicationFile.count.mockResolvedValueOnce(0).mockResolvedValueOnce(50);
  expect(await issueUpload("203.0.113.8")).toBeNull();
});

it("keeps the rows when the files could not be removed, so the next purge tries again", async () => {
  bucket.remove.mockResolvedValue({ error: { message: "down" } });
  await expect(removeFiles(["a.pdf"])).rejects.toThrow("down");
  expect(db.applicationFile.deleteMany).not.toHaveBeenCalled();
});

it("deletes applications after 6 months and log lines after a year", async () => {
  await purgeExpiredData(NOW);
  const applications = db.application.deleteMany.mock.calls[0][0].where.createdAt.lt.getTime();
  expect(applications).toBe(NOW - 183 * DAY);
  const logs = db.auditLog.deleteMany.mock.calls[0][0].where.createdAt.lt.getTime();
  expect(logs).toBe(NOW - 365 * DAY);
});

it("leaves a recent upload a day for the form to be sent", async () => {
  await purgeExpiredData(NOW);
  const { where } = db.applicationFile.findMany.mock.calls[0][0];
  expect(where.applicationId).toBeNull();
  expect(where.createdAt.lt.getTime()).toBe(NOW - DAY);
});

it("removes orphan files and records the purge", async () => {
  db.applicationFile.findMany.mockResolvedValue([{ path: "a.pdf" }]);
  db.application.deleteMany.mockResolvedValue({ count: 2 });
  expect(await purgeExpiredData(NOW)).toEqual({ applications: 2, files: 1, logs: 0 });
  expect(bucket.remove).toHaveBeenCalledWith(["a.pdf"]);
  expect(db.auditLog.create.mock.calls[0][0].data.action).toBe("RETENTION_PURGE");
});

it("writes nothing to the log when there was nothing to purge", async () => {
  await purgeExpiredData(NOW);
  expect(db.auditLog.create).not.toHaveBeenCalled();
});
