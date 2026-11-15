// Point d'entrée des données du questionnaire pour le site.
import { decodeAnswers, encodeAnswers, type DecodeError } from "@/lib/quiz/encoding";
import { evaluate } from "@/lib/quiz/engine";
import type { Answers, CentersFile, QuizResult } from "@/lib/quiz/types";
import centersV1 from "./centers.v1.json";
import {
  CURRENT_QUESTIONNAIRE,
  QUESTIONNAIRES,
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
