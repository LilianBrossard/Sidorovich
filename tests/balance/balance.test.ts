// Critères d'équilibrage C1 à C6 (cahier des charges, section 5.3) : un échec bloque la fusion.
import { describe, expect, it } from "vitest";
import { CENTERS_FILES, CURRENT_QUESTIONNAIRE, FACTIONS } from "@/data/index";
import { runBalance } from "@/lib/quiz/balance";

const report = runBalance(
  CURRENT_QUESTIONNAIRE,
  FACTIONS,
  CENTERS_FILES[CURRENT_QUESTIONNAIRE.version].centers,
);

describe(`équilibrage du questionnaire ${CURRENT_QUESTIONNAIRE.version}`, () => {
  it.each(report.checks.map((check) => [check.id, check] as const))("%s", (_, check) => {
    expect(check.ok, `${check.label} : ${check.value}`).toBe(true);
  });
});
