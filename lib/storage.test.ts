import { describe, expect, it } from "vitest";
import { isProjectFile, safeFileName } from "@/lib/storage";

const DOCS = "https://project.supabase.co/storage/v1/object/public/documents/";

describe("isProjectFile", () => {
  it("accepts a file stored directly in the bucket", () => {
    expect(isProjectFile(`${DOCS}cv-1778-Jean_Hounkpe.pdf`, "documents")).toBe(true);
  });

  it.each([
    ["an outside domain", "https://evil.com/cv.pdf"],
    ["a javascript: URL", "javascript:alert(1)"],
    ["the bucket prefix alone", DOCS],
    ["a path going up", `${DOCS}../photos/x.png`],
    ["a sub folder", `${DOCS}folder/x.pdf`],
    [
      "a look-alike domain",
      "https://project.supabase.co.evil.com/storage/v1/object/public/documents/x.pdf",
    ],
    ["another bucket", "https://project.supabase.co/storage/v1/object/public/photos/x.pdf"],
  ])("refuses %s", (_, url) => {
    expect(isProjectFile(url, "documents")).toBe(false);
  });
});

describe("safeFileName", () => {
  it.each([
    ["Hounkpè CV.pdf", "Hounkpe_CV.pdf"],
    ["réunion d'été.jpg", "reunion_d_ete.jpg"],
    ["CV..final.pdf", "CV.final.pdf"],
  ])("cleans %s", (input, expected) => {
    expect(safeFileName(input)).toBe(expected);
  });

  it("always produces a name that isProjectFile accepts", () => {
    for (const name of ["../../etc/passwd", "Ɔkɛ ɖé.pdf", "a...b.pdf", "Sèïgbénan (copie).PDF"]) {
      const clean = safeFileName(name);
      expect(clean).toMatch(/^[A-Za-z0-9._-]+$/);
      expect(isProjectFile(`${DOCS}cv-1-${clean}`, "documents")).toBe(true);
    }
  });
});
