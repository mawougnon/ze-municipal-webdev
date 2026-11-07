import { afterEach, beforeEach, expect, it, vi } from "vitest";

const purgeExpiredData = vi.hoisted(() => vi.fn());
vi.mock("@/lib/application-files", () => ({ purgeExpiredData }));

const { GET } = await import("./route");
const call = (authorization?: string) =>
  GET(
    new Request("http://localhost/api/cron/nettoyage", {
      headers: authorization ? { authorization } : {},
    }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  purgeExpiredData.mockResolvedValue({ applications: 0, files: 0, logs: 0 });
  vi.stubEnv("CRON_SECRET", "right");
});
afterEach(() => vi.unstubAllEnvs());

it.each([undefined, "Bearer wrong", "right"])("refuses the header %s", async (header) => {
  expect((await call(header)).status).toBe(401);
  expect(purgeExpiredData).not.toHaveBeenCalled();
});

it("refuses everything when the secret is not configured", async () => {
  vi.stubEnv("CRON_SECRET", "");
  expect((await call("Bearer ")).status).toBe(401);
  expect(purgeExpiredData).not.toHaveBeenCalled();
});

it("runs the purge with the right secret", async () => {
  expect((await call("Bearer right")).status).toBe(200);
  expect(purgeExpiredData).toHaveBeenCalledOnce();
});
