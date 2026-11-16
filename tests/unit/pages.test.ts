import type { Messages } from "next-intl";
import { describe, expect, it } from "vitest";
import { buildQuizCopy } from "@/components/quiz/copy";
import {
  archetypeCode,
  CURRENT_QUESTIONNAIRE,
  isArchetypeCode,
  isRetiredCode,
  resultFromCode,
} from "@/data/index";
import { FACTION_KEYS } from "@/lib/quiz/domain";
import { compile } from "@/lib/quiz/engine";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import ru from "@/messages/ru.json";
import uk from "@/messages/uk.json";

const catalogs = { fr, en, uk, ru } as unknown as Record<string, Messages>;
const { radices } = compile(CURRENT_QUESTIONNAIRE);

describe("textes envoyés au questionnaire", () => {
  for (const [locale, messages] of Object.entries(catalogs)) {
    it(`${locale} : un texte par option et une réplique (ou rien) par option`, () => {
      const copy = buildQuizCopy(CURRENT_QUESTIONNAIRE, messages);
      expect(copy.questions).toHaveLength(radices.length);
      copy.questions.forEach((question, i) => {
        expect(question.options).toHaveLength(radices[i]);
        expect(question.quips).toHaveLength(radices[i]);
        for (const text of [question.kind, question.title, question.prompt, ...question.options]) {
          expect(text.trim()).not.toBe("");
        }
      });
      for (const line of Object.values(copy.lines)) expect(line.trim()).not.toBe("");
    });
  }

  it("au moins 8 questions ont une réplique de réaction [F-16]", () => {
    const copy = buildQuizCopy(CURRENT_QUESTIONNAIRE, catalogs.fr);
    const withQuip = copy.questions.filter((q) => q.quips.some((quip) => quip !== null));
    expect(withQuip.length).toBeGreaterThanOrEqual(8);
  });
});

describe("dossiers types pré-rendus", () => {
  it("12 codes distincts, chacun donnant sa propre faction (critère C1)", () => {
    const codes = FACTION_KEYS.map(archetypeCode);
    expect(new Set(codes).size).toBe(12);
    FACTION_KEYS.forEach((faction, i) => {
      const decoded = resultFromCode(codes[i]);
      expect(decoded.ok && decoded.result.top.faction).toBe(faction);
    });
  });

  it("seuls les dossiers types sont reconnus comme tels (indexés)", () => {
    for (const faction of FACTION_KEYS) expect(isArchetypeCode(archetypeCode(faction))).toBe(true);
    expect(isArchetypeCode("1C85I1jjhQcN")).toBe(false);
  });

  it("aucune version n'est retirée pour l'instant", () => {
    expect(isRetiredCode(archetypeCode("SOL"))).toBe(false);
  });
});
