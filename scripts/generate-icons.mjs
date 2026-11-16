// Génère les icônes PNG et le favicon.ico à partir de src/app/icon.svg (npm run icons).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/package.json");
const { chromium } = require("@playwright/test");

const svg = readFileSync("src/app/icon.svg", "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
async function png(size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`,
  );
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
const sizes = {
  16: await png(16),
  32: await png(32),
  48: await png(48),
  180: await png(180),
  192: await png(192),
  512: await png(512),
};
await browser.close();

writeFileSync("src/app/apple-icon.png", sizes[180]);
mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", sizes[192]);
writeFileSync("public/icons/icon-512.png", sizes[512]);

// ICO : en-tête, répertoire, puis les PNG tels quels (format accepté depuis Windows Vista).
const images = [16, 32, 48].map((s) => ({ s, data: sizes[s] }));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map(({ s, data }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});
writeFileSync(
  "src/app/favicon.ico",
  Buffer.concat([header, ...entries, ...images.map((i) => i.data)]),
);
console.log("icônes écrites");
