import "server-only";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { isProjectFile, MAX_GALLERY_PHOTOS } from "@/lib/storage";

// What an admin may send when creating or editing an article
export const articleSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court.").max(300, "Titre trop long."),
  content: z.string().min(1, "Le contenu est obligatoire.").max(100_000, "Contenu trop long."),
  coverImageUrl: z
    .string()
    .refine((url) => url === "" || isProjectFile(url, "photos"), "Image de couverture invalide.")
    .nullish(),
  photos: z
    .array(z.string().refine((url) => isProjectFile(url, "photos"), "Photo invalide."))
    .max(MAX_GALLERY_PHOTOS, "Un article compte 10 photos au plus, couverture comprise.")
    .default([]),
  published: z.boolean().default(false),
});

// Article bodies come from the TipTap editor. Only the tags it can produce are kept, so
// scripts, event handlers, styles and javascript: links are removed before display.
export function cleanArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "u",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "a",
    ],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
  });
}
