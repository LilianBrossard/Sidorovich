// Usage : npm run balance
// Affiche les indicateurs d'équilibrage du questionnaire courant.
// Code de sortie 1 si un critère C1 à C6 échoue (cahier des charges, section 5.3).
import { CENTERS_FILES, CURRENT_QUESTIONNAIRE, FACTIONS } from "../src/data";
import { FACTION_KEYS } from "../src/lib/quiz/domain";
import { runBalance } from "../src/lib/quiz/balance";

const { version } = CURRENT_QUESTIONNAIRE;
const centers = CENTERS_FILES[version].centers;
const report = runBalance(CURRENT_QUESTIONNAIRE, FACTIONS, centers);
const pct = (v: number) => `${v.toFixed(1).padStart(5)} %`;

console.log(`== Questionnaire ${version} ==\n`);

console.log("Couverture des axes");
for (const c of report.coverage) {
  console.log(
    `  ${c.axis} : ${c.questions} questions (max + ${c.maxPositive}, max − ${c.maxNegative})`,
  );
}

console.log("\nArchétypes");
for (const a of report.archetypes) {
  console.log(
    `  ${a.faction.padEnd(3)} → ${a.top.faction.padEnd(3)} ${a.top.compatibility.toFixed(0)} %  (2e ${a.second.faction} ${a.second.compatibility.toFixed(0)} %) ${a.ok ? "OK" : "ÉCHEC"}`,
  );
}

console.log("\nReconnaissance (personas proches, σ = 0,3)");
for (const r of report.recognition) {
  const confusions = r.confusions.map((c) => `${c.faction} ${pct(c.rate)}`).join(", ");
  console.log(`  ${r.faction.padEnd(3)} ${pct(r.rate)}  confusions : ${confusions}`);
}

console.log("\nRépartition (personas uniformes)");
console.log(`  ${FACTION_KEYS.map((f) => `${f} ${pct(report.share[f])}`).join(" | ")}`);
console.log(`  Résultats hybrides : ${pct(report.hybridShare)}`);

console.log("\nCritères");
for (const check of report.checks) {
  console.log(`  ${check.ok ? "✔" : "✘"} ${check.id} ${check.label} : ${check.value}`);
}
process.exit(report.checks.every((c) => c.ok) ? 0 : 1);
