// Déroulé d'une partie : fonctions pures, testées sans navigateur [F-11] [F-13] [F-14].
// L'état tient en quelques nombres ; il est sauvegardé tel quel dans le navigateur.
import { compile, isCompleteAnswers } from "./engine";
import { createRng } from "./random";
import type { Answers, Questionnaire } from "./types";

export interface QuizSession {
  /** Version du questionnaire de la partie. */
  readonly version: string;
  /** Graine du mélange des réponses : l'ordre reste stable pendant toute la partie [F-11]. */
  readonly seed: number;
  /** Pour chaque question, l'indice de l'option d'origine choisie, ou null. */
  readonly answers: readonly (number | null)[];
  /** Question affichée ; vaut le nombre de questions quand le dossier est complet. */
  readonly current: number;
}

export type QuizAction =
  /** Répond à la question affichée, puis passe à la suivante. */
  | { readonly type: "answer"; readonly option: number }
  | { readonly type: "back" }
  /** Avance d'une question, seulement si la question affichée a déjà une réponse. */
  | { readonly type: "forward" };

export function newSession(questionnaire: Questionnaire, seed: number): QuizSession {
  return {
    version: questionnaire.version,
    seed: seed >>> 0,
    answers: questionnaire.questions.map(() => null),
    current: 0,
  };
}

export const isComplete = (questionnaire: Questionnaire, session: QuizSession): boolean =>
  session.current === questionnaire.questions.length &&
  isCompleteAnswers(questionnaire, session.answers as Answers);

/** Réponses de la partie si elle est complète, sinon null. */
export function completedAnswers(
  questionnaire: Questionnaire,
  session: QuizSession,
): Answers | null {
  return isComplete(questionnaire, session) ? (session.answers as Answers) : null;
}

/** Nombre de questions qui ont une réponse. */
export const answeredCount = (session: QuizSession): number =>
  session.answers.filter((answer) => answer !== null).length;

export function reduceSession(
  questionnaire: Questionnaire,
  session: QuizSession,
  action: QuizAction,
): QuizSession {
  const total = questionnaire.questions.length;
  const { radices } = compile(questionnaire);
  const { current } = session;

  switch (action.type) {
    case "answer": {
      if (current >= total) return session;
      const { option } = action;
      if (!Number.isInteger(option) || option < 0 || option >= radices[current]) return session;
      const answers = [...session.answers];
      answers[current] = option;
      return { ...session, answers, current: current + 1 };
    }
    case "back":
      return current > 0 ? { ...session, current: current - 1 } : session;
    case "forward":
      return current < total && session.answers[current] !== null
        ? { ...session, current: current + 1 }
        : session;
  }
}

/** Mélange les bits d'une graine (fmix32 de MurmurHash3) : deux graines voisines divergent. */
function mix32(seed: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Ordre d'affichage des options de chaque question : indices d'origine, mélangés par la graine.
 * Les échelles d'accord gardent leur ordre, du désaccord à l'accord.
 */
export function answerOrders(questionnaire: Questionnaire, seed: number): number[][] {
  const rng = createRng(mix32(seed));
  return questionnaire.questions.map((question, i) => {
    const order = Array.from({ length: compile(questionnaire).radices[i] }, (_, k) => k);
    if (question.type === "scale") return order;
    for (let k = order.length - 1; k > 0; k--) {
      const j = Math.floor(rng.next() * (k + 1));
      [order[k], order[j]] = [order[j], order[k]];
    }
    return order;
  });
}

const isIndex = (value: unknown, below: number): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < below;

/**
 * Relit une partie sauvegardée. Toute incohérence (autre version, réponse hors limites,
 * données corrompues) donne null : on repart d'une partie neuve plutôt que de planter.
 * Validation écrite à la main, sans Zod : ce code part dans le navigateur [T-05].
 */
export function parseSession(questionnaire: Questionnaire, raw: string | null): QuizSession | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;

  const { version, seed, answers, current } = data as Record<string, unknown>;
  const { radices } = compile(questionnaire);
  const valid =
    version === questionnaire.version &&
    isIndex(seed, 2 ** 32) &&
    Array.isArray(answers) &&
    answers.length === radices.length &&
    answers.every((a, i) => a === null || isIndex(a, radices[i])) &&
    isIndex(current, radices.length + 1) &&
    // On ne peut afficher une question que si toutes les précédentes ont une réponse.
    answers.slice(0, current).every((a) => a !== null);
  if (!valid) return null;
  return {
    version: questionnaire.version,
    seed: seed as number,
    answers: answers as (number | null)[],
    current: current as number,
  };
}

export const serializeSession = (session: QuizSession): string => JSON.stringify(session);
