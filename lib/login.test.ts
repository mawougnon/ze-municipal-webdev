import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { updateMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  auditLog: { create: vi.fn() },
}));
const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const { MAX_ATTEMPTS, requestLoginCode, verifyLoginCode } = await import("@/lib/login");

beforeEach(() => {
  vi.resetAllMocks();
  db.auditLog.create.mockResolvedValue({});
  db.user.update.mockResolvedValue({});
  send.mockResolvedValue({ data: { id: "mail" }, error: null });
});

const actions = () => db.auditLog.create.mock.calls.map(([arg]) => arg.data.action);

describe("requestLoginCode", () => {
  it("sends nothing when no account matches or a code is still recent", async () => {
    db.user.updateMany.mockResolvedValue({ count: 0 });
    await requestLoginCode("someone@example.com", "1.2.3.4");
    expect(send).not.toHaveBeenCalled();
    expect(actions()).toEqual([]);
  });

  it("stores only a hash of the code it emails, for the normalized address", async () => {
    db.user.updateMany.mockResolvedValue({ count: 1 });
    await requestLoginCode("  Admin@Example.COM ", "1.2.3.4");

    const { where, data } = db.user.updateMany.mock.calls[0][0];
    expect(where.email).toBe("admin@example.com");
    const code = send.mock.calls[0][0].html.match(/>(\d{6})</)[1];
    expect(data.otpHash).not.toContain(code);
    expect(await bcrypt.compare(code, data.otpHash)).toBe(true);
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: { action: "LOGIN_OTP_SENT", userEmail: "admin@example.com", ipAddress: "1.2.3.4" },
    });
  });

  it("raises when the email could not be sent, without logging it as sent", async () => {
    db.user.updateMany.mockResolvedValue({ count: 1 });
    send.mockResolvedValue({ data: null, error: { message: "domain is not verified" } });
    await expect(requestLoginCode("admin@example.com", null)).rejects.toThrow(/Resend/);
    expect(actions()).toEqual([]);
  });
});

describe("verifyLoginCode", () => {
  const user = async (extra = {}) => ({
    id: "u1",
    email: "admin@example.com",
    name: "Admin",
    role: "SUPERADMIN",
    otpHash: await bcrypt.hash("123456", 4),
    otpExpires: new Date(Date.now() + 60_000),
    otpAttempts: 0,
    ...extra,
  });

  it("signs in with the right code and destroys it", async () => {
    db.user.findUnique.mockResolvedValue(await user());
    db.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await verifyLoginCode("Admin@example.com", "123456", "1.2.3.4");

    expect(result).toEqual({
      id: "u1",
      email: "admin@example.com",
      name: "Admin",
      role: "SUPERADMIN",
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      data: { otpHash: null, otpExpires: null, otpAttempts: 0 },
    });
    expect(actions()).toEqual(["LOGIN_OTP_SUCCESS"]);
  });

  it("refuses a wrong code and logs it", async () => {
    db.user.findUnique.mockResolvedValue(await user());
    db.user.updateMany.mockResolvedValue({ count: 1 });
    expect(await verifyLoginCode("admin@example.com", "000000", null)).toBeNull();
    expect(actions()).toEqual(["LOGIN_OTP_FAILED"]);
  });

  it("refuses an expired code without spending an attempt", async () => {
    db.user.findUnique.mockResolvedValue(await user({ otpExpires: new Date(Date.now() - 1000) }));
    expect(await verifyLoginCode("admin@example.com", "123456", null)).toBeNull();
    expect(db.user.updateMany).not.toHaveBeenCalled();
  });

  it("destroys the code once the attempts are used up, and keeps the resend delay", async () => {
    db.user.findUnique.mockResolvedValue(await user({ otpAttempts: MAX_ATTEMPTS }));
    db.user.updateMany.mockResolvedValue({ count: 0 });

    expect(await verifyLoginCode("admin@example.com", "123456", null)).toBeNull();
    expect(db.user.update).toHaveBeenCalledWith({
      where: { email: "admin@example.com" },
      data: { otpHash: null },
    });
    expect(actions()).toEqual(["LOGIN_OTP_LOCKED"]);
  });

  it("checks at most 5 guesses even when 20 arrive at the same time", async () => {
    db.user.findUnique.mockResolvedValue(await user());
    // The database applies "increment if below the limit" atomically
    let attempts = 0;
    db.user.updateMany.mockImplementation(async () =>
      attempts < MAX_ATTEMPTS ? (attempts++, { count: 1 }) : { count: 0 },
    );

    const guesses = Array.from({ length: 20 }, (_, i) => String(100000 + i));
    const results = await Promise.all(
      guesses.map((g) => verifyLoginCode("admin@example.com", g, null)),
    );

    expect(results.every((r) => r === null)).toBe(true);
    expect(actions().filter((a) => a === "LOGIN_OTP_FAILED")).toHaveLength(MAX_ATTEMPTS);
  });
});
