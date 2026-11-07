import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  "/",
  "/articles",
  "/documents",
  "/presentation",
  "/opportunites",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
];

async function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  // A refused attempt caught by the page leaves no other trace
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(`Content policy: ${event.violatedDirective}`);
    });
  });
  return errors;
}

for (const path of PAGES) {
  test.describe(path, () => {
    test("needs no cookie and carries a strict content policy", async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      expect(response?.headers()["set-cookie"]).toBeUndefined();
      expect(response?.headers()["content-security-policy"]).toContain("'nonce-");
      expect(await page.context().cookies()).toEqual([]);
    });

    test("loads without error in the browser", async ({ page }) => {
      const errors = await collectBrowserErrors(page);
      await page.goto(path, { waitUntil: "networkidle" });
      expect(errors).toEqual([]);
    });

    test("has no serious accessibility problem", async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const { violations } = await new AxeBuilder({ page }).analyze();
      const serious = violations
        .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
        .map(
          (violation) =>
            `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
        );
      expect(serious).toEqual([]);
    });

    test("fits a phone screen", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test("the page of an opportunity and its form have no serious accessibility problem", async ({
  page,
}) => {
  const errors = await collectBrowserErrors(page);
  await page.goto("/opportunites");
  const opportunity = page.locator('main a[href^="/opportunites/"]').first();
  test.skip((await opportunity.count()) === 0, "No opportunity online");
  await opportunity.click();
  await expect(page.getByLabel(/Nom complet/)).toBeVisible();
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(serious.map((violation) => violation.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test("the admin area and the login page have no public address", async ({ page }) => {
  expect((await page.goto("/admin"))?.status()).toBe(404);
  expect((await page.goto("/admin/comptes"))?.status()).toBe(404);
  expect((await page.goto("/login"))?.status()).toBe(404);
});

test("the former activity page leads to the documents", async ({ page }) => {
  await page.goto("/pta");
  await expect(page).toHaveURL(/\/documents$/);
});

test("the sitemap lists the public pages", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("/documents</loc>");
});

test("writing without a session is refused", async ({ request }) => {
  expect((await request.post("/api/articles", { data: {} })).status()).toBe(401);
  expect((await request.post("/api/documents", { data: {} })).status()).toBe(401);
  expect((await request.post("/api/comptes", { data: {} })).status()).toBe(401);
  expect((await request.post("/api/envois", { data: {} })).status()).toBe(401);
  expect((await request.delete("/api/candidatures/none")).status()).toBe(401);
  expect((await request.get("/api/cron/nettoyage")).status()).toBe(401);
});
