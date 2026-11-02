import { describe, expect, it } from "vitest";
import { candidatureSchema } from "@/lib/candidatures";

const base = { opportunityId: "offre-1", fullName: "Jean Hounkpè", phone: "0197123456" };
const DOCS = "https://project.supabase.co/storage/v1/object/public/documents/";

describe("names", () => {
  it.each(["Jean Hounkpè", "Sèïgbénan Alphonse", "Agbɔ Ɖɛ́ka", "Jean-Marie Adjovi", "O’Neil Kossi"])(
    "accepts %s",
    (fullName) => {
      expect(candidatureSchema.safeParse({ ...base, fullName }).success).toBe(true);
    },
  );

  it("collapses spaces and line breaks", () => {
    expect(candidatureSchema.parse({ ...base, fullName: "  Jean \n  Dupont " }).fullName).toBe(
      "Jean Dupont",
    );
  });

  it.each([
    ["a single word", "Jean"],
    ["digits", "Jean 3"],
    ["symbols from the Latin-1 range", "Jean ×÷"],
    ["markup", "<script> alert"],
  ])("rejects %s", (_, fullName) => {
    expect(candidatureSchema.safeParse({ ...base, fullName }).success).toBe(false);
  });
});

describe("phone", () => {
  it("stores the 10 digit form whatever the writing", () => {
    expect(candidatureSchema.parse({ ...base, phone: "+229 01 97 12 34 56" }).phone).toBe(
      "0197123456",
    );
  });
});

describe("documents", () => {
  it("accepts up to five PDF files from the project's bucket", () => {
    const cvUrl = [1, 2, 3, 4, 5].map((i) => `${DOCS}cv-${i}.pdf`).join(" | ");
    expect(candidatureSchema.safeParse({ ...base, cvUrl }).success).toBe(true);
  });

  it.each([
    ["an outside link", "https://evil.com/cv.pdf"],
    ["a file that is not a PDF", `${DOCS}cv.docx`],
    ["six files", [1, 2, 3, 4, 5, 6].map((i) => `${DOCS}cv-${i}.pdf`).join(" | ")],
  ])("rejects %s", (_, cvUrl) => {
    expect(candidatureSchema.safeParse({ ...base, cvUrl }).success).toBe(false);
  });
});
