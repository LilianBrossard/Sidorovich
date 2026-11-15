import { useTranslations } from "next-intl";
import { ResumeHint } from "@/components/quiz/ResumeHint";
import { Link } from "@/i18n/navigation";

/** Accueil : le concept et le bouton « Commencer », visible sans défilement [F-01]. */
export default function HomePage() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const meta = useTranslations("metadata");
  const sidorovich = useTranslations("sidorovich");

  return (
    <div className="flex flex-col gap-8 sm:py-6">
      <section>
        <p className="font-terminal text-xs tracking-[0.25em] text-amber-400 uppercase">
          {t("kicker")}
        </p>
        <h1 className="mt-3 font-typewriter text-4xl text-paper-100 sm:text-6xl">
          {meta("title")}
        </h1>
        <p className="mt-3 text-lg text-paper-300">{t("tagline")}</p>
      </section>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href="/quiz"
          className="rounded-sm border border-amber-400 bg-amber-400 px-5 py-3 font-terminal text-sm tracking-wider text-ink-900 uppercase hover:bg-amber-400/85"
        >
          {t("cta")}
        </Link>
        <ResumeHint />
      </div>

      <figure className="border-l-2 border-rust-500 pl-4">
        <blockquote className="font-typewriter leading-relaxed text-paper-300">
          <p>{sidorovich("intro")}</p>
        </blockquote>
        <figcaption className="mt-2 font-terminal text-xs text-paper-500">
          — {common("speaker")}
        </figcaption>
      </figure>

      <ul className="grid gap-3 text-sm text-paper-300 sm:grid-cols-3">
        {(["duration", "noRightAnswer", "privacy"] as const).map((key) => (
          <li key={key} className="rounded-sm border border-bunker-700 bg-bunker-900 px-4 py-3">
            {t(`facts.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
