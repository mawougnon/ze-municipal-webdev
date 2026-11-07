import { beforeEach, expect, it, vi } from "vitest";

const issueUpload = vi.hoisted(() => vi.fn());
vi.mock("@/lib/application-files", () => ({ issueUpload }));

const { POST } = await import("./route");
const post = () =>
  POST(
    new Request("http://localhost/api/fichiers-candidature", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.7" },
    }),
  );

beforeEach(() => vi.resetAllMocks());

it("gives a link and counts it against the address of the visitor", async () => {
  issueUpload.mockResolvedValue({ path: "a.pdf", token: "t" });
  const response = await post();
  expect(response.status).toBe(201);
  expect(issueUpload).toHaveBeenCalledWith("203.0.113.7");
});

it("answers 429 over the limits", async () => {
  issueUpload.mockResolvedValue(null);
  expect((await post()).status).toBe(429);
});

it("answers 500 when the link cannot be issued", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  issueUpload.mockRejectedValue(new Error("down"));
  expect((await post()).status).toBe(500);
});
