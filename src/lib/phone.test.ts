import { describe, expect, it } from "vitest";
import { BENIN_PHONE, normalizeBeninPhone, whatsappLink } from "@/lib/phone";

describe("normalizeBeninPhone", () => {
  it.each([
    "0197123456",
    "01 97 12 34 56",
    "+229 01 97 12 34 56",
    "+2290197123456",
    "00229 0197123456",
    "01.97.12.34.56",
    "01-97-12-34-56",
  ])("reads %s as 0197123456", (input) => {
    expect(normalizeBeninPhone(input)).toBe("0197123456");
  });

  it.each([
    "97123456",
    "+229 97 12 34 56",
    "0297123456",
    "019712345",
    "01971234567",
    "+33 6 12 34 56 78",
  ])("rejects %s", (input) => {
    expect(BENIN_PHONE.test(normalizeBeninPhone(input))).toBe(false);
  });
});

it("builds an international WhatsApp link", () => {
  expect(whatsappLink("0197123456")).toBe("https://wa.me/2290197123456");
});
