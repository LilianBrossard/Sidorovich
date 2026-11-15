// Constantes du modèle de score. Voir docs/02-questionnaire.md, section 4.

/** Les 7 axes de valeurs, dans l'ordre des vecteurs de profil. */
export const AXIS_KEYS = ["ORD", "ALT", "COL", "FOI", "FOR", "ZON", "IDE"] as const;
export type AxisKey = (typeof AXIS_KEYS)[number];

/** Les 12 factions. */
export const FACTION_KEYS = [
  "SOL",
  "DEV",
  "LIB",
  "BAN",
  "MER",
  "MON",
  "ECO",
  "MIL",
  "CS",
  "WAR",
  "SPA",
  "NOO",
] as const;
export type FactionKey = (typeof FACTION_KEYS)[number];

/** Identifiants stables des 4 réponses d'une question à choix (ordre d'origine, avant mélange). */
export const CHOICE_ANSWER_IDS = ["a", "b", "c", "d"] as const;
export type ChoiceAnswerId = (typeof CHOICE_ANSWER_IDS)[number];

/**
 * Échelle d'accord à 5 niveaux, de « Pas du tout d'accord » à « Tout à fait d'accord ».
 * Chaque niveau multiplie les deltas de la question ; « Sans avis » vaut 0.
 */
export const SCALE_LEVELS = [
  "stronglyDisagree",
  "disagree",
  "neutral",
  "agree",
  "stronglyAgree",
] as const;
export const SCALE_FACTORS = [-1, -0.5, 0, 0.5, 1] as const;

export const QUESTION_KINDS = [
  "dilemma",
  "situation",
  "society",
  "statement",
  "preference",
  "values",
] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

/** Bornes des deltas d'une réponse sur un axe. */
export const DELTA_MIN = -2;
export const DELTA_MAX = 2;

/** Écart de compatibilité (en points) sous lequel le résultat est présenté comme hybride [F-24]. */
export const HYBRID_THRESHOLD = 3;

/** Jeux où apparaît une faction. */
export const GAME_IDS = ["soc", "cs", "cop", "s2"] as const;
export type GameId = (typeof GAME_IDS)[number];
