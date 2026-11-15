import { useTranslations } from "next-intl";

const REPOSITORY_URL = "https://github.com/LilianBrossard/Sidorovich";

/** Pied de page commun : avertissement fan et liens annexes [F-03] [L-01] [N-07]. */
export function SiteFooter() {
  const t = useTranslations("common");

  return (
    <footer className="mt-12 border-t border-bunker-700 pt-6 text-xs leading-relaxed text-paper-500">
      <p>{t("notice")}</p>
      <p className="mt-1">{t("disclaimer")}</p>
      <p className="mt-3">
        <a
          href={REPOSITORY_URL}
          className="underline underline-offset-4 hover:text-paper-100"
          rel="noopener"
        >
          {t("sourceCode")}
        </a>
      </p>
    </footer>
  );
}
