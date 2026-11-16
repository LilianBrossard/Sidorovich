import { expect, type Page } from "@playwright/test";

export const LOCALES = ["fr", "en", "uk", "ru"] as const;
export const TOTAL = 24;

/** Code réel d'un résultat hybride : Mercenaires 67,4 %, Solitaires 66,5 % [F-24]. */
export const HYBRID_CODE = "1C85I1jjhQcN";

export const RESULT_URL = /\/(fr|en|uk|ru)\/r\/[A-Za-z0-9_-]{12}$/;

const progress = (page: Page) => page.getByRole("progressbar");
/**
 * Next.js garde les pages quittées dans le DOM, masquées (composant Activity) :
 * on ne cible que les éléments visibles.
 */
export const title = (page: Page) => page.getByRole("heading", { level: 1 });
export const answerButtons = (page: Page) => page.locator("#content ol:visible button");
export const byTestId = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

/** Ouvre le questionnaire sur une partie neuve. */
export async function startQuiz(page: Page, locale: string) {
  await page.goto(`/${locale}/quiz`);
  await byTestId(page, "quiz-start").click();
  await expect(progress(page)).toHaveAttribute("aria-valuenow", "0");
}

/** Attend que la question n (à partir de 0) soit affichée. */
export async function waitForQuestion(page: Page, index: number) {
  await expect(byTestId(page, "question-title")).toBeVisible();
  await expect(progress(page)).toHaveAttribute("aria-valuenow", String(index));
}

/** Répond aux questions de `from` à `to` (exclu) en cliquant ; `pick` choisit la position. */
export async function answerRange(
  page: Page,
  from: number,
  to: number,
  pick: (index: number, count: number) => number = () => 0,
) {
  for (let i = from; i < to; i++) {
    await waitForQuestion(page, i);
    const buttons = answerButtons(page);
    const count = await buttons.count();
    await buttons.nth(pick(i, count) % count).click();
  }
}

/** Sur mobile, les liens et les langues sont dans le menu : on l’ouvre s’il est fermé. */
export async function openMenu(page: Page) {
  const toggle = byTestId(page, "menu-toggle");
  if ((await toggle.count()) === 0) return;
  // Un clic avant l'hydratation de React est perdu (WebKit est plus lent) : on réessaie.
  await expect(async () => {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
  }).toPass({ timeout: 10_000 });
}
