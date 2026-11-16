import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

/**
 * Adresse publique du site, pour les liens absolus (aperçus, sitemap) [T-08].
 * Sur Vercel, l'adresse de production est fournie par la plateforme ; en local, aucune
 * variable n'est nécessaire [T-02].
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://sidorovich.vercel.app"),
);

/** Pages publiques et indexées, sans la langue (« » = accueil). */
export const PUBLIC_PATHS = ["", "/quiz", "/factions", "/how-it-works", "/about"] as const;

/** Langue au format Open Graph. */
export const OG_LOCALES: Readonly<Record<AppLocale, string>> = {
  fr: "fr_FR",
  en: "en_US",
  uk: "uk_UA",
  ru: "ru_RU",
};

/** Adresses de la même page dans chaque langue, plus x-default (anglais) [I-06]. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, `/${locale}${path}`])),
    "x-default": `/${routing.defaultLocale}${path}`,
  };
}

interface PageMetadataOptions {
  readonly locale: AppLocale;
  /** Chemin sans la langue, par exemple « /quiz ». */
  readonly path: string;
  readonly siteName: string;
  /** Titre de la page ; absent pour l'accueil, qui porte le nom du site. */
  readonly title?: string;
  readonly description: string;
  /**
   * Texte alternatif de l'image d'aperçu par défaut de la langue ; null pour une page qui a
   * sa propre image (fichier opengraph-image du segment, comme les résultats).
   */
  readonly imageAlt: string | null;
  /** Faux pour les pages à ne pas indexer (résultats, page de test). */
  readonly index?: boolean;
}

/** Métadonnées complètes d'une page : canonique, hreflang, Open Graph, carte X [T-08]. */
export function pageMetadata({
  locale,
  path,
  siteName,
  title,
  description,
  imageAlt,
  index = true,
}: PageMetadataOptions): Metadata {
  // L'objet openGraph d'une page remplace celui hérité : on y remet l'image par défaut.
  // Une image passée ici remplacerait aussi celle du segment : les résultats n'en passent pas.
  const images =
    imageAlt === null
      ? undefined
      : [{ url: `/${locale}/opengraph-image/default`, width: 1200, height: 630, alt: imageAlt }];
  const fullTitle = title ? `${title} · ${siteName}` : siteName;
  const url = `/${locale}${path}`;
  return {
    title: title ?? { absolute: siteName },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      url,
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      // Clé absente, et non undefined : sinon l'image du segment disparaît aussi.
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images && { images }),
    },
    robots: index ? undefined : { index: false, follow: true },
  };
}
