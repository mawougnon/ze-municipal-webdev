import { describe, expect, it } from "vitest";
import { candidatureSchema } from "@/lib/candidatures";

const base = { opportunityId: "offre-1", fullName: "Jean Hounkpè", phone: "0197123456" };

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
  const issued = (i: number) => `123e4567-e89b-12d3-a456-42661417400${i}.pdf`;

  it("accepts up to five names issued by the server", () => {
    const files = [1, 2, 3, 4, 5].map(issued);
    expect(candidatureSchema.safeParse({ ...base, files }).success).toBe(true);
  });

  it.each([
    ["an outside link", ["https://evil.com/cv.pdf"]],
    ["a path into another folder", ["../123e4567-e89b-12d3-a456-426614174000.pdf"]],
    ["a file that is not a PDF", ["123e4567-e89b-12d3-a456-426614174000.docx"]],
    ["six files", [1, 2, 3, 4, 5, 6].map(issued)],
  ])("rejects %s", (_, files) => {
    expect(candidatureSchema.safeParse({ ...base, files }).success).toBe(false);
  });
});
