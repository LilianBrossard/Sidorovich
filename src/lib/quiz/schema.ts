// Schémas de validation des données [S-02]. Utilisés par les tests et par
// `npm run validate`, exécuté avant chaque build : une donnée invalide fait échouer le build.
// Ils ne sont pas chargés par le site (la forme est déjà garantie par TypeScript).
import { z } from "zod";
import {
  AXIS_KEYS,
  CHOICE_ANSWER_IDS,
  DELTA_MAX,
  DELTA_MIN,
  FACTION_KEYS,
  GAME_IDS,
  QUESTION_KINDS,
} from "./domain";
import { CODE_ALPHABET } from "./encoding";

const delta = z.number().int().min(DELTA_MIN).max(DELTA_MAX);

const deltasSchema = z
  .partialRecord(z.enum(AXIS_KEYS), delta)
  .refine((d) => Object.values(d).some((v) => v !== 0), "au moins un axe doit être non nul");

const unit = z.number().min(-1).max(1);
const vectorSchema = z.array(unit).length(AXIS_KEYS.length);

const choiceQuestionSchema = z.object({
  id: z.string().regex(/^Q\d{2}$/),
  type: z.literal("choice"),
  kind: z.enum(QUESTION_KINDS).exclude(["statement"]),
  answers: z
    .array(z.object({ id: z.enum(CHOICE_ANSWER_IDS), deltas: deltasSchema }))
    .length(CHOICE_ANSWER_IDS.length)
    .refine(
      (answers) => answers.every((a, i) => a.id === CHOICE_ANSWER_IDS[i]),
      "les réponses doivent être a, b, c, d dans cet ordre",
    ),
});

const scaleQuestionSchema = z.object({
  id: z.string().regex(/^Q\d{2}$/),
  type: z.literal("scale"),
  kind: z.literal("statement"),
  deltas: deltasSchema,
});

export const questionnaireSchema = z
  .object({
    version: z.string().regex(/^v\d+$/),
    codeChar: z
      .string()
      .length(1)
      .refine((c) => CODE_ALPHABET.includes(c), "caractère hors alphabet"),
    questions: z
      .array(z.discriminatedUnion("type", [choiceQuestionSchema, scaleQuestionSchema]))
      .min(1),
  })
  .refine(
    (q) => new Set(q.questions.map((question) => question.id)).size === q.questions.length,
    "identifiants de questions en double",
  );

const factionKey = z.enum(FACTION_KEYS);

/** Les 12 factions, ni plus ni moins (z.record avec une énumération est exhaustif). */
export const factionsSchema = z.record(
  factionKey,
  z.object({ profile: vectorSchema, games: z.array(z.enum(GAME_IDS)).min(1) }),
);

export const centersFileSchema = z.object({
  version: z.string().regex(/^v\d+$/),
  inputFingerprint: z.string().regex(/^[0-9a-f]{14}$/),
  params: z.object({
    samples: z.number().int().positive(),
    sigma: z.number().positive(),
    beta: z.number().positive(),
    seed: z.number().int(),
  }),
  centers: z.record(factionKey, vectorSchema),
});

/** Messages d'erreur lisibles, un par problème. */
export const formatIssues = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join(".") || "(racine)"} : ${issue.message}`);
