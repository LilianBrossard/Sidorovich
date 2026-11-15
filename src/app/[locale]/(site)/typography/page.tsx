import type { Metadata } from "next";

// Page de contrôle typographique [I-04] : vérifie à l'œil le latin et le cyrillique,
// y compris les lettres ukrainiennes ї, є, і et ґ. Non indexée, non liée depuis le site.
export const metadata: Metadata = {
  title: "Typographie",
  robots: { index: false, follow: false },
};

const SAMPLES = [
  {
    lang: "fr",
    text: "Dès Noël, où un zéphyr haï me vêt de glaçons würmiens, je dîne d’exquis rôtis de bœuf.",
  },
  { lang: "en", text: "The quick brown fox jumps over the lazy dog. 0123456789 % € ₴ ₽" },
  { lang: "uk", text: "Чуєш їх, доцю, га? Кумедна ж ти, прощайся без ґольфів! Ї ї Є є І і Ґ ґ" },
  { lang: "ru", text: "Съешь же ещё этих мягких французских булок, да выпей чаю. Ё ё Ъ ъ Ы ы" },
] as const;

const FONTS = [
  { name: "PT Sans 400 / 700 · texte courant", className: "font-sans" },
  { name: "PT Mono · dossier (machine à écrire)", className: "font-typewriter" },
  { name: "IBM Plex Mono 400 / 600 · PDA", className: "font-terminal" },
] as const;

export default function TypographyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-terminal text-sm tracking-[0.25em] text-amber-400 uppercase">
        Contrôle typographique [I-04]
      </h1>
      {FONTS.map((font) => (
        <section key={font.className} className="mt-10">
          <h2 className="border-b border-bunker-700 pb-2 font-terminal text-xs text-paper-500">
            {font.name}
          </h2>
          <div className={`${font.className} mt-4 space-y-3`}>
            {SAMPLES.map((sample) => (
              <p key={sample.lang} lang={sample.lang} className="text-lg">
                <span className="mr-3 font-terminal text-xs text-paper-500 uppercase">
                  {sample.lang}
                </span>
                {sample.text}
                <span className="ml-3 font-bold">{sample.text.slice(0, 24)}</span>
              </p>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
