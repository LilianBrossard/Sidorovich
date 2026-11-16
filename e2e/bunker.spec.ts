import { expect, test } from "@playwright/test";

// Fond vidéo du bunker : lecture muette en boucle, bouton pause (WCAG 2.2.2) et respect de
// la réduction des animations [V-06].

const POSTER = 'img[src="/media/bunker/sidorovich-poster.webp"]';

test("la vidéo joue en boucle, sans son, et se met en pause", async ({ page }) => {
  await page.goto("/fr");
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0.3), {
      timeout: 15_000,
    })
    .toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);

  await page.getByRole("button", { name: "Mettre la vidéo en pause" }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.getByRole("button", { name: "Relancer la vidéo" })).toBeVisible();
});

test("animations réduites : image fixe seule, vidéo jamais téléchargée", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const videoRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)$/.test(new URL(request.url()).pathname)) videoRequests.push(request.url());
  });
  await page.goto("/fr");
  await expect(page.locator(POSTER)).toBeVisible();
  await page.waitForTimeout(1000);
  expect(await page.locator("video source").count()).toBe(0);
  expect(videoRequests).toEqual([]);
});
