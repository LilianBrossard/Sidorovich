"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_LABELS, routing } from "@/i18n/routing";

/** Sélecteur de langue : garde la page courante, change seulement la langue [F-02]. */
export function LanguageSwitcher() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const current = useLocale();

  return (
    <nav aria-label={t("languageLabel")}>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-terminal text-xs">
        {routing.locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                lang={locale}
                hrefLang={locale}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-amber-400 underline underline-offset-4"
                    : "text-paper-500 hover:text-paper-100"
                }
              >
                {LOCALE_LABELS[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
