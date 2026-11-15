// Contrôle de cohérence de toutes les données du questionnaire [S-02].
// Utilisé par `npm run validate` (avant chaque build) et par les tests.
import { AXIS_KEYS, FACTION_KEYS, QUESTION_KINDS, SCALE_LEVELS } from "@/lib/quiz/domain";
import {
  centersFileSchema,
  factionsSchema,
  formatIssues,
  questionnaireSchema,
} from "@/lib/quiz/schema";
import fr from "@/messages/fr.json";
import { calibrationFingerprint } from "./calibration";
import { FACTIONS } from "./factions";
import { CENTERS_FILES } from "./index";
import { PUBLISHED_FINGERPRINTS, QUESTIONNAIRES } from "./questionnaires";
import { fingerprint } from "@/lib/quiz/fingerprint";

type Messages = Record<string, unknown>;

const lookup = (messages: Messages, path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (node as Messages | undefined)?.[key], messages);

/** Liste des problèmes trouvés ; vide si tout est cohérent. */
export function checkData(messages: Messages = fr): string[] {
  const problems: string[] = [];
  const requireText = (path: string) => {
    const value = lookup(messages, path);
    if (typeof value !== "string" || value.trim() === "") problems.push(`texte manquant : ${path}`);
  };

  const factions = factionsSchema.safeParse(FACTIONS);
  if (!factions.success) problems.push(...formatIssues(factions.error).map((m) => `factions.${m}`));

  for (const questionnaire of QUESTIONNAIRES) {
    const { version } = questionnaire;

    const parsed = questionnaireSchema.safeParse(questionnaire);
    if (!parsed.success) problems.push(...formatIssues(parsed.error).map((m) => `${version}.${m}`));

    const centers = centersFileSchema.safeParse(CENTERS_FILES[version]);
    if (!centers.success) {
      problems.push(...formatIssues(centers.error).map((m) => `centers.${version}.${m}`));
    } else if (centers.data.inputFingerprint !== calibrationFingerprint(questionnaire)) {
      problems.push(
        `centers.${version}.json ne correspond plus aux données : lancer \`npm run calibrate\`.`,
      );
    }

    const published = PUBLISHED_FINGERPRINTS[version];
    if (published && published !== fingerprint(questionnaire)) {
      problems.push(`${version} est publiée et ne doit plus changer : créer une nouvelle version.`);
    }

    for (const question of questionnaire.questions) {
      const base = `questionnaire.${question.id}`;
      requireText(`${base}.title`);
      requireText(`${base}.prompt`);
      if (question.type === "choice") {
        for (const answer of question.answers) requireText(`${base}.answers.${answer.id}`);
      }
      const quips = lookup(messages, `${base}.quips`);
      if (quips && typeof quips === "object") {
        const allowed = question.type === "choice" ? question.answers.map((a) => a.id) : [];
        for (const key of Object.keys(quips)) {
          if (!allowed.includes(key as never))
            problems.push(`réplique orpheline : ${base}.quips.${key}`);
        }
      }
    }
  }

  for (const axis of AXIS_KEYS) {
    for (const field of ["plus", "minus", "plusDescription", "minusDescription"]) {
      requireText(`axes.${axis}.${field}`);
    }
  }
  for (const faction of FACTION_KEYS) {
    for (const field of ["name", "pitch", "verdict"]) requireText(`factions.${faction}.${field}`);
  }
  for (const kind of QUESTION_KINDS) requireText(`questionKinds.${kind}`);
  for (const level of SCALE_LEVELS) requireText(`scale.${level}`);

  return problems;
}
