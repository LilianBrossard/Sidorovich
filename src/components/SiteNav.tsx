"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_LABELS, routing } from "@/i18n/routing";

const LINKS = [
  { href: "/quiz", key: "quiz" },
  { href: "/factions", key: "factions" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/about", key: "about" },
] as const;

/**
 * Navigation et langues [F-02]. Sur ordinateur : tout est visible. Sur mobile : un bouton
 * « Menu » ouvre un panneau, refermé par Échap ou au changement de page.
 */
export function SiteNav() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const current = useLocale();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const button = useRef<HTMLButtonElement>(null);

  // Nouvelle page : le panneau se referme (ajustement d'état pendant le rendu).
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) {
    setShownPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const links = (className: string) => (
    <ul className={className}>
      {LINKS.map(({ href, key }) => {
        const active = pathname === href;
        return (
          <li key={key}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "text-amber-400 underline underline-offset-4"
                  : "text-paper-300 hover:text-paper-100"
              }
            >
              {t(key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const languages = (short: boolean, className: string) => (
    <ul aria-label={common("languageLabel")} className={className}>
      {routing.locales.map((locale) => {
        const active = locale === current;
        const code = locale.toUpperCase();
        return (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={active ? "true" : undefined}
              aria-label={short ? `${LOCALE_LABELS[locale]} (${code})` : undefined}
              className={
                active
                  ? "text-amber-400 underline underline-offset-4"
                  : "text-paper-300 hover:text-paper-100"
              }
            >
              {short ? code : LOCALE_LABELS[locale]}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <nav aria-label={t("label")} className="hidden items-center gap-x-7 md:flex">
        {links("flex flex-wrap gap-x-7 gap-y-1")}
        <span aria-hidden="true" className="h-4 w-px bg-bunker-700" />
        {languages(true, "flex gap-3 font-terminal text-sm")}
      </nav>

      <button
        ref={button}
        type="button"
        data-testid="menu-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-bunker-700 px-3 font-terminal text-xs tracking-wider text-paper-100 uppercase md:hidden"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {t("menu")}
      </button>

      {open && (
        <nav
          id={panelId}
          aria-label={t("label")}
          className="basis-full space-y-5 border-t border-bunker-700 pt-4 pb-2 md:hidden"
        >
          {links("space-y-3 text-lg")}
          {languages(false, "flex flex-wrap gap-x-5 gap-y-2 font-terminal text-sm")}
        </nav>
      )}
    </>
  );
}
