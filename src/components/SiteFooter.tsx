import { useTranslations } from "next-intl";

const REPOSITORY_URL = "https://github.com/LilianBrossard/Sidorovich";
const PORTFOLIO_URL = "https://lilian-brossard.vercel.app";

/** Pied de page commun : avertissement fan, auteur et liens annexes [F-03] [L-01] [N-07]. */
export function SiteFooter() {
  const t = useTranslations("common");
  const link = "underline underline-offset-4 hover:text-paper-100";

  return (
    <footer className="border-t border-bunker-700 bg-bunker-950">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-x-8 gap-y-3 px-4 py-5 text-xs leading-relaxed text-paper-500 sm:px-8">
        <div>
          <p>{t("disclaimer")}</p>
          <p>{t("notice")}</p>
        </div>
        <p className="flex flex-wrap gap-x-5 gap-y-1 self-start">
          <span>
            {t.rich("madeBy", {
              link: (chunks) => (
                <a href={PORTFOLIO_URL} className={link} rel="author noopener">
                  {chunks}
                </a>
              ),
            })}
          </span>
          <a href={REPOSITORY_URL} className={link} rel="noopener">
            {t("sourceCode")}
          </a>
        </p>
      </div>
    </footer>
  );
}
