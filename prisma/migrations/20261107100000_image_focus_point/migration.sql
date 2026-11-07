-- The point of an image that stays visible in thumbnails, in percent of its width and height.
-- Posters keep showing from the top, as they did before this choice existed.
ALTER TABLE "Article"
  ADD COLUMN "coverFocusX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "coverFocusY" INTEGER NOT NULL DEFAULT 50,
  ADD CONSTRAINT "Article_coverFocus_check"
    CHECK ("coverFocusX" BETWEEN 0 AND 100 AND "coverFocusY" BETWEEN 0 AND 100);

ALTER TABLE "ArticlePhoto"
  ADD COLUMN "focusX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "focusY" INTEGER NOT NULL DEFAULT 50,
  ADD CONSTRAINT "ArticlePhoto_focus_check"
    CHECK ("focusX" BETWEEN 0 AND 100 AND "focusY" BETWEEN 0 AND 100);

ALTER TABLE "Opportunity"
  ADD COLUMN "imageFocusX" INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN "imageFocusY" INTEGER NOT NULL DEFAULT 0,
  ADD CONSTRAINT "Opportunity_imageFocus_check"
    CHECK ("imageFocusX" BETWEEN 0 AND 100 AND "imageFocusY" BETWEEN 0 AND 100);
