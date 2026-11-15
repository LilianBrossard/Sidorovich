"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { encodeAnswers } from "@/lib/quiz/encoding";
import { answeredCount, completedAnswers } from "@/lib/quiz/session";
import { sessionQuestionnaire as questionnaire, useQuizSession } from "./sessionStore";

/** Sur l'accueil : rappelle la partie en cours ou le dernier verdict [F-14]. */
export function ResumeHint() {
  const t = useTranslations("resume");
  const { session } = useQuizSession();
  if (!session) return null;

  const answers = completedAnswers(questionnaire, session);
  if (answers) {
    return (
      <p className="text-sm text-paper-300">
        <Link
          href={`/r/${encodeAnswers(questionnaire, answers)}`}
          className="text-amber-400 underline underline-offset-4"
        >
          {t("lastVerdict")}
        </Link>
      </p>
    );
  }
  if (answeredCount(session) === 0) return null;
  return (
    <p className="text-sm text-paper-300">
      {t("inProgress", {
        current: session.current + 1,
        total: questionnaire.questions.length,
      })}
    </p>
  );
}
