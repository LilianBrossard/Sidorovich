// Point d'entrée des données du questionnaire pour le site.
import { archetypeAnswers } from "@/lib/quiz/balance";
import { FACTION_KEYS, type FactionKey } from "@/lib/quiz/domain";
import { decodeAnswers, encodeAnswers, type DecodeError } from "@/lib/quiz/encoding";
import { evaluate } from "@/lib/quiz/engine";
import type { Answers, CentersFile, QuizResult } from "@/lib/quiz/types";
import centersV1 from "./centers.v1.json";
import { FACTIONS } from "./factions";
import {
  CURRENT_QUESTIONNAIRE,
  QUESTIONNAIRES,
  RETIRED_CODE_CHARS,
  type VersionId,
  type VersionedQuestionnaire,
} from "./questionnaires";

export { FACTIONS } from "./factions";
export { CURRENT_QUESTIONNAIRE, QUESTIONNAIRES, type VersionId } from "./questionnaires";

/** Centres calibrés de chaque version (fichiers générés par `npm run calibrate`). */
export const CENTERS_FILES: Readonly<Record<VersionId, CentersFile>> = {
  v1: centersV1 as CentersFile,
};

/** Code d'URL pour des réponses au questionnaire courant. */
export const resultCode = (answers: Answers): string =>
  encodeAnswers(CURRENT_QUESTIONNAIRE, answers);

export type ResultFromCode =
  | {
      readonly ok: true;
      readonly questionnaire: VersionedQuestionnaire;
      readonly answers: number[];
      readonly result: QuizResult;
    }
  | { readonly ok: false; readonly error: DecodeError };

/** Recalcule le résultat d'un lien partagé, quelle que soit sa version [F-25] [F-26]. */
export function resultFromCode(code: string): ResultFromCode {
  const decoded = decodeAnswers(QUESTIONNAIRES, code);
  if (!decoded.ok) return decoded;
  const { questionnaire, answers } = decoded;
  return {
    ok: true,
    questionnaire,
    answers,
    result: evaluate(questionnaire, CENTERS_FILES[questionnaire.version].centers, answers),
  };
}

/** Vrai si le code vient d'une version retirée du questionnaire [F-26]. */
export const isRetiredCode = (code: string): boolean => RETIRED_CODE_CHARS.includes(code.charAt(0));

/**
 * Code du « dossier type » d'une faction : les réponses qu'elle donnerait elle-même
 * (critère C1). Ces 12 résultats sont pré-rendus au build.
 */
export const archetypeCode = (faction: FactionKey): string =>
  resultCode(archetypeAnswers(CURRENT_QUESTIONNAIRE, FACTIONS[faction].profile));

const ARCHETYPE_CODES: ReadonlySet<string> = new Set(FACTION_KEYS.map(archetypeCode));

/**
 * Vrai pour les 12 dossiers types : ce sont de vraies pages de faction, indexées et listées
 * dans le sitemap. Les autres résultats ne le sont pas (combinaisons infinies) [T-08].
 */
export const isArchetypeCode = (code: string): boolean => ARCHETYPE_CODES.has(code);
