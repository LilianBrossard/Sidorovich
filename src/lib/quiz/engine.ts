// Moteur de score : fonctions pures, sans DOM, réseau ni horloge [S-01].
// Réponses → deltas par axe → profil normalisé dans [-1, 1]^7
// → distance euclidienne au centre de chaque faction → classement et compatibilité.
import { AXIS_KEYS, FACTION_KEYS, HYBRID_THRESHOLD, SCALE_FACTORS } from "./domain";
import type {
  Answers,
  Centers,
  Deltas,
  Question,
  Questionnaire,
  QuizResult,
  RankedFaction,
  Vector,
} from "./types";

const toVector = (deltas: Deltas): number[] => AXIS_KEYS.map((axis) => deltas[axis] ?? 0);

/** Options d'une question, chacune sous forme de vecteur de deltas. */
export function questionOptions(question: Question): number[][] {
  return question.type === "scale"
    ? SCALE_FACTORS.map((factor) => toVector(question.deltas).map((v) => factor * v))
    : question.answers.map((answer) => toVector(answer.deltas));
}

export interface CompiledQuestionnaire {
  readonly options: readonly (readonly Vector[])[];
  /** Nombre d'options par question (base de l'encodage des résultats). */
  readonly radices: readonly number[];
  /** Total maximal atteignable vers le pôle + de chaque axe. */
  readonly maxPositive: Vector;
  /** Total maximal atteignable vers le pôle − de chaque axe (valeur positive). */
  readonly maxNegative: Vector;
}

const cache = new WeakMap<Questionnaire, CompiledQuestionnaire>();

/** Précalcule options et bornes ; le résultat est mis en cache par questionnaire. */
export function compile(questionnaire: Questionnaire): CompiledQuestionnaire {
  const cached = cache.get(questionnaire);
  if (cached) return cached;

  const options = questionnaire.questions.map(questionOptions);
  const bound = (sign: 1 | -1) =>
    AXIS_KEYS.map((_, axis) =>
      options.reduce((sum, opts) => sum + Math.max(0, ...opts.map((o) => sign * o[axis])), 0),
    );
  const compiled = {
    options,
    radices: options.map((opts) => opts.length),
    maxPositive: bound(1),
    maxNegative: bound(-1),
  };
  cache.set(questionnaire, compiled);
  return compiled;
}

/** Vrai si `answers` contient une réponse valide pour chaque question. */
export function isCompleteAnswers(questionnaire: Questionnaire, answers: Answers): boolean {
  const { radices } = compile(questionnaire);
  return (
    answers.length === radices.length &&
    answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < radices[i])
  );
}

/**
 * Ramène un total (ou une contribution) entre -1 et +1 avec des bornes asymétriques :
 * chaque pôle de chaque axe reste atteignable même si les questions ne sont pas symétriques.
 */
export function normalize(questionnaire: Questionnaire, raw: Vector): number[] {
  const { maxPositive, maxNegative } = compile(questionnaire);
  return raw.map((v, axis) => {
    const bound = v >= 0 ? maxPositive[axis] : maxNegative[axis];
    return bound === 0 ? 0 : v / bound;
  });
}

/** Profil du candidat : vecteur de 7 valeurs dans [-1, 1]. */
export function computeProfile(questionnaire: Questionnaire, answers: Answers): number[] {
  if (!isCompleteAnswers(questionnaire, answers)) {
    throw new RangeError("Réponses incomplètes ou hors limites.");
  }
  const { options } = compile(questionnaire);
  const totals = new Array<number>(AXIS_KEYS.length).fill(0);
  answers.forEach((choice, question) =>
    options[question][choice].forEach((v, axis) => (totals[axis] += v)),
  );
  return normalize(questionnaire, totals);
}

export const distance = (a: Vector, b: Vector): number =>
  Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));

export const dot = (a: Vector, b: Vector): number => a.reduce((sum, v, i) => sum + v * b[i], 0);

/** Distance du centre de l'espace à un sommet : √7. Au-delà, la compatibilité vaut 0 %. */
export const REFERENCE_DISTANCE = Math.sqrt(AXIS_KEYS.length);

/** Compatibilité en % : 100 à distance nulle, 0 à √7 ou plus. */
export const compatibility = (d: number): number => 100 * Math.max(0, 1 - d / REFERENCE_DISTANCE);

/** Les 12 factions triées de la plus proche à la plus éloignée. */
export function rankFactions(profile: Vector, centers: Centers): RankedFaction[] {
  return FACTION_KEYS.map((faction) => {
    const d = distance(profile, centers[faction]);
    return { faction, distance: d, compatibility: compatibility(d) };
  }).sort(
    (x, y) =>
      x.distance - y.distance || FACTION_KEYS.indexOf(x.faction) - FACTION_KEYS.indexOf(y.faction),
  );
}

/** Résultat complet d'une partie. */
export function evaluate(
  questionnaire: Questionnaire,
  centers: Centers,
  answers: Answers,
): QuizResult {
  const profile = computeProfile(questionnaire, answers);
  const ranking = rankFactions(profile, centers);
  const [top, runnerUp] = ranking;
  return {
    profile,
    ranking,
    top,
    runnerUp,
    isHybrid: top.compatibility - runnerUp.compatibility < HYBRID_THRESHOLD,
  };
}
