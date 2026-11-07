import { beforeEach, expect, it, vi } from "vitest";

const requestLoginCode = vi.hoisted(() => vi.fn());
const after = vi.hoisted(() => vi.fn());
vi.mock("@/lib/login", () => ({ requestLoginCode }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after,
}));

const { POST } = await import("./route");

const ask = (email: unknown) =>
  POST(
    new Request("http://localhost/api/otp", {
      method: "POST",
      headers: { "x-forwarded-for": "41.85.1.2, 10.0.0.1" },
      body: JSON.stringify({ email }),
    }),
  );

beforeEach(() => {
  vi.resetAllMocks();
  // Run the deferred work right away so the test can inspect it
  after.mockImplementation((task: () => Promise<void>) => task());
});

it("answers the same way whether the account exists, does not, or the email fails", async () => {
  requestLoginCode
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("Resend email error"));
  vi.spyOn(console, "error").mockImplementation(() => {});

  const known = await ask("admin@example.com");
  const unknown = await ask("nobody@example.com");

  expect(known.status).toBe(200);
  expect(unknown.status).toBe(200);
  expect(await known.json()).toEqual(await unknown.json());
});

it("does the work after the response, with the visitor's IP", async () => {
  await ask("admin@example.com");
  expect(after).toHaveBeenCalledOnce();
  expect(requestLoginCode).toHaveBeenCalledWith("admin@example.com", "41.85.1.2");
});

it("rejects something that is not an email", async () => {
  expect((await ask("pas-une-adresse")).status).toBe(400);
  expect(requestLoginCode).not.toHaveBeenCalled();
});
