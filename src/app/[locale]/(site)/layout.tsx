import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { routing } from "@/i18n/routing";

/**
 * Garde de langue et habillage commun. Placée sous le layout racine, la 404 qu'elle lève
 * est rattrapée par app/[locale]/not-found.tsx : la page d'erreur garde le style du site.
 * Chaque page pose son propre décor (béton, bureau, écran) sur toute la largeur.
 */
export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  if (!hasLocale(routing.locales, await rootParams.locale())) notFound();
  return (
    <>
      <SiteHeader />
      <main id="content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
