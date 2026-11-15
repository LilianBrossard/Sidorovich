import { describe, expect, it } from "vitest";
import { questionnaireV1 } from "@/data/questionnaire.v1";
import { FACTION_KEYS, HYBRID_THRESHOLD } from "@/lib/quiz/domain";
import {
  axisTendency,
  compatibility,
  compile,
  computeProfile,
  distance,
  evaluate,
  isCompleteAnswers,
  normalize,
  questionOptions,
  rankFactions,
  REFERENCE_DISTANCE,
} from "@/lib/quiz/engine";
import { centersWith, tinyQuestionnaire, zeros } from "../fixtures";

describe("compile", () => {
  it("développe les questions en options et calcule les bornes par axe", () => {
    const { options, radices, maxPositive, maxNegative } = compile(tinyQuestionnaire);
    expect(radices).toEqual([4, 5]);
    // Q01 : ORD +2 au mieux ; Q02 (échelle) : ORD ±2. ALT : +1 / −2. FOI : ±1 via l'échelle.
    expect(maxPositive).toEqual([4, 1, 0, 1, 0, 0, 1]);
    expect(maxNegative).toEqual([3, 2, 0, 1, 0, 0, 0]);
    expect(options[1].map((o) => o[0])).toEqual([-2, -1, 0, 1, 2]);
  });

  it("met le résultat en cache par questionnaire", () => {
    expect(compile(tinyQuestionnaire)).toBe(compile(tinyQuestionnaire));
  });

  it("v1 : 19 questions à choix (4 options) et 5 affirmations (5 niveaux)", () => {
    const { radices, maxPositive, maxNegative } = compile(questionnaireV1);
    expect(radices.filter((r) => r === 4)).toHaveLength(19);
    expect(radices.filter((r) => r === 5)).toHaveLength(5);
    // Bornes publiées dans docs/02-questionnaire.md, section 4.1.
    expect(maxPositive).toEqual([20, 17, 11, 12, 15, 12, 19]);
    expect(maxNegative).toEqual([18, 19, 12, 12, 9, 13, 23]);
  });

  it("l'échelle va du désaccord total (−) à l'accord total (+)", () => {
    const scale = tinyQuestionnaire.questions[1];
    expect(questionOptions(scale).map((o) => o[0])).toEqual([-2, -1, 0, 1, 2]);
  });
});

describe("computeProfile", () => {
  it("normalise avec des bornes asymétriques", () => {
    // a (ORD +2, ALT +1) + « Tout à fait d'accord » (ORD +2, FOI −1)
    expect(computeProfile(tinyQuestionnaire, [0, 4])).toEqual([1, 1, 0, -1, 0, 0, 0]);
    // b (ORD −1) + « Pas du tout d'accord » (ORD −2, FOI +1) : ORD −3 / 3 = −1
    expect(computeProfile(tinyQuestionnaire, [1, 0])).toEqual([-1, 0, 0, 1, 0, 0, 0]);
    // c (ALT −2) + « Sans avis » : ALT −2 / 2 = −1
    expect(computeProfile(tinyQuestionnaire, [2, 2])).toEqual([0, -1, 0, 0, 0, 0, 0]);
  });

  it("donne 0 sur un axe que le questionnaire ne touche pas", () => {
    expect(normalize(tinyQuestionnaire, [0, 0, 5, 0, 0, 0, 0])[2]).toBe(0);
  });

  it("refuse des réponses incomplètes ou hors limites", () => {
    for (const answers of [[0], [0, 5], [4, 0], [-1, 0], [0.5, 0], [0, 0, 0]]) {
      expect(isCompleteAnswers(tinyQuestionnaire, answers)).toBe(false);
      expect(() => computeProfile(tinyQuestionnaire, answers)).toThrow(RangeError);
    }
    expect(isCompleteAnswers(tinyQuestionnaire, [3, 4])).toBe(true);
  });
});

describe("distance et compatibilité", () => {
  it("compatibilité = 100 % à distance nulle, 0 % à √7 et au-delà", () => {
    expect(compatibility(0)).toBe(100);
    expect(compatibility(REFERENCE_DISTANCE / 2)).toBeCloseTo(50);
    expect(compatibility(REFERENCE_DISTANCE)).toBe(0);
    expect(compatibility(10)).toBe(0);
  });

  it("distance euclidienne", () => {
    expect(distance([0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1])).toBeCloseTo(Math.sqrt(7));
    expect(distance([3, 0], [0, 4])).toBe(5);
  });
});

describe("rankFactions", () => {
  it("classe les 12 factions de la plus proche à la plus éloignée", () => {
    const centers = centersWith({ DEV: [0.1, 0, 0, 0, 0, 0, 0], NOO: [0.5, 0, 0, 0, 0, 0, 0] });
    const ranking = rankFactions(zeros(), centers);
    expect(ranking).toHaveLength(12);
    expect(ranking.map((r) => r.faction).slice(0, 2)).toEqual(["DEV", "NOO"]);
    expect(new Set(ranking.map((r) => r.faction))).toEqual(new Set(FACTION_KEYS));
  });

  it("départage les égalités par l'ordre des factions (résultat stable)", () => {
    const ranking = rankFactions(zeros(), centersWith({}));
    expect(ranking.map((r) => r.faction)).toEqual([...FACTION_KEYS]);
  });
});

describe("evaluate", () => {
  const answers = [3, 2]; // d (IDE +1) + « Sans avis » → profil [0,0,0,0,0,0,1]

  it("renvoie profil, classement, 1re et 2e faction", () => {
    const centers = centersWith({ SOL: [0, 0, 0, 0, 0, 0, 1], LIB: [0, 0, 0, 0, 0, 0, 0] });
    const result = evaluate(tinyQuestionnaire, centers, answers);
    expect(result.profile).toEqual([0, 0, 0, 0, 0, 0, 1]);
    expect(result.top.faction).toBe("SOL");
    expect(result.top.compatibility).toBe(100);
    expect(result.runnerUp.faction).toBe("LIB");
    expect(result.isHybrid).toBe(false);
  });

  it(`résultat hybride si l'écart est inférieur à ${HYBRID_THRESHOLD} points [F-24]`, () => {
    const gap = (points: number) => (points / 100) * REFERENCE_DISTANCE;
    const near = (d: number) => [0, 0, 0, 0, 0, 0, 1 - d];
    const hybrid = evaluate(
      tinyQuestionnaire,
      centersWith({ SOL: near(0), LIB: near(gap(HYBRID_THRESHOLD - 0.5)) }),
      answers,
    );
    expect(hybrid.isHybrid).toBe(true);
    const clear = evaluate(
      tinyQuestionnaire,
      centersWith({ SOL: near(0), LIB: near(gap(HYBRID_THRESHOLD + 0.5)) }),
      answers,
    );
    expect(clear.isHybrid).toBe(false);
  });
});

describe("axisTendency [F-23]", () => {
  it.each([
    [1, "strongPlus"],
    [0.5, "strongPlus"],
    [0.49, "leanPlus"],
    [0.2, "leanPlus"],
    [0.19, "balanced"],
    [0, "balanced"],
    [-0.19, "balanced"],
    [-0.2, "leanMinus"],
    [-0.5, "strongMinus"],
    [-1, "strongMinus"],
  ] as const)("%s → %s", (value, tendency) => {
    expect(axisTendency(value)).toBe(tendency);
  });
});
