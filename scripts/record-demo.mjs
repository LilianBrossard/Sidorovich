// Capture animée et captures mobiles du README (docs/images/).
//
// Prérequis, une seule fois (outils hors dépendances du projet) :
//   npm install --no-save gifenc pngjs
// Puis, sur un build de production lancé localement :
//   npm run build && npm run start -- --port 3300
//   npm run demo -- http://localhost:3300
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

let GIFEncoder, quantize, applyPalette, PNG;
try {
  // Paquets CommonJS : leurs fonctions sont dans l'export par défaut.
  const gifenc = await import("gifenc");
  ({ GIFEncoder, quantize, applyPalette } = gifenc.default ?? gifenc);
  const pngjs = await import("pngjs");
  ({ PNG } = pngjs.default ?? pngjs);
} catch {
  console.error("Outils absents : npm install --no-save gifenc pngjs");
  process.exit(1);
}

const base = process.argv[2] ?? "http://localhost:3300";
const OUT = "docs/images";
const WIDTH = 960;
const HEIGHT = 600;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
// Animations réduites : chaque image est nette, sans état intermédiaire.
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  reducedMotion: "reduce",
  locale: "fr-FR",
});
const page = await context.newPage();

/** Images du GIF : capture PNG décodée, et durée d'affichage en millisecondes. */
const frames = [];
async function frame(delay) {
  await page.waitForTimeout(400);
  const png = PNG.sync.read(await page.screenshot());
  frames.push({ data: png.data, delay });
}
const answer = async (position) => {
  await page.locator("#content ol:visible button").nth(position).click();
};

await page.goto(`${base}/fr`);
await frame(2200);
await page.getByRole("link", { name: "Commencer l’entretien" }).first().click();
await page.getByTestId("quiz-start").click();
await frame(1600);
await answer(3);
await frame(1800);
for (let i = 1; i < 12; i++) await answer(i % 4);
await frame(1800);
for (let i = 12; i < 23; i++) await answer((i + 1) % 4);
await frame(1200);
await answer(0);
await page.waitForURL(/\/r\//);
await frame(2600);
await page.mouse.wheel(0, 760);
await frame(2400);
await page.mouse.wheel(0, 900);
await frame(2400);

const gif = GIFEncoder();
for (const { data, delay } of frames) {
  const palette = quantize(data, 256);
  gif.writeFrame(applyPalette(data, palette), WIDTH, HEIGHT, { palette, delay });
}
gif.finish();
writeFileSync(`${OUT}/demo.gif`, gif.bytes());
console.log(`demo.gif : ${frames.length} images, ${(gif.bytes().length / 1024).toFixed(0)} Ko`);

// Trois écrans mobiles côte à côte : accueil, dossier, PDA.
const mobile = await browser.newContext({
  viewport: { width: 390, height: 780 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
  locale: "fr-FR",
});
const phone = await mobile.newPage();
const shots = [];
async function shot() {
  await phone.waitForTimeout(400);
  shots.push((await phone.screenshot()).toString("base64"));
}
await phone.goto(`${base}/fr`);
await shot();
await phone.goto(`${base}/fr/quiz`);
await phone.getByTestId("quiz-start").click();
await phone.locator("#content ol:visible button").nth(3).click();
await shot();
await phone.goto(`${base}/fr/r/1C85I1jjhQcN`);
await shot();

const sheet = await browser.newPage({ viewport: { width: 1290, height: 860 } });
await sheet.setContent(`<body style="margin:0;background:#0d0d0b;display:flex;gap:30px;padding:40px">
  ${shots.map((s) => `<img src="data:image/png;base64,${s}" style="width:390px;height:780px;border-radius:18px">`).join("")}
</body>`);
writeFileSync(`${OUT}/mobile.png`, await sheet.screenshot());
console.log("mobile.png écrit");

await browser.close();
