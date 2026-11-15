// Usage : npm run calibrate
// Recalcule les centres calibrés de chaque version du questionnaire et les écrit dans
// src/data/centers.{version}.json. Déterministe : deux exécutions donnent le même fichier [S-03].
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import { CALIBRATION_PARAMS, calibrationFingerprint } from "../src/data/calibration";
import { FACTIONS } from "../src/data/factions";
import { QUESTIONNAIRES } from "../src/data/questionnaires";
import { calibrate, roundCenters } from "../src/lib/quiz/simulation";
import type { CentersFile } from "../src/lib/quiz/types";

async function main() {
  for (const questionnaire of QUESTIONNAIRES) {
    const started = performance.now();
    const file: CentersFile = {
      version: questionnaire.version,
      inputFingerprint: calibrationFingerprint(questionnaire),
      params: CALIBRATION_PARAMS,
      centers: roundCenters(calibrate(questionnaire, FACTIONS, CALIBRATION_PARAMS)),
    };

    const path = fileURLToPath(
      new URL(`../src/data/centers.${questionnaire.version}.json`, import.meta.url),
    );
    const json = await format(JSON.stringify(file), {
      ...(await resolveConfig(path)),
      filepath: path,
    });
    writeFileSync(path, json, "utf8");
    console.log(
      `${questionnaire.version} : centres écrits dans ${path} (${Math.round(performance.now() - started)} ms)`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
