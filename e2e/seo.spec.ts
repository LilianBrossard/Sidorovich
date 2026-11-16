import { expect, test, type Page } from "@playwright/test";
import { HYBRID_CODE } from "./helpers";

// Partage et référencement [F-28] [T-08] [I-06]. Les adresses absolues pointent vers la
// production : on ne garde que le chemin pour interroger le serveur de test.

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute("content");
const pathOf = (url: string | null) => {
  const { pathname, search } = new URL(url ?? "");
  return pathname + search;
};

test.describe("partage et référencement", () => {
  test.skip(({ isMobile }) => isMobile, "Balises identiques sur mobile.");

  test("accueil : canonique, 4 langues + x-default, image par défaut de la langue", async ({
    page,
    request,
  }) => {
    await page.goto("/uk");
    expect(pathOf(await page.locator('link[rel="canonical"]').getAttribute("href"))).toBe("/uk");
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
    expect(await meta(page, "og:locale")).toBe("uk_UA");
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");

    const image = pathOf(await meta(page, "og:image"));
    expect(image).toBe("/uk/opengraph-image/default");
    const response = await request.get(image);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("résultat : image du verdict, texte alternatif traduit, page non indexée [F-28]", async ({
    page,
    request,
  }) => {
    await page.goto(`/fr/r/${HYBRID_CODE}`);
    expect(await meta(page, "robots")).toBe("noindex, follow");
    expect(await meta(page, "og:title")).toContain("Mercenaires");
    // Espaces insécables du français (« 67 % », « : ») : \s les accepte.
    expect(await meta(page, "og:image:alt")).toMatch(
      /^Verdict de Sidorovich\s:\sMercenaires,\s67\s%\sde compatibilité\.$/,
    );
    expect(await meta(page, "og:image:width")).toBe("1200");
    expect(await meta(page, "og:image:height")).toBe("630");

    const image = pathOf(await meta(page, "og:image"));
    expect(image).toContain(`/fr/r/${HYBRID_CODE}/opengraph-image`);
    const response = await request.get(image);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect((await response.body()).length).toBeGreaterThan(10_000);
  });

  test("sitemap : 5 pages et 12 dossiers types × 4 langues, avec leurs équivalents", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml.match(/<url>/g)).toHaveLength(68);
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).not.toContain(`/r/${HYBRID_CODE}`);
  });

  test("seuls les dossiers types sont indexés", async ({ page }) => {
    await page.goto("/en/factions");
    await page.locator("#content li article").first().getByRole("link").click();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });

  test("robots, manifeste et icônes", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.icons).toHaveLength(3);
    for (const path of ["/favicon.ico", "/icon.svg", "/apple-icon.png", "/icons/icon-512.png"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });
});
