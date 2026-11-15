import { describe, expect, it } from "vitest";
import { questionnaireV1 } from "@/data/questionnaire.v1";
import {
  checksum,
  CODE_ALPHABET,
  codeLength,
  decodeAnswers,
  encodeAnswers,
  payloadLength,
} from "@/lib/quiz/encoding";
import { compile } from "@/lib/quiz/engine";
import { tinyQuestionnaire } from "../fixtures";

const versions = [questionnaireV1, tinyQuestionnaire];
const { radices } = compile(questionnaireV1);
const allFirst = radices.map(() => 0);
const allLast = radices.map((r) => r - 1);
const mixed = radices.map((r, i) => i % r);

describe("format des codes [F-25]", () => {
  it("v1 : 12 caractères (1 version + 9 réponses + 2 contrôle), 16 au maximum", () => {
    expect(payloadLength(questionnaireV1)).toBe(9);
    expect(codeLength(questionnaireV1)).toBe(12);
    const code = encodeAnswers(questionnaireV1, mixed);
    expect(code).toHaveLength(12);
    expect(code[0]).toBe("1");
    expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
  });

  it("les codes déjà partagés ne changent pas (non-régression)", () => {
    // Si ce test échoue, les liens publiés ne mèneraient plus au même résultat [F-26].
    expect(encodeAnswers(questionnaireV1, allFirst)).toBe("1AAAAAAAAAA1");
    expect(encodeAnswers(questionnaireV1, allLast)).toBe("1DDT______uj");
    expect(encodeAnswers(questionnaireV1, mixed)).toBe("1AUoEtqwqfeJ");
  });

  it("refuse d'encoder des réponses incomplètes ou hors limites", () => {
    expect(() => encodeAnswers(questionnaireV1, allFirst.slice(1))).toThrow(RangeError);
    expect(() => encodeAnswers(questionnaireV1, [...allFirst.slice(1), 9])).toThrow(RangeError);
  });
});

describe("décodage", () => {
  it("retrouve exactement les réponses et la version", () => {
    for (const answers of [allFirst, allLast, mixed]) {
      const decoded = decodeAnswers(versions, encodeAnswers(questionnaireV1, answers));
      expect(decoded).toEqual({ ok: true, questionnaire: questionnaireV1, answers });
    }
    const tiny = decodeAnswers(versions, encodeAnswers(tinyQuestionnaire, [2, 4]));
    expect(tiny.ok && tiny.questionnaire).toBe(tinyQuestionnaire);
  });

  it.each([
    ["", "length"],
    ["1A", "length"],
    ["1AAAAAAAAAA", "length"],
    ["1AAAAAAAAAAAA", "length"],
    ["1AAAA AAAAAA", "alphabet"],
    ["1AAAAAAAAAA=", "alphabet"],
    ["ZAAAAAAAAAAA", "version"],
    ["1AAAAAAAAAAB", "checksum"],
  ])("« %s » est refusé (%s)", (code, error) => {
    expect(decodeAnswers(versions, code)).toEqual({ ok: false, error });
  });

  it("refuse une valeur au-delà des combinaisons possibles", () => {
    const body = `1${"_".repeat(payloadLength(questionnaireV1))}`;
    expect(decodeAnswers(versions, body + checksum(body))).toEqual({ ok: false, error: "range" });
  });

  it("détecte toute substitution d'un caractère", () => {
    const code = encodeAnswers(questionnaireV1, mixed);
    for (let i = 0; i < code.length; i++) {
      for (const char of CODE_ALPHABET) {
        if (char === code[i]) continue;
        const altered = code.slice(0, i) + char + code.slice(i + 1);
        expect(decodeAnswers(versions, altered).ok, altered).toBe(false);
      }
    }
  });

  it("détecte toute inversion de deux caractères voisins différents", () => {
    const code = encodeAnswers(questionnaireV1, mixed);
    for (let i = 0; i < code.length - 1; i++) {
      if (code[i] === code[i + 1]) continue;
      const swapped = code.slice(0, i) + code[i + 1] + code[i] + code.slice(i + 2);
      expect(decodeAnswers(versions, swapped).ok, swapped).toBe(false);
    }
  });
});
