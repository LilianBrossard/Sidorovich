import { useTranslations } from "next-intl";

const REPOSITORY_URL = "https://github.com/LilianBrossard/Sidorovich";

/** Pied de page commun : avertissement fan et liens annexes [F-03] [L-01] [N-07]. */
export function SiteFooter() {
  const t = useTranslations("common");

  return (
    <footer className="border-t border-bunker-700 bg-bunker-950">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-x-8 gap-y-2 px-4 py-5 text-xs leading-relaxed text-paper-500 sm:px-8">
        <div>
          <p>{t("disclaimer")}</p>
          <p>{t("notice")}</p>
        </div>
        <a
          href={REPOSITORY_URL}
          className="self-start underline underline-offset-4 hover:text-paper-100"
          rel="noopener"
        >
          {t("sourceCode")}
        </a>
      </div>
    </footer>
  );
}
