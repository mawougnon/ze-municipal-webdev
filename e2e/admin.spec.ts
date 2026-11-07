import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// These tests write to the database and to storage: test account, published document. They
// need the variables of the same environment as the server, and an explicit agreement:
//   E2E_ALLOW_WRITES=staging node --env-file=.env.staging node_modules/@playwright/test/cli.js test
// Never set this on production.
test.skip(process.env.E2E_ALLOW_WRITES !== "staging", "Writes only on preproduction");

const EMAIL = "e2e-owner@example.test";
const CODE = "424242";
const TITLE = "E2E document";
const ARTICLE = "E2E article";
const ADMIN_PAGES = [
  "/admin",
  "/admin/articles",
  "/admin/articles/nouveau",
  "/admin/documents",
  "/admin/documents/nouveau",
  "/admin/opportunites",
  "/admin/opportunites/nouveau",
  "/admin/candidatures",
  "/admin/comptes",
  "/admin/journal",
];
const prisma = new PrismaClient();

async function clean() {
  await prisma.document.deleteMany({ where: { title: TITLE } });
  await prisma.article.deleteMany({ where: { title: ARTICLE } });
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.auditLog.deleteMany({ where: { userEmail: EMAIL } });
}

test.beforeAll(async () => {
  await clean();
  await prisma.user.create({
    data: {
      email: EMAIL,
      name: "Compte de test",
      role: "SUPERADMIN",
      otpHash: await bcrypt.hash(CODE, 10),
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
});

test.afterAll(async () => {
  await clean();
  await prisma.$disconnect();
});

test("sign in, publish a document, see it online, delete it", async ({ page, context }) => {
  test.setTimeout(240_000);

  await page.goto(`/portail/${process.env.ADMIN_SECRET_TOKEN}`);
  await page.getByPlaceholder("votre@email.com").fill(EMAIL);
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByPlaceholder("000000").fill(CODE);
  await page.getByRole("button", { name: /Confirmer/ }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  const problems: string[] = [];
  for (const path of ADMIN_PAGES) {
    await page.goto(path, { waitUntil: "networkidle" });
    const { violations } = await new AxeBuilder({ page }).analyze();
    problems.push(
      ...violations
        .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
        .map(
          (violation) =>
            `${path} ${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
        ),
    );
  }
  expect(problems).toEqual([]);

  await page.goto("/admin/comptes");
  await expect(page.getByText(EMAIL)).toBeVisible();

  await page.goto("/admin/documents/nouveau");
  await page.getByLabel("Titre").fill(TITLE);
  await page.getByLabel("Description").fill("Publié par un test automatique.");
  await page.locator('input[type="file"]').setInputFiles({
    name: "document.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% test\n"),
  });
  await expect(page.getByText("Voir le fichier joint")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Publier", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/documents$/, { timeout: 30_000 });

  // Seen as a visitor, without the session
  const visitor = await context.browser()!.newContext();
  const publicPage = await visitor.newPage();
  await publicPage.goto(new URL("/documents", page.url()).href);
  await expect(publicPage.getByRole("heading", { name: TITLE })).toBeVisible();
  await visitor.close();

  await page.getByRole("link", { name: new RegExp(TITLE) }).click();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Supprimer" }).click();
  await expect(page).toHaveURL(/\/admin\/documents$/, { timeout: 30_000 });
  await expect(page.getByText(TITLE)).toHaveCount(0);

  await page.goto("/admin/journal");
  await expect(page.getByText("Document supprimé")).toBeVisible();
});

test("choose the focal point of a cover and see it in the list", async ({ page, context }) => {
  test.setTimeout(120_000);

  await prisma.user.update({
    where: { email: EMAIL },
    data: {
      otpHash: await bcrypt.hash(CODE, 10),
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      otpAttempts: 0,
    },
  });
  await page.goto(`/portail/${process.env.ADMIN_SECRET_TOKEN}`);
  await page.getByPlaceholder("votre@email.com").fill(EMAIL);
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByPlaceholder("000000").fill(CODE);
  await page.getByRole("button", { name: /Confirmer/ }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });

  await page.goto("/admin/articles/nouveau");
  await page.getByLabel("Titre").fill(ARTICLE);
  await page.getByLabel("Contenu de l’article").fill("Texte du test.");
  await page.locator('input[type="file"]').first().setInputFiles("public/culture-manioc.jpg");
  const cover = page.getByRole("img", { name: "Aperçu de la couverture" });
  await expect(cover).toBeVisible({ timeout: 30_000 });

  const box = await cover.boundingBox();
  await cover.click({ position: { x: box!.width * 0.2, y: box!.height * 0.8 } });
  await expect(page.getByLabel("Horizontal")).toHaveValue("20");
  await expect(page.getByLabel("Vertical")).toHaveValue("80");
  await page.getByLabel("Vertical").focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByLabel("Vertical")).toHaveValue("81");

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => violation.id),
  ).toEqual([]);

  await page.getByRole("button", { name: "Publier", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/, { timeout: 30_000 });

  const visitor = await context.browser()!.newContext();
  const publicPage = await visitor.newPage();
  await publicPage.goto(new URL("/articles", page.url()).href);
  await expect(publicPage.getByRole("img", { name: ARTICLE })).toHaveCSS(
    "object-position",
    "20% 81%",
  );
  await visitor.close();

  await page.getByRole("link", { name: new RegExp(ARTICLE) }).click();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Supprimer" }).click();
  await expect(page).toHaveURL(/\/admin\/articles$/, { timeout: 30_000 });
});
