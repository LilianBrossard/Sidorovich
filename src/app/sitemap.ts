import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, PUBLIC_PATHS, SITE_URL } from "@/lib/site";

/**
 * Plan du site [T-08] : les pages publiques dans les 4 langues, avec leurs équivalents
 * (hreflang). Les résultats n'y figurent pas : ils ne sont pas indexés.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, SITE_URL).toString();
  return PUBLIC_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absolute(`/${locale}${path}`),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/quiz" ? 0.9 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(path)).map(([lang, href]) => [lang, absolute(href)]),
        ),
      },
    })),
  );
}
