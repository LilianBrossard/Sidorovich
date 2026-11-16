import { IBM_Plex_Mono, PT_Mono, PT_Sans } from "next/font/google";

// Trois polices, toutes avec le cyrillique, y compris ї, є, і et ґ [I-04].
// `subsets` ne règle que le préchargement : les autres alphabets sont servis à la demande.

/** Texte courant. */
export const fontSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt-sans",
  display: "swap",
});

/**
 * Repli des polices à chasse fixe : Courier New (et ses équivalents métriques, Liberation
 * Mono, Cousine) a la même chasse que PT Mono et IBM Plex Mono (0,6 em). Le texte garde donc
 * ses coupures de ligne quand la police arrive : pas de décalage de mise en page [T-04].
 * Le repli générique « monospace » (Consolas sous Windows) est plus étroit.
 * next/font exige des littéraux : la liste est répétée dans chaque appel.
 */

/** Machine à écrire : le dossier de recrutement. */
export const fontTypewriter = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pt-mono",
  display: "swap",
  fallback: ["Courier New", "Liberation Mono", "Cousine", "ui-monospace", "monospace"],
  adjustFontFallback: false,
});

/** Écran du PDA. */
export const fontTerminal = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "Liberation Mono", "Cousine", "ui-monospace", "monospace"],
  adjustFontFallback: false,
});

export const fontVariables = [fontSans, fontTypewriter, fontTerminal]
  .map((font) => font.variable)
  .join(" ");
