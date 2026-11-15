import type { AxisKey, ChoiceAnswerId, FactionKey, GameId, QuestionKind } from "./domain";

/** Vecteur sur les 7 axes, dans l'ordre de AXIS_KEYS. */
export type Vector = readonly number[];

/** Effet d'une réponse : entiers de -2 à +2, axes absents = 0. */
export type Deltas = Readonly<Partial<Record<AxisKey, number>>>;

export interface ChoiceQuestion {
  readonly id: string;
  readonly type: "choice";
  readonly kind: Exclude<QuestionKind, "statement">;
  readonly answers: readonly { readonly id: ChoiceAnswerId; readonly deltas: Deltas }[];
}

/** Affirmation notée sur l'échelle d'accord ; `deltas` vaut pour « Tout à fait d'accord ». */
export interface ScaleQuestion {
  readonly id: string;
  readonly type: "scale";
  readonly kind: "statement";
  readonly deltas: Deltas;
}

export type Question = ChoiceQuestion | ScaleQuestion;

export interface Questionnaire {
  /** Identifiant de version, par exemple "v1". */
  readonly version: string;
  /** Caractère qui identifie la version dans les codes de résultat. */
  readonly codeChar: string;
  readonly questions: readonly Question[];
}

export interface FactionDefinition {
  /** Profil déclaré (intention de conception), valeurs dans [-1, 1]. */
  readonly profile: Vector;
  readonly games: readonly GameId[];
}

export type Factions = Readonly<Record<FactionKey, FactionDefinition>>;

/** Centres calibrés utilisés par le moteur. */
export type Centers = Readonly<Record<FactionKey, Vector>>;

export interface CalibrationParams {
  /** Personas simulées par faction. */
  readonly samples: number;
  /** Écart-type du bruit gaussien ajouté au profil déclaré. */
  readonly sigma: number;
  /** Cohérence des réponses simulées (plus haut = plus cohérent). */
  readonly beta: number;
  readonly seed: number;
}

export interface CentersFile {
  readonly version: string;
  /** Empreinte des entrées de la calibration : questionnaire, profils déclarés, paramètres. */
  readonly inputFingerprint: string;
  readonly params: CalibrationParams;
  readonly centers: Centers;
}

/** Réponses d'une partie : pour chaque question, l'indice de l'option d'origine. */
export type Answers = readonly number[];

export interface RankedFaction {
  readonly faction: FactionKey;
  readonly distance: number;
  /** Pourcentage de compatibilité, de 0 à 100, non arrondi. */
  readonly compatibility: number;
}

export interface QuizResult {
  readonly profile: Vector;
  /** Les 12 factions, de la plus compatible à la moins compatible. */
  readonly ranking: readonly RankedFaction[];
  readonly top: RankedFaction;
  readonly runnerUp: RankedFaction;
  /** Vrai si l'écart entre la 1re et la 2e faction est inférieur à HYBRID_THRESHOLD. */
  readonly isHybrid: boolean;
}
