"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { isComplete } from "@/lib/quiz/session";
import { sessionQuestionnaire as questionnaire, useQuizSession } from "./sessionStore";

/**
 * Lien vers un nouvel entretien. Un dossier déjà complet est effacé ; une partie en cours
 * (par exemple chez quelqu'un qui regarde le lien d'un ami) est gardée.
 */
export function RetakeLink({ className, children }: { className?: string; children: ReactNode }) {
  const { session, clear } = useQuizSession();
  return (
    <Link
      href="/quiz"
      className={className}
      onClick={() => {
        if (session && isComplete(questionnaire, session)) clear();
      }}
    >
      {children}
    </Link>
  );
}
