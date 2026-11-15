import { expect, test } from "@playwright/test";
import { HYBRID_CODE, LOCALES, title } from "./helpers";

const PAGES = ["", "/quiz", "/factions", "/how-it-works", "/about", `/r/${HYBRID_CODE}`];

test("le bouton « Commencer » est visible sans défilement en 360 × 640 [F-01]", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/fr");
  const cta = page.getByRole("link", { name: "Commencer l’entretien" });
  await expect(cta).toBeInViewport();
});

test("aucun défilement horizontal à 360 px [V-07]", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const locale of LOCALES) {
    for (const path of PAGES) {
      await page.goto(`/${locale}${path}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `/${locale}${path}`).toBeLessThanOrEqual(0);
    }
  }
});

test("chaque page a un titre de niveau 1 et le sélecteur de langue [F-02] [F-03]", async ({
  page,
}) => {
  for (const path of PAGES) {
    await page.goto(`/uk${path}`);
    await expect(title(page)).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Русский" })).toBeVisible();
    await expect(page.locator("footer")).toContainText("GSC Game World");
  }
});

test("page Factions : 12 fiches, chacune avec son dossier type [F-30]", async ({ page }) => {
  await page.goto("/en/factions");
  const cards = page.locator("#content li article");
  await expect(cards).toHaveCount(12);
  await cards.first().getByRole("link").click();
  await expect(title(page)).toHaveText("Loners");
});

test("une URL inconnue affiche la 404 dans la bonne langue [F-33]", async ({ page }) => {
  const response = await page.goto("/ru/nulle-part");
  expect(response?.status()).toBe(404);
  await expect(title(page)).toHaveText("Осторожно, аномалия…");
});
