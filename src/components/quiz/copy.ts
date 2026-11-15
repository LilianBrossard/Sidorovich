// Textes du questionnaire préparés côté serveur, puis transmis au composant client.
// Le navigateur ne reçoit que les textes de sa langue, sans le reste du catalogue.
import type { Messages } from "next-intl";
import { SCALE_LEVELS } from "@/lib/quiz/domain";
import type { Questionnaire } from "@/lib/quiz/types";

export interface QuestionCopy {
  /** Type de question, déjà traduit (« Dilemme », « Affirmation »…). */
  readonly kind: string;
  readonly title: string;
  readonly prompt: string;
  /** Texte de chaque option, dans l'ordre d'origine (avant mélange). */
  readonly options: readonly string[];
  /** Réplique de Sidorovich après chaque option d'origine, ou null. */
  readonly quips: readonly (string | null)[];
}

export interface QuizLines {
  readonly welcome: string;
  readonly restart: string;
  readonly halfway: string;
  readonly computing: string;
}

export interface QuizCopy {
  readonly speaker: string;
  readonly lines: QuizLines;
  readonly questions: readonly QuestionCopy[];
}

interface QuestionMessages {
  readonly title: string;
  readonly prompt: string;
  readonly answers?: Readonly<Record<string, string>>;
  readonly quips?: Readonly<Record<string, string>>;
}

export function buildQuizCopy(questionnaire: Questionnaire, messages: Messages): QuizCopy {
  const catalog = messages.questionnaire as Readonly<Record<string, QuestionMessages>>;
  const { sidorovich } = messages;

  return {
    speaker: messages.common.speaker,
    lines: {
      welcome: sidorovich.welcome,
      restart: sidorovich.restart,
      halfway: sidorovich.halfway,
      computing: sidorovich.computing,
    },
    questions: questionnaire.questions.map((question) => {
      const entry = catalog[question.id];
      const ids =
        question.type === "scale" ? SCALE_LEVELS : question.answers.map((answer) => answer.id);
      return {
        kind: messages.questionKinds[question.kind],
        title: entry.title,
        prompt: entry.prompt,
        options:
          question.type === "scale"
            ? SCALE_LEVELS.map((level) => messages.scale[level])
            : ids.map((id) => entry.answers?.[id] ?? id),
        quips: ids.map((id) => entry.quips?.[id] ?? null),
      };
    }),
  };
}
