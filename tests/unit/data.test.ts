import { describe, expect, it } from "vitest";
import { CALIBRATION_PARAMS, calibrationFingerprint } from "@/data/calibration";
import { checkData } from "@/data/check";
import { FACTIONS } from "@/data/factions";
import { CENTERS_FILES, resultCode, resultFromCode } from "@/data/index";
import { questionnaireV1 } from "@/data/questionnaire.v1";
import { PUBLISHED_FINGERPRINTS, QUESTIONNAIRES } from "@/data/questionnaires";
import { evaluate } from "@/lib/quiz/engine";
import { fingerprint } from "@/lib/quiz/fingerprint";
import { factionsSchema, questionnaireSchema } from "@/lib/quiz/schema";
import { calibrate, roundCenters } from "@/lib/quiz/simulation";
import fr from "@/messages/fr.json";

/** Copies modifiables des données, typées juste assez pour les altérer. */
type LooseQuestionnaire = {
  codeChar: string;
  questions: { id: string; answers?: { deltas: Record<string, number> }[] }[];
};
type LooseMessages = Record<string, unknown> & {
  questionnaire: Record<string, Record<string, unknown>>;
  factions: Record<string, Record<string, unknown>>;
};
const copy = <T>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

describe("validation des données [S-02]", () => {
  it("les données actuelles sont valides", () => {
    expect(checkData()).toEqual([]);
  });

  const firstAnswers = (q: LooseQuestionnaire) => q.questions[0].answers!;
  const broken: [string, (q: LooseQuestionnaire) => void][] = [
    ["une question à 3 réponses", (q) => void firstAnswers(q).pop()],
    ["un delta de 3", (q) => (firstAnswers(q)[0].deltas = { ORD: 3 })],
    ["un delta non entier", (q) => (firstAnswers(q)[0].deltas = { ORD: 1.5 })],
    ["une réponse sans effet", (q) => (firstAnswers(q)[0].deltas = {})],
    ["un axe inconnu", (q) => (firstAnswers(q)[0].deltas = { XYZ: 1 })],
    ["des réponses dans le désordre", (q) => void firstAnswers(q).reverse()],
    ["deux questions avec le même identifiant", (q) => (q.questions[1].id = "Q01")],
    ["un caractère de version hors alphabet", (q) => (q.codeChar = "=")],
  ];

  it.each(broken)("refuse %s", (_, mutate) => {
    const questionnaire = copy<LooseQuestionnaire>(questionnaireV1);
    mutate(questionnaire);
    expect(questionnaireSchema.safeParse(questionnaire).success).toBe(false);
  });

  it("refuse un profil de faction hors de [−1, 1] et une faction manquante", () => {
    const factions = copy<Record<string, { profile: number[] }>>(FACTIONS);
    factions.DEV.profile[0] = 1.2;
    expect(factionsSchema.safeParse(factions).success).toBe(false);
    const incomplete = copy<Record<string, unknown>>(FACTIONS);
    delete incomplete.NOO;
    expect(factionsSchema.safeParse(incomplete).success).toBe(false);
  });

  it("signale un texte manquant et une réplique orpheline", () => {
    const messages = copy<LooseMessages>(fr);
    delete messages.questionnaire.Q05.prompt;
    messages.questionnaire.Q05.quips = { z: "Hm." };
    messages.factions.MON.verdict = " ";
    expect(checkData(messages)).toEqual([
      "texte manquant : questionnaire.Q05.prompt",
      "réplique orpheline : questionnaire.Q05.quips.z",
      "texte manquant : factions.MON.verdict",
    ]);
  });
});

describe("centres calibrés [S-03]", () => {
  it.each(QUESTIONNAIRES.map((q) => [q.version, q] as const))(
    "%s : le fichier correspond aux données actuelles (sinon : npm run calibrate)",
    (version, questionnaire) => {
      const file = CENTERS_FILES[version];
      expect(file.inputFingerprint).toBe(calibrationFingerprint(questionnaire));
      expect(file.params).toEqual(CALIBRATION_PARAMS);
      expect(roundCenters(calibrate(questionnaire, FACTIONS, CALIBRATION_PARAMS))).toEqual(
        file.centers,
      );
    },
  );

  it("la calibration est déterministe", () => {
    const params = { ...CALIBRATION_PARAMS, samples: 200 };
    expect(calibrate(questionnaireV1, FACTIONS, params)).toEqual(
      calibrate(questionnaireV1, FACTIONS, params),
    );
  });
});

describe("versions publiées [S-04]", () => {
  it("une version publiée ne change plus", () => {
    for (const questionnaire of QUESTIONNAIRES) {
      const published = PUBLISHED_FINGERPRINTS[questionnaire.version];
      if (published) expect(fingerprint(questionnaire), questionnaire.version).toBe(published);
    }
  });
});

describe("liens de résultat [F-25] [S-05]", () => {
  it("un lien redonne exactement le même résultat", () => {
    const answers = questionnaireV1.questions.map((q, i) => (q.type === "scale" ? 4 : i % 4));
    const fromLink = resultFromCode(resultCode(answers));
    expect(fromLink.ok).toBe(true);
    if (fromLink.ok) {
      expect(fromLink.answers).toEqual(answers);
      expect(fromLink.result).toEqual(evaluate(questionnaireV1, CENTERS_FILES.v1.centers, answers));
    }
  });

  it("un lien invalide renvoie une erreur typée", () => {
    expect(resultFromCode("n-importe-quoi")).toEqual({ ok: false, error: "version" });
    expect(resultFromCode("1-importe-quoi")).toEqual({ ok: false, error: "length" });
  });
});
