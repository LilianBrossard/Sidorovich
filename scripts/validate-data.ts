// Usage : npm run validate (lancé automatiquement avant `npm run build`)
// Fait échouer le build si les données du questionnaire sont incohérentes [S-02].
import { checkData } from "../src/data/check";

const problems = checkData();
if (problems.length > 0) {
  console.error(`✘ Données du questionnaire invalides (${problems.length}) :`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log("✔ Données du questionnaire valides.");
