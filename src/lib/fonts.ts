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

/** Machine à écrire : le dossier de recrutement. */
export const fontTypewriter = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pt-mono",
  display: "swap",
});

/** Écran du PDA. */
export const fontTerminal = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = [fontSans, fontTypewriter, fontTerminal]
  .map((font) => font.variable)
  .join(" ");
