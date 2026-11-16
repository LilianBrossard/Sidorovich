import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { BunkerScene } from "@/components/bunker/BunkerScene";
import { ResumeHint } from "@/components/quiz/ResumeHint";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    locale: (await getLocale()) as AppLocale,
    path: "",
    siteName: t("metadata.title"),
    description: t("metadata.description"),
    imageAlt: t("og.defaultAlt"),
  });
}

/** Accueil, dans le bunker : le bouton « Commencer » est visible sans défilement [F-01]. */
export default function HomePage() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const meta = useTranslations("metadata");
  const sidorovich = useTranslations("sidorovich");

  return (
    <div className="flex flex-1 flex-col bg-concrete">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-8 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12 md:py-16">
        <section className="flex flex-col gap-6">
          <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">
            {t("kicker")}
          </p>
          <h1 className="font-typewriter text-[40px] leading-none text-paper-100 sm:text-7xl lg:text-[80px]">
            {meta("title")}
          </h1>
          <p className="text-lg text-paper-300 sm:text-xl">{t("tagline")}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/quiz"
              className="inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-sm bg-amber-400 px-6 font-terminal text-sm font-semibold tracking-[0.12em] text-ink-900 uppercase shadow-[0_8px_24px_rgb(242_181_68/0.18)] hover:bg-amber-400/85 sm:w-auto"
            >
              {t("cta")}
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/how-it-works" className="text-paper-300 underline underline-offset-4">
              {t("howLink")}
            </Link>
          </div>
          <ResumeHint />
          <ul className="flex flex-wrap gap-2 font-terminal text-[11px] tracking-wider text-paper-300 uppercase sm:text-xs">
            {(["duration", "noRightAnswer", "privacy"] as const).map((key) => (
              <li key={key} className="rounded-sm border border-bunker-700 bg-bunker-950 px-3 py-2">
                {t(`facts.${key}`)}
              </li>
            ))}
          </ul>
        </section>

        <BunkerScene
          line={sidorovich("intro")}
          speaker={common("speaker")}
          pauseLabel={t("videoPause")}
          playLabel={t("videoPlay")}
        />
      </div>
    </div>
  );
}
