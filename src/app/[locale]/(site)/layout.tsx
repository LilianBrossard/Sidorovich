import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

/**
 * Garde de langue. Placée sous le layout racine, la 404 qu'elle lève est rattrapée par
 * app/[locale]/not-found.tsx : la page d'erreur garde le style du site.
 */
export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  if (!hasLocale(routing.locales, await rootParams.locale())) notFound();
  return children;
}
