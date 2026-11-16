import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { AXIS_KEYS } from "@/lib/quiz/domain";
import { pageMetadata } from "@/lib/site";

const ENGINE_URL = "https://github.com/LilianBrossard/Sidorovich/tree/main/src/lib/quiz";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return pageMetadata({
    locale: (await getLocale()) as AppLocale,
    path: "/how-it-works",
    siteName: t("metadata.title"),
    imageAlt: t("og.defaultAlt"),
    title: t("howItWorks.metaTitle"),
    description: t("seo.howItWorks"),
  });
}

const STEPS = ["answers", "profile", "distance", "verdict"] as const;
const SECTIONS = ["profile", "distance", "calibration", "balance"] as const;

/** Le moteur expliqué en moins de 600 mots, avec un schéma et un lien vers le code [F-31]. */
export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");
  const axes = await getTranslations("axes");

  return (
    <article className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 leading-relaxed sm:px-8 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-typewriter text-3xl text-paper-100 sm:text-4xl">{t("title")}</h1>
        <p className="text-paper-300">{t("intro")}</p>
      </header>

      <figure className="space-y-3">
        <ol className="grid gap-2 sm:grid-cols-4 sm:gap-0">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2 sm:flex-col sm:items-stretch">
              <div className="flex flex-1 items-center gap-2">
                <div className="flex-1 rounded-sm border border-bunker-700 bg-bunker-900 px-3 py-3">
                  <p className="font-terminal text-xs text-amber-400">{i + 1}</p>
                  <p className="text-paper-100">{t(`diagram.${step}`)}</p>
                  <p className="text-xs text-paper-500">{t(`diagram.${step}Detail`)}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className="hidden px-1 text-paper-500 sm:block">
                    →
                  </span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="text-paper-500 sm:hidden">
                  ↓
                </span>
              )}
            </li>
          ))}
        </ol>
        <figcaption className="text-sm text-paper-500">{t("diagram.caption")}</figcaption>
      </figure>

      <section className="space-y-3">
        <h2 className="font-typewriter text-2xl text-paper-100">{t("axes.title")}</h2>
        <p className="text-paper-300">{t("axes.body")}</p>
        <ul className="space-y-1 text-sm text-paper-300">
          {AXIS_KEYS.map((axis) => (
            <li key={axis}>
              <strong className="text-paper-100">
                {axes(`${axis}.plus`)} ↔ {axes(`${axis}.minus`)}
              </strong>
            </li>
          ))}
        </ul>
      </section>

      {SECTIONS.map((section) => (
        <section key={section} className="space-y-3">
          <h2 className="font-typewriter text-2xl text-paper-100">{t(`${section}.title`)}</h2>
          <p className="text-paper-300">{t(`${section}.body`)}</p>
        </section>
      ))}

      <p>
        <a href={ENGINE_URL} className="text-amber-400 underline underline-offset-4" rel="noopener">
          {t("codeLink")}
        </a>
      </p>
    </article>
  );
}
