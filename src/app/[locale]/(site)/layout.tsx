import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { routing } from "@/i18n/routing";

/**
 * Garde de langue et habillage commun. Placée sous le layout racine, la 404 qu'elle lève
 * est rattrapée par app/[locale]/not-found.tsx : la page d'erreur garde le style du site.
 */
export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  if (!hasLocale(routing.locales, await rootParams.locale())) notFound();
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
        {children}
      </main>
      <div className="mx-auto w-full max-w-3xl px-4 pb-8">
        <SiteFooter />
      </div>
    </>
  );
}
