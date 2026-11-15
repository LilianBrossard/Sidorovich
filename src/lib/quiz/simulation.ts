// Personas simulées et calibration des centres. Voir docs/02-questionnaire.md, section 4.3.
import { AXIS_KEYS, FACTION_KEYS } from "./domain";
import { compile, computeProfile, dot } from "./engine";
import type { Rng } from "./random";
import { createRng } from "./random";
import type { CalibrationParams, Centers, Factions, Questionnaire, Vector } from "./types";

export const clamp = (v: number): number => Math.max(-1, Math.min(1, v));

/**
 * Réponses d'une persona aux convictions `beliefs` ∈ [-1, 1]^7. Pour chaque question,
 * l'option i est choisie avec une probabilité ∝ exp(beta · alignement(option i, beliefs)).
 * beta élevé = réponses cohérentes ; beta faible = réponses hésitantes.
 */
export function answerAs(
  questionnaire: Questionnaire,
  beliefs: Vector,
  beta: number,
  rng: Rng,
): number[] {
  return compile(questionnaire).options.map((options) => {
    const weights = options.map((o) =>
      Math.exp(
        beta *
          dot(
            o.map((v) => v / 2),
            beliefs,
          ),
      ),
    );
    let x = rng.next() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < weights.length; i++) {
      x -= weights[i];
      if (x <= 0) return i;
    }
    return weights.length - 1;
  });
}

/** Profil déclaré + bruit gaussien, borné à [-1, 1]. */
export const noisyBeliefs = (profile: Vector, sigma: number, rng: Rng): number[] =>
  profile.map((v) => clamp(v + sigma * rng.gaussian()));

export const DEFAULT_CALIBRATION: CalibrationParams = {
  samples: 3000,
  sigma: 0.3,
  beta: 3,
  seed: 42,
};

/**
 * Centre de chaque faction = profil moyen obtenu par des personas proches de son profil
 * déclaré. Les centres se placent ainsi là où arrivent de vrais répondants, et non sur des
 * extrêmes inatteignables. Déterministe pour des paramètres donnés [S-03].
 */
export function calibrate(
  questionnaire: Questionnaire,
  factions: Factions,
  params: CalibrationParams = DEFAULT_CALIBRATION,
): Record<(typeof FACTION_KEYS)[number], number[]> {
  const rng = createRng(params.seed);
  const centers = {} as Record<(typeof FACTION_KEYS)[number], number[]>;
  for (const faction of FACTION_KEYS) {
    const mean = new Array<number>(AXIS_KEYS.length).fill(0);
    for (let i = 0; i < params.samples; i++) {
      const beliefs = noisyBeliefs(factions[faction].profile, params.sigma, rng);
      computeProfile(questionnaire, answerAs(questionnaire, beliefs, params.beta, rng)).forEach(
        (v, axis) => (mean[axis] += v / params.samples),
      );
    }
    centers[faction] = mean;
  }
  return centers;
}

/** Arrondi stocké dans les fichiers de centres (4 décimales). */
export const roundCenters = (centers: Centers): Record<(typeof FACTION_KEYS)[number], number[]> =>
  Object.fromEntries(
    FACTION_KEYS.map((f) => [f, centers[f].map((v) => Math.round(v * 1e4) / 1e4)]),
  ) as Record<(typeof FACTION_KEYS)[number], number[]>;
