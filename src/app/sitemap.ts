import type { MetadataRoute } from "next";
import { archetypeCode } from "@/data/index";
import { routing } from "@/i18n/routing";
import { FACTION_KEYS } from "@/lib/quiz/domain";
import { languageAlternates, PUBLIC_PATHS, SITE_URL } from "@/lib/site";

/**
 * Plan du site [T-08] : les pages publiques et les 12 dossiers types, dans les 4 langues,
 * avec leurs équivalents (hreflang). Les autres résultats ne sont pas indexés.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, SITE_URL).toString();
  // Les 12 dossiers types sont de vraies pages de faction : on les ajoute aux pages publiques.
  const archetypes = FACTION_KEYS.map((faction) => `/r/${archetypeCode(faction)}`);
  return [...PUBLIC_PATHS, ...archetypes].flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absolute(`/${locale}${path}`),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/quiz" ? 0.9 : path.startsWith("/r/") ? 0.4 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absolute(href)]),
        ),
      },
    })),
  );
}
