import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { answerRange, HYBRID_CODE, startQuiz } from "./helpers";

// Audit d'accessibilité automatisé [T-06] : 0 violation WCAG 2.1 A et AA (axe-core).
// Les lecteurs d'écran (NVDA, VoiceOver) restent à tester à la main.

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function audit(page: Page, label: string) {
  // Les animations d'entrée sont terminées avant l'analyse des contrastes.
  await page.waitForTimeout(1200);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary, label).toEqual([]);
}

for (const locale of ["fr", "uk"]) {
  test(`${locale} : pages de contenu sans violation`, async ({ page }) => {
    for (const path of ["", "/factions", "/how-it-works", "/about", "/nulle-part"]) {
      await page.goto(`/${locale}${path}`);
      await audit(page, `/${locale}${path}`);
    }
  });

  test(`${locale} : questionnaire et résultat sans violation`, async ({ page }) => {
    await startQuiz(page, locale);
    await audit(page, "question 1");
    await answerRange(page, 0, 13, () => 1);
    await audit(page, "question 14, avec une réplique");
    await page.goto(`/${locale}/r/${HYBRID_CODE}`);
    await audit(page, "résultat");
    await page.goto(`/${locale}/r/code-faux`);
    await audit(page, "code invalide");
  });
}

test("menu mobile ouvert sans violation", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Le menu repliable n'existe que sur mobile.");
  await page.goto("/fr");
  await page.getByTestId("menu-toggle").click();
  await audit(page, "menu ouvert");
});
