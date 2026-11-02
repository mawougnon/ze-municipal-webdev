import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  opportunity: { findUnique: vi.fn() },
  application: { count: vi.fn(), create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const valid = { opportunityId: "offre-1", fullName: "Jean Hounkpè", phone: "+229 01 97 12 34 56" };
const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/candidatures", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

describe("POST /api/candidatures", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.opportunity.findUnique.mockResolvedValue({ published: true, deadline: null });
    db.application.count.mockResolvedValue(0);
    db.application.create.mockImplementation(({ data }) => Promise.resolve({ id: "c1", ...data }));
  });

  it("saves a valid application with the normalized phone number", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    expect(db.application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ phone: "0197123456", fullName: "Jean Hounkpè" }),
    });
  });

  it("rejects invalid data before touching the database", async () => {
    const res = await post({ ...valid, cvUrl: "https://evil.com/cv.pdf" });
    expect(res.status).toBe(400);
    expect(db.opportunity.findUnique).not.toHaveBeenCalled();
  });

  it("answers 404 for a draft offer", async () => {
    db.opportunity.findUnique.mockResolvedValue({ published: false, deadline: null });
    expect((await post(valid)).status).toBe(404);
  });

  it("answers 410 once the deadline has passed", async () => {
    db.opportunity.findUnique.mockResolvedValue({
      published: true,
      deadline: new Date("2020-01-01"),
    });
    expect((await post(valid)).status).toBe(410);
    expect(db.application.create).not.toHaveBeenCalled();
  });

  it("answers 429 after 3 applications from the same number within an hour", async () => {
    db.application.count.mockResolvedValueOnce(3).mockResolvedValueOnce(3);
    expect((await post(valid)).status).toBe(429);
    expect(db.application.create).not.toHaveBeenCalled();
  });
});
