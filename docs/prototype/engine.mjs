// Moteur de score — prototype de référence (JavaScript sans dépendance).
// Étapes : réponses -> deltas par axe -> vecteur normalisé u ∈ [-1, 1]^7
//          -> distance euclidienne à chaque centre de faction -> classement et % de compatibilité.
import { AXES, FACTIONS, QUESTIONS, SCALE_FACTORS } from './model.mjs';

export const AXIS_KEYS = AXES.map((a) => a.key);
export const FACTION_KEYS = Object.keys(FACTIONS);
const N_AXES = AXIS_KEYS.length;

// Chaque question devient une liste d'options ; chaque option est un vecteur de deltas.
export const OPTIONS = QUESTIONS.map((q) =>
  q.type === 'scale'
    ? SCALE_FACTORS.map((m) => AXIS_KEYS.map((a) => m * (q.v[a] ?? 0)))
    : q.answers.map((r) => AXIS_KEYS.map((a) => r.d[a] ?? 0)),
);

// Bornes asymétriques : total maximal atteignable vers le pôle + et vers le pôle - de chaque axe.
// Grâce à elles, chaque pôle peut réellement atteindre ±1.
export const MAX_POS = AXIS_KEYS.map((_, i) => OPTIONS.reduce((s, o) => s + Math.max(0, ...o.map((v) => v[i])), 0));
export const MAX_NEG = AXIS_KEYS.map((_, i) => OPTIONS.reduce((s, o) => s + Math.max(0, ...o.map((v) => -v[i])), 0));

const norm = (v, i) => (v >= 0 ? (MAX_POS[i] ? v / MAX_POS[i] : 0) : MAX_NEG[i] ? v / MAX_NEG[i] : 0);

/** choice[q] = index de l'option choisie pour la question q. */
export function profile(choice) {
  const sum = new Array(N_AXES).fill(0);
  choice.forEach((c, q) => OPTIONS[q][c].forEach((v, i) => (sum[i] += v)));
  return sum.map(norm);
}

/** Contribution normalisée d'une option au vecteur final (utile pour l'analyse d'impact). */
export const contribution = (option) => option.map(norm);

export const dist = (u, p) => Math.sqrt(u.reduce((s, v, i) => s + (v - p[i]) ** 2, 0));
export const dot = (x, y) => x.reduce((s, v, i) => s + v * y[i], 0);

// Distance de référence : du centre de l'hypercube à un sommet (√7). 0 → 100 %, √7 ou plus → 0 %.
export const D_REF = Math.sqrt(N_AXES);
export const compatibility = (d) => 100 * Math.max(0, 1 - d / D_REF);

export function rank(u, centers) {
  return FACTION_KEYS.map((k) => {
    const d = dist(u, centers[k]);
    return { k, d, c: compatibility(d) };
  }).sort((a, b) => a.d - b.d);
}

// --- Simulation ---------------------------------------------------------------

/** Générateur pseudo-aléatoire déterministe (LCG) : mêmes chiffres à chaque exécution. */
export function makeRng(seed = 42) {
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
  return { rnd, gauss };
}

/**
 * Persona simulée : convictions p ∈ [-1, 1]^7. Pour chaque question, elle choisit une option
 * avec une probabilité ∝ exp(beta · alignement). beta élevé = réponses cohérentes, beta faible = hésitantes.
 */
export function answerAs(p, beta, rng) {
  return OPTIONS.map((opts) => {
    const w = opts.map((o) => Math.exp(beta * dot(o.map((v) => v / 2), p)));
    let x = rng.rnd() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < w.length; i++) if ((x -= w[i]) <= 0) return i;
    return w.length - 1;
  });
}

export const clamp = (v) => Math.max(-1, Math.min(1, v));

/**
 * Calibration : le centre d'une faction est le vecteur moyen obtenu par des personas
 * proches de son profil déclaré (profil + bruit gaussien σ, beta donné).
 * Cela place les centres là où de vrais répondants arrivent, et non sur des extrêmes inatteignables.
 */
export function calibrate({ n = 3000, sigma = 0.3, beta = 3, seed = 42 } = {}) {
  const rng = makeRng(seed);
  const centers = {};
  for (const k of FACTION_KEYS) {
    const mean = new Array(N_AXES).fill(0);
    for (let i = 0; i < n; i++) {
      const p = FACTIONS[k].p.map((v) => clamp(v + sigma * rng.gauss()));
      profile(answerAs(p, beta, rng)).forEach((v, j) => (mean[j] += v / n));
    }
    centers[k] = mean;
  }
  return centers;
}
