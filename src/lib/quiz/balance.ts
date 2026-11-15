// Critères d'équilibrage du questionnaire, C1 à C6 (cahier des charges, section 5.3).
import { AXIS_KEYS, FACTION_KEYS, type FactionKey } from "./domain";
import { compile, computeProfile, distance, dot, normalize, rankFactions } from "./engine";
import { createRng } from "./random";
import { answerAs, noisyBeliefs } from "./simulation";
import type { Centers, Factions, Questionnaire, RankedFaction } from "./types";

export const THRESHOLDS = {
  /** C1 : nombre d'archétypes reconnus. */
  archetypes: 12,
  /** C2 : score maximal atteignable par chaque faction, en %. */
  reachMin: 80,
  /** C3 : taux de reconnaissance minimal par faction, en %… */
  recognitionMin: 65,
  /** … et en moyenne. */
  recognitionMean: 80,
  /** C4 : part de résultats de chaque faction (personas uniformes), en %. */
  shareMin: 2,
  shareMax: 25,
  /** C5 : nombre minimal de questions touchant chaque axe. */
  axisMinQuestions: 8,
} as const;

export interface BalanceOptions {
  /** Personas uniformes pour la répartition (C4). */
  readonly uniformSamples: number;
  /** Personas par faction pour la reconnaissance (C3). */
  readonly recognitionSamples: number;
  readonly seed: number;
}

export const DEFAULT_BALANCE: BalanceOptions = {
  uniformSamples: 20000,
  recognitionSamples: 2000,
  seed: 7,
};

export interface BalanceCheck {
  readonly id: "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  readonly label: string;
  readonly value: string;
  readonly ok: boolean;
}

export interface BalanceReport {
  readonly coverage: readonly {
    axis: string;
    questions: number;
    maxPositive: number;
    maxNegative: number;
  }[];
  readonly neighbors: readonly { faction: FactionKey; nearest: FactionKey; distance: number }[];
  readonly archetypes: readonly {
    faction: FactionKey;
    top: RankedFaction;
    second: RankedFaction;
    ok: boolean;
  }[];
  readonly reach: readonly { faction: FactionKey; score: number; first: boolean }[];
  readonly recognition: readonly {
    faction: FactionKey;
    rate: number;
    confusions: readonly { faction: FactionKey; rate: number }[];
  }[];
  readonly recognitionMean: number;
  /** Part de résultats par faction, personas uniformes, en %. */
  readonly share: Readonly<Record<FactionKey, number>>;
  /** Part de résultats hybrides (écart < 3 points), personas uniformes, en %. */
  readonly hybridShare: number;
  /** Part de résultats par faction, réponses tirées au hasard, en %. */
  readonly randomShare: Readonly<Record<FactionKey, number>>;
  readonly checks: readonly BalanceCheck[];
}

const tally = (): Record<FactionKey, number> =>
  Object.fromEntries(FACTION_KEYS.map((f) => [f, 0])) as Record<FactionKey, number>;

const percent = (count: number, total: number) => (100 * count) / total;

/** Réponses « comme la faction » : à chaque question, l'option la plus alignée sur le profil. */
export function archetypeAnswers(
  questionnaire: Questionnaire,
  profile: readonly number[],
): number[] {
  return compile(questionnaire).options.map((options) => {
    let best = 0;
    let bestValue = -Infinity;
    options.forEach((option, i) => {
      const value = dot(normalize(questionnaire, option), profile);
      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
    });
    return best;
  });
}

/** Descente coordonnée : réponses qui rapprochent le plus possible du point `target`. */
export function closestAnswers(questionnaire: Questionnaire, target: readonly number[]): number[] {
  const { options } = compile(questionnaire);
  const answers = options.map(() => 0);
  for (let iteration = 0; iteration < 20; iteration++) {
    let changed = false;
    options.forEach((opts, question) => {
      let best = answers[question];
      let bestDistance = Infinity;
      opts.forEach((_, option) => {
        const candidate = [...answers];
        candidate[question] = option;
        const d = distance(computeProfile(questionnaire, candidate), target);
        if (d < bestDistance - 1e-12) {
          bestDistance = d;
          best = option;
        }
      });
      if (best !== answers[question]) {
        answers[question] = best;
        changed = true;
      }
    });
    if (!changed) break;
  }
  return answers;
}

