import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Le français est la langue source des textes ; l'anglais sert de repli
  // quand la langue du navigateur n'est pas prise en charge [I-02].
  locales: ["fr", "en", "uk", "ru"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

/** Chaque langue est affichée dans sa propre langue [I-08]. */
export const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
  uk: "Українська",
  ru: "Русский",
};
