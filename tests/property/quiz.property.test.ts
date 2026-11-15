// Tests de propriétés (fast-check) : des milliers de parties tirées au hasard.
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CENTERS_FILES, QUESTIONNAIRES, resultCode, resultFromCode } from "@/data/index";
import { questionnaireV1 } from "@/data/questionnaire.v1";
import { FACTION_KEYS, HYBRID_THRESHOLD } from "@/lib/quiz/domain";
import { decodeAnswers, encodeAnswers } from "@/lib/quiz/encoding";
import { compile, computeProfile, evaluate } from "@/lib/quiz/engine";

const centers = CENTERS_FILES.v1.centers;
const { radices } = compile(questionnaireV1);

/** Réponses complètes et valides au questionnaire v1. */
const answersArb = fc.tuple(...radices.map((r) => fc.integer({ min: 0, max: r - 1 })));

describe("propriétés du moteur", () => {
  it("décoder(encoder(réponses)) = réponses [S-05]", () => {
    fc.assert(
      fc.property(answersArb, (answers) => {
        const decoded = decodeAnswers(QUESTIONNAIRES, encodeAnswers(questionnaireV1, answers));
        expect(decoded).toEqual({ ok: true, questionnaire: questionnaireV1, answers });
      }),
      { numRuns: 2000 },
    );
  });

  it("le profil reste dans [−1, 1] sur les 7 axes", () => {
    fc.assert(
      fc.property(answersArb, (answers) => {
        const profile = computeProfile(questionnaireV1, answers);
        expect(profile).toHaveLength(7);
        for (const v of profile) expect(Math.abs(v)).toBeLessThanOrEqual(1);
      }),
      { numRuns: 2000 },
    );
  });

  it("le classement contient les 12 factions, triées, avec des % entre 0 et 100", () => {
    fc.assert(
      fc.property(answersArb, (answers) => {
        const { ranking, top, runnerUp, isHybrid } = evaluate(questionnaireV1, centers, answers);
        expect(new Set(ranking.map((r) => r.faction))).toEqual(new Set(FACTION_KEYS));
        for (let i = 1; i < ranking.length; i++) {
          expect(ranking[i].distance).toBeGreaterThanOrEqual(ranking[i - 1].distance);
          expect(ranking[i].compatibility).toBeLessThanOrEqual(ranking[i - 1].compatibility);
        }
        for (const r of ranking) {
          expect(r.compatibility).toBeGreaterThanOrEqual(0);
          expect(r.compatibility).toBeLessThanOrEqual(100);
        }
        expect([top, runnerUp]).toEqual(ranking.slice(0, 2));
        expect(isHybrid).toBe(top.compatibility - runnerUp.compatibility < HYBRID_THRESHOLD);
      }),
      { numRuns: 1000 },
    );
  });

  it("le lien partagé redonne le même résultat que le calcul direct", () => {
    fc.assert(
      fc.property(answersArb, (answers) => {
        const fromLink = resultFromCode(resultCode(answers));
        expect(fromLink.ok && fromLink.result).toEqual(evaluate(questionnaireV1, centers, answers));
      }),
      { numRuns: 500 },
    );
  });

  it("le décodage ne lève jamais d'exception, quelle que soit l'entrée", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 40 }), (code) => {
        const decoded = decodeAnswers(QUESTIONNAIRES, code);
        if (decoded.ok) expect(decoded.answers).toHaveLength(radices.length);
      }),
      { numRuns: 5000 },
    );
  });
});
