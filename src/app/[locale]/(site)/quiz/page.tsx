import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { buildQuizCopy } from "@/components/quiz/copy";
import { Quiz } from "@/components/quiz/Quiz";
import { CURRENT_QUESTIONNAIRE } from "@/data/questionnaires";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    locale: (await getLocale()) as AppLocale,
    path: "/quiz",
    siteName: t("metadata.title"),
    imageAlt: t("og.defaultAlt"),
    title: t("quiz.metaTitle"),
    description: t("seo.quiz"),
  });
}

/**
 * Le questionnaire, sous forme de dossier posé sur un bureau [F-10…F-16]. La page est
 * statique ; la partie vit dans le navigateur (composant client), qui reçoit seulement
 * les textes de sa langue.
 */
export default async function QuizPage() {
  const copy = buildQuizCopy(CURRENT_QUESTIONNAIRE, await getMessages());
  return (
    <div className="flex flex-1 flex-col overflow-x-clip bg-desk">
      <div className="mx-auto w-full max-w-6xl px-3 py-7 sm:px-8 md:py-14">
        <Quiz copy={copy} />
      </div>
    </div>
  );
}
