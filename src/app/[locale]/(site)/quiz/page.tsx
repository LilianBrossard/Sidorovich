import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { buildQuizCopy } from "@/components/quiz/copy";
import { Quiz } from "@/components/quiz/Quiz";
import { CURRENT_QUESTIONNAIRE } from "@/data/questionnaires";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("quiz");
  return { title: t("metaTitle") };
}

/**
 * Le questionnaire [F-10…F-16]. La page est statique ; la partie elle-même vit dans le
 * navigateur (composant client), qui reçoit seulement les textes de sa langue.
 */
export default async function QuizPage() {
  const copy = buildQuizCopy(CURRENT_QUESTIONNAIRE, await getMessages());
  return (
    <div className="mx-auto max-w-2xl">
      <Quiz copy={copy} />
    </div>
  );
}
