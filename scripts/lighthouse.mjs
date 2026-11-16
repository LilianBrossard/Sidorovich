// Mesure Lighthouse (mobile) des 3 pages clés [T-03] [T-04] : médiane de 3 passages.
//
// Prérequis, une seule fois (Lighthouse n'est pas une dépendance du projet) :
//   npm install --no-save lighthouse@12
// Puis, sur un build de production lancé localement :
//   NEXT_PUBLIC_SITE_URL=http://localhost:3300 npm run build && npm run start -- --port 3300
//   npm run lighthouse -- http://localhost:3300
// (NEXT_PUBLIC_SITE_URL rend la balise canonique valide pour l'audit SEO.)
//
// Chromium est lancé par Playwright et Lighthouse s'y connecte : ainsi, aucun Chrome à
// installer, et cela fonctionne là où Lighthouse ne peut pas lancer Chrome lui-même.
import { chromium } from "@playwright/test";

let lighthouse;
try {
  ({ default: lighthouse } = await import("lighthouse"));
} catch {
  console.error("Lighthouse est absent : npm install --no-save lighthouse@12");
  process.exit(1);
}

const base = process.argv[2] ?? "http://localhost:3300";
const PAGES = {
  accueil: "/fr",
  questionnaire: "/fr/quiz",
  "résultat (dossier type)": "/fr/r/1Adv4hDuBfXq",
  "résultat ordinaire (non indexé)": "/fr/r/1C85I1jjhQcN",
};
const PORT = 9333;

const browser = await chromium.launch({ args: [`--remote-debugging-port=${PORT}`] });
try {
  for (const [name, path] of Object.entries(PAGES)) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const { lhr } = await lighthouse(base + path, {
        port: PORT,
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      });
      runs.push(lhr);
    }
    runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
    const lhr = runs[1];
    const score = (key) => Math.round(lhr.categories[key].score * 100);
    const value = (key) => lhr.audits[key].displayValue;
    console.log(
      `${name} : performance ${score("performance")} · accessibilité ${score("accessibility")}` +
        ` · bonnes pratiques ${score("best-practices")} · SEO ${score("seo")}` +
        ` | LCP ${value("largest-contentful-paint")} · CLS ${value("cumulative-layout-shift")}` +
        ` · TBT ${value("total-blocking-time")}`,
    );
  }
} finally {
  await browser.close();
}
