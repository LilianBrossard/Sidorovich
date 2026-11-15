import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Sans langue explicite, on lit le segment racine [locale] de l'URL.
  if (!locale) {
    const paramValue = await rootParams.locale();
    // Segment invalide : on rend en langue par défaut. Ce n'est pas ici qu'on lève la 404 :
    // levée dans le layout racine, elle afficherait la page brute de Next.js.
    // C'est app/[locale]/(site)/layout.tsx qui la lève.
    locale = hasLocale(routing.locales, paramValue) ? paramValue : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