export function runBalance(
  questionnaire: Questionnaire,
  factions: Factions,
  centers: Centers,
  options: BalanceOptions = DEFAULT_BALANCE,
): BalanceReport {
  const rng = createRng(options.seed);
  const compiled = compile(questionnaire);
  const top = (answers: number[]) => rankFactions(computeProfile(questionnaire, answers), centers);

  const coverage = AXIS_KEYS.map((axis, i) => ({
    axis,
    questions: compiled.options.filter((opts) => opts.some((o) => o[i] !== 0)).length,
    maxPositive: compiled.maxPositive[i],
    maxNegative: compiled.maxNegative[i],
  }));

  const neighbors = FACTION_KEYS.map((faction) => {
    const [nearest] = FACTION_KEYS.filter((other) => other !== faction)
      .map((other) => ({ other, d: distance(centers[faction], centers[other]) }))
      .sort((a, b) => a.d - b.d);
    return { faction, nearest: nearest.other, distance: nearest.d };
  });

  const archetypes = FACTION_KEYS.map((faction) => {
    const ranking = top(archetypeAnswers(questionnaire, factions[faction].profile));
    return { faction, top: ranking[0], second: ranking[1], ok: ranking[0].faction === faction };
  });

  const reach = FACTION_KEYS.map((faction) => {
    const ranking = top(closestAnswers(questionnaire, centers[faction]));
    const own = ranking.find((r) => r.faction === faction)!;
    return { faction, score: own.compatibility, first: ranking[0].faction === faction };
  });

  const shareCount = tally();
  let hybrids = 0;
  for (let i = 0; i < options.uniformSamples; i++) {
    const beliefs = AXIS_KEYS.map(() => rng.next() * 2 - 1);
    const ranking = top(answerAs(questionnaire, beliefs, 3, rng));
    shareCount[ranking[0].faction]++;
    if (ranking[0].compatibility - ranking[1].compatibility < 3) hybrids++;
  }

  const recognition = FACTION_KEYS.map((faction) => {
    const counts = tally();
    for (let i = 0; i < options.recognitionSamples; i++) {
      const beliefs = noisyBeliefs(factions[faction].profile, 0.3, rng);
      counts[top(answerAs(questionnaire, beliefs, 3, rng))[0].faction]++;
    }
    const confusions = FACTION_KEYS.filter((f) => f !== faction)
      .map((f) => ({ faction: f, rate: percent(counts[f], options.recognitionSamples) }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 2);
    return { faction, rate: percent(counts[faction], options.recognitionSamples), confusions };
  });

  const randomCount = tally();
  for (let i = 0; i < options.uniformSamples; i++) {
    randomCount[top(compiled.radices.map((r) => Math.floor(rng.next() * r)))[0].faction]++;
  }

  const toShare = (counts: Record<FactionKey, number>) =>
    Object.fromEntries(
      FACTION_KEYS.map((f) => [f, percent(counts[f], options.uniformSamples)]),
    ) as Record<FactionKey, number>;
  const share = toShare(shareCount);
  const recognitionMean = recognition.reduce((s, r) => s + r.rate, 0) / recognition.length;
  const fmt = (v: number, digits = 1) => v.toFixed(digits);
  const T = THRESHOLDS;
  const shares = Object.values(share);
  const archetypeCount = archetypes.filter((a) => a.ok).length;

  const checks: BalanceCheck[] = [
    {
      id: "C1",
      label: "Archétypes reconnus",
      value: `${archetypeCount}/12`,
      ok: archetypeCount >= T.archetypes,
    },
    {
      id: "C2",
      label: `Atteignabilité (score ≥ ${T.reachMin} % et 1er)`,
      value: `min ${fmt(Math.min(...reach.map((r) => r.score)), 0)} %`,
      ok: reach.every((r) => r.first && r.score >= T.reachMin),
    },
    {
      id: "C3",
      label: `Reconnaissance (≥ ${T.recognitionMin} % chacune, ≥ ${T.recognitionMean} % en moyenne)`,
      value: `min ${fmt(Math.min(...recognition.map((r) => r.rate)))} %, moyenne ${fmt(recognitionMean)} %`,
      ok:
        recognition.every((r) => r.rate >= T.recognitionMin) &&
        recognitionMean >= T.recognitionMean,
    },
    {
      id: "C4",
      label: `Répartition (entre ${T.shareMin} % et ${T.shareMax} %)`,
      value: `de ${fmt(Math.min(...shares))} % à ${fmt(Math.max(...shares))} %`,
      ok: shares.every((s) => s >= T.shareMin && s <= T.shareMax),
    },
    {
      id: "C5",
      label: `Couverture (≥ ${T.axisMinQuestions} questions par axe)`,
      value: `min ${Math.min(...coverage.map((c) => c.questions))}`,
      ok: coverage.every((c) => c.questions >= T.axisMinQuestions),
    },
    {
      id: "C6",
      label: "Aucune réponse sans effet (hors « Sans avis »)",
      value: `${questionnaire.questions.length} questions`,
      ok: questionnaire.questions.every(
        (q) =>
          q.type === "scale" ||
          q.answers.every((a) => Object.values(a.deltas).some((v) => v !== 0)),
      ),
    },
  ];

  return {
    coverage,
    neighbors,
    archetypes,
    reach,
    recognition,
    recognitionMean,
    share,
    hybridShare: percent(hybrids, options.uniformSamples),
    randomShare: toShare(randomCount),
    checks,
  };
}
