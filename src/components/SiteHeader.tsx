import { useTranslations } from "next-intl";
import { SiteNav } from "@/components/SiteNav";
import { Link } from "@/i18n/navigation";

/** En-tête commun : lien d'évitement, nom du site, navigation et langues [F-02]. */
export function SiteHeader() {
  const t = useTranslations("nav");
  const meta = useTranslations("metadata");

  return (
    <header className="border-b border-bunker-700 bg-bunker-950">
      <a
        href="#content"
        className="sr-only rounded-sm bg-amber-400 px-3 py-2 text-ink-900 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 py-2 sm:px-8 md:py-4">
        <Link
          href="/"
          className="font-terminal text-sm tracking-[0.22em] text-amber-400 uppercase hover:text-paper-100"
        >
          {meta("title")}
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
