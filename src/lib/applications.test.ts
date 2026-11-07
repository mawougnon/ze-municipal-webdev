import { describe, expect, it } from "vitest";
import { applicantSchema, applicationSchema } from "@/lib/applications";

const base = {
  opportunityId: "offre-1",
  fullName: "Jean Hounkpè",
  phone: "0197123456",
  consent: true,
};

describe("names", () => {
  it.each(["Jean Hounkpè", "Sèïgbénan Alphonse", "Agbɔ Ɖɛ́ka", "Jean-Marie Adjovi", "O’Neil Kossi"])(
    "accepts %s",
    (fullName) => {
      expect(applicationSchema.safeParse({ ...base, fullName }).success).toBe(true);
    },
  );

  it("collapses spaces and line breaks", () => {
    expect(applicationSchema.parse({ ...base, fullName: "  Jean \n  Dupont " }).fullName).toBe(
      "Jean Dupont",
    );
  });

  it.each([
    ["a single word", "Jean"],
    ["digits", "Jean 3"],
    ["symbols from the Latin-1 range", "Jean ×÷"],
    ["markup", "<script> alert"],
  ])("rejects %s", (_, fullName) => {
    expect(applicationSchema.safeParse({ ...base, fullName }).success).toBe(false);
  });
});

describe("phone", () => {
  it("stores the 10 digit form whatever the writing", () => {
    expect(applicationSchema.parse({ ...base, phone: "+229 01 97 12 34 56" }).phone).toBe(
      "0197123456",
    );
  });
});

describe("consent", () => {
  it.each([[false], [undefined], ["true"]])("refuses %s", (consent) => {
    expect(applicationSchema.safeParse({ ...base, consent }).success).toBe(false);
  });
});

describe("documents", () => {
  const issued = (i: number) => `123e4567-e89b-12d3-a456-42661417400${i}.pdf`;

  it("accepts up to five names issued by the server", () => {
    const files = [1, 2, 3, 4, 5].map(issued);
    expect(applicationSchema.safeParse({ ...base, files }).success).toBe(true);
  });

  it.each([
    ["an outside link", ["https://evil.com/cv.pdf"]],
    ["a path into another folder", ["../123e4567-e89b-12d3-a456-426614174000.pdf"]],
    ["a file that is not a PDF", ["123e4567-e89b-12d3-a456-426614174000.docx"]],
    ["six files", [1, 2, 3, 4, 5, 6].map(issued)],
  ])("rejects %s", (_, files) => {
    expect(applicationSchema.safeParse({ ...base, files }).success).toBe(false);
  });
});

describe("the messages shown to the applicant", () => {
  const firstError = (input: object) =>
    applicantSchema.safeParse({ ...base, ...input }).error?.issues[0].message;

  it("explains each refused field", () => {
    expect(firstError({ fullName: "Jean" })).toBe("Veuillez saisir votre nom et votre prénom.");
    expect(firstError({ phone: "12" })).toBe(
      "Le numéro doit comporter 10 chiffres et commencer par 01.",
    );
    expect(firstError({ email: "pas-une-adresse" })).toBe("Adresse email invalide.");
    expect(firstError({ message: "x".repeat(1001) })).toBe(
      "Message trop long (1000 caractères au maximum).",
    );
  });

  it("accepts an empty optional field", () => {
    expect(firstError({ email: "", message: "" })).toBeUndefined();
    expect(firstError({ email: null, message: null })).toBeUndefined();
  });
});
