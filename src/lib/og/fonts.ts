import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Polices des images d'aperçu [F-28]. Le moteur de rendu (Satori) lit le WOFF, pas le WOFF2 :
// les fichiers, latin et cyrillique, sont dans assets/fonts/ (licence SIL OFL 1.1).
const font = (file: string) => readFile(join(process.cwd(), "assets", "fonts", file));

const [ptLatin, ptCyrillic, plexLatin, plexCyrillic, plexLatinBold, plexCyrillicBold] =
  await Promise.all([
    font("pt-mono-latin-400-normal.woff"),
    font("pt-mono-cyrillic-400-normal.woff"),
    font("ibm-plex-mono-latin-400-normal.woff"),
    font("ibm-plex-mono-cyrillic-400-normal.woff"),
    font("ibm-plex-mono-latin-600-normal.woff"),
    font("ibm-plex-mono-cyrillic-600-normal.woff"),
  ]);

/** Une famille par sous-ensemble : le moteur passe à la suivante pour les lettres absentes. */
export const OG_FONTS = [
  { name: "PT Mono", data: ptLatin, weight: 400 as const, style: "normal" as const },
  { name: "PT Mono Cyrillic", data: ptCyrillic, weight: 400 as const, style: "normal" as const },
  { name: "Plex", data: plexLatin, weight: 400 as const, style: "normal" as const },
  { name: "Plex Cyrillic", data: plexCyrillic, weight: 400 as const, style: "normal" as const },
  { name: "Plex", data: plexLatinBold, weight: 600 as const, style: "normal" as const },
  { name: "Plex Cyrillic", data: plexCyrillicBold, weight: 600 as const, style: "normal" as const },
];

export const TYPEWRITER = "'PT Mono', 'PT Mono Cyrillic'";
export const TERMINAL = "Plex, 'Plex Cyrillic'";

/** Taille des images Open Graph. */
export const OG_SIZE = { width: 1200, height: 630 };
