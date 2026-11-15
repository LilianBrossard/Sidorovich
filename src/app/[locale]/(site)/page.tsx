import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/SiteFooter";

/** Accueil provisoire (phase 1). Le bunker arrive en phase 5, le questionnaire en phase 4. */
export default function HomePage() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const meta = useTranslations("metadata");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">
          {t("kicker")}
        </p>
        <LanguageSwitcher />
      </header>

      <section className="my-auto py-10">
        <h1 className="font-typewriter text-4xl text-paper-100 sm:text-6xl">{meta("title")}</h1>
        <p className="mt-3 text-lg text-paper-300">{t("tagline")}</p>

        <figure className="mt-8 border-l-2 border-rust-500 pl-4">
          <blockquote className="font-typewriter leading-relaxed text-paper-300">
            <p>{t("intro")}</p>
          </blockquote>
          <figcaption className="mt-2 font-terminal text-xs text-paper-500">
            — {common("speaker")}
          </figcaption>
        </figure>

        <div className="mt-8">
          <button
            type="button"
            disabled
            aria-describedby="cta-soon"
            className="cursor-not-allowed rounded-sm border border-amber-400/60 px-5 py-3 font-terminal text-sm tracking-wider text-amber-400/80 uppercase"
          >
            {t("cta")}
          </button>
          <p id="cta-soon" className="mt-2 text-sm text-paper-500">
            {t("ctaSoon")}
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
