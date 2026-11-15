import { expect, test, type Page } from "@playwright/test";
import {
  answerButtons,
  answerRange,
  byTestId,
  openMenu,
  HYBRID_CODE,
  LOCALES,
  RESULT_URL,
  startQuiz,
  TOTAL,
  waitForQuestion,
  title,
} from "./helpers";

const ranking = (page: Page) => byTestId(page, "ranking").locator("li");

test.describe("parcours complet", () => {
  for (const locale of LOCALES) {
    test(`${locale} : 24 réponses mènent au verdict`, async ({ page }) => {
      await startQuiz(page, locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await answerRange(page, 0, TOTAL, (i, count) => (i * 3) % count);

      await expect(page).toHaveURL(RESULT_URL);
      expect(page.url()).toContain(`/${locale}/r/`);
      await expect(title(page)).not.toBeEmpty();
      await expect(page.locator('svg[role=img][viewBox="0 0 400 400"]')).toBeVisible();
      await expect(ranking(page)).toHaveCount(12);
      await expect(byTestId(page, "profile").locator("li")).toHaveCount(7);
    });
  }
});

test("un lien partagé donne exactement le même résultat ailleurs [F-25]", async ({
  page,
  browser,
}) => {
  await startQuiz(page, "en");
  await answerRange(page, 0, TOTAL, (i) => i);
  await expect(page).toHaveURL(RESULT_URL);
  const url = page.url();
  const verdict = await title(page).textContent();
  const scores = await ranking(page).allTextContents();

  const other = await browser.newContext();
  const fresh = await other.newPage();
  await fresh.goto(url);
  await expect(title(fresh)).toHaveText(verdict ?? "");
  expect(await ranking(fresh).allTextContents()).toEqual(scores);
  await other.close();
});

test("un code invalide ou altéré affiche une erreur propre [F-25]", async ({ page }) => {
  for (const code of ["n-importe-quoi", "1AUoEtqwqfeK", "1AUoEtqwqfe"]) {
    const response = await page.goto(`/fr/r/${code}`);
    expect(response?.status()).toBeLessThan(500);
    await expect(title(page)).toHaveText("Dossier illisible");
    await expect(page.getByRole("link", { name: "Passer l’entretien" })).toBeVisible();
  }
});

test("résultat hybride : Sidorovich hésite entre les deux premières [F-24]", async ({ page }) => {
  await page.goto(`/fr/r/${HYBRID_CODE}`);
  await expect(title(page)).toHaveText("Mercenaires");
  await expect(page.getByText(/Mercenaires ou Solitaires\s\?\sJ’hésite moi aussi\./)).toBeVisible();
});

test("retour arrière : même ordre des réponses, réponse modifiable [F-11] [F-13]", async ({
  page,
}) => {
  await startQuiz(page, "fr");
  const before = await answerButtons(page).allTextContents();
  await answerButtons(page).nth(2).click();
  await waitForQuestion(page, 1);

  await byTestId(page, "quiz-back").click();
  await expect(byTestId(page, "question-title")).toBeFocused();
  expect(await answerButtons(page).allTextContents()).toEqual(before);
  await expect(answerButtons(page).nth(2)).toHaveAttribute("aria-pressed", "true");

  await answerButtons(page).nth(0).click();
  await byTestId(page, "quiz-back").click();
  await expect(answerButtons(page).nth(0)).toHaveAttribute("aria-pressed", "true");
  await expect(answerButtons(page).nth(2)).toHaveAttribute("aria-pressed", "false");
  await byTestId(page, "quiz-next").click();
  await waitForQuestion(page, 1);
});

test("reprise après rechargement, puis « Recommencer » [F-14]", async ({ page }) => {
  await startQuiz(page, "fr");
  await answerRange(page, 0, 5);
  const title = await byTestId(page, "question-title").textContent();

  await page.reload();
  await waitForQuestion(page, 5);
  await expect(byTestId(page, "question-title")).toHaveText(title ?? "");

  await byTestId(page, "quiz-restart").click();
  await byTestId(page, "quiz-restart-yes").click();
  await expect(byTestId(page, "quiz-start")).toBeVisible();
  await expect(page.getByText("On reprend depuis le début.").first()).toBeAttached();
});

test("changer de langue en plein questionnaire garde la progression [F-02]", async ({ page }) => {
  await startQuiz(page, "fr");
  await answerRange(page, 0, 3);
  await openMenu(page);
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/quiz$/);
  await waitForQuestion(page, 3);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("navigation complète au clavier [F-15]", async ({ page, isMobile }) => {
  test.skip(isMobile, "Pas de clavier physique sur mobile.");
  await startQuiz(page, "en");
  await page.keyboard.press("ArrowDown");
  await expect(answerButtons(page).first()).toBeFocused();
  await page.keyboard.press("2");
  await waitForQuestion(page, 1);
  await page.keyboard.press("ArrowLeft");
  await waitForQuestion(page, 1);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(answerButtons(page).nth(1)).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowRight");
  for (let i = 1; i < TOTAL; i++) {
    await waitForQuestion(page, i);
    await page.keyboard.press("1");
  }
  await expect(page).toHaveURL(RESULT_URL);
});

test("dossier complet : verdict rappelé, réponses modifiables, nouvel entretien", async ({
  page,
}) => {
  await startQuiz(page, "en");
  await answerRange(page, 0, TOTAL);
  await expect(page).toHaveURL(RESULT_URL);
  const url = new URL(page.url()).pathname;

  // De retour sur le questionnaire : le dossier complet, avec le lien vers le verdict.
  await page.goto("/en/quiz");
  await expect(byTestId(page, "quiz-verdict")).toHaveAttribute("href", url);
  // L'accueil rappelle le dernier verdict.
  await page.goto("/en");
  await expect(page.getByRole("link", { name: "See my last verdict" })).toHaveAttribute(
    "href",
    url,
  );

  // « Revoir mes réponses » rouvre la dernière question, réponse cochée.
  await page.goto("/en/quiz");
  await byTestId(page, "quiz-review").click();
  await expect(byTestId(page, "question-title")).toBeFocused();
  await expect(page.locator("#content ol:visible button[aria-pressed=true]")).toHaveCount(1);
  await answerButtons(page).first().click();
  await expect(page).toHaveURL(RESULT_URL);

  // « Passer l'entretien » depuis le verdict efface le dossier complet.
  await page.getByRole("link", { name: "Take the interview" }).click();
  await expect(page).toHaveURL(/\/en\/quiz$/);
  await expect(byTestId(page, "quiz-start")).toBeVisible();
});
