"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const LINKS = [
  { href: "/quiz", key: "quiz" },
  { href: "/factions", key: "factions" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/about", key: "about" },
] as const;

/** Liens principaux ; la page courante est signalée aux lecteurs d'écran. */
export function NavLinks() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
    </nav>
  );
}
