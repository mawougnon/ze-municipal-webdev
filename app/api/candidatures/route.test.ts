import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  opportunity: { findUnique: vi.fn() },
  application: { count: vi.fn(), create: vi.fn() },
  applicationFile: { updateMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));

const { POST } = await import("./route");

const valid = {
  opportunityId: "offre-1",
  fullName: "Jean Hounkpè",
  phone: "+229 01 97 12 34 56",
  consent: true,
};
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
    db.$transaction.mockImplementation((work) => work(db));
    db.application.create.mockImplementation(({ data }) => Promise.resolve({ id: "c1", ...data }));
    db.applicationFile.updateMany.mockResolvedValue({ count: 0 });
  });

  it("saves a valid application with the normalized phone number", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    expect(db.application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ phone: "0197123456", fullName: "Jean Hounkpè" }),
    });
  });

  it("rejects invalid data before touching the database", async () => {
    const res = await post({ ...valid, files: ["https://evil.com/cv.pdf"] });
    expect(res.status).toBe(400);
    expect(db.opportunity.findUnique).not.toHaveBeenCalled();
  });

  it("refuses an application without consent and dates the one given", async () => {
    expect((await post({ ...valid, consent: false })).status).toBe(400);
    expect(db.application.create).not.toHaveBeenCalled();
    await post(valid);
    expect(db.application.create.mock.calls[0][0].data.consentAt).toBeInstanceOf(Date);
  });

  it("attaches the documents the server issued", async () => {
    const path = "123e4567-e89b-12d3-a456-426614174000.pdf";
    db.applicationFile.updateMany.mockResolvedValue({ count: 1 });
    expect((await post({ ...valid, files: [path] })).status).toBe(201);
    expect(db.applicationFile.updateMany).toHaveBeenCalledWith({
      where: { path: { in: [path] }, applicationId: null },
      data: { applicationId: "c1" },
    });
  });

  it("refuses a document that was never issued or is already attached", async () => {
    const path = "123e4567-e89b-12d3-a456-426614174000.pdf";
    expect((await post({ ...valid, files: [path] })).status).toBe(400);
  });

  it("gives nothing of the stored application back to the visitor", async () => {
    expect(await (await post(valid)).json()).toEqual({ success: true });
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
