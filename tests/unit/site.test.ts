import { describe, expect, it } from "vitest";
import { languageAlternates, pageMetadata, PUBLIC_PATHS, SITE_URL } from "@/lib/site";

const base = {
  locale: "fr" as const,
  path: "/quiz",
  siteName: "Sidorovich RH",
  title: "L’entretien",
  description: "Description.",
};

describe("métadonnées des pages [T-08] [I-06]", () => {
  it("adresse du site par défaut : la production sur Vercel", () => {
    expect(SITE_URL.protocol).toBe("https:");
  });

  it("chaque page renvoie vers ses 4 langues, plus x-default en anglais", () => {
    expect(languageAlternates("/quiz")).toEqual({
      fr: "/fr/quiz",
      en: "/en/quiz",
      uk: "/uk/quiz",
      ru: "/ru/quiz",
      "x-default": "/en/quiz",
    });
  });

  it("canonique, Open Graph et carte X complets", () => {
    const metadata = pageMetadata({ ...base, imageAlt: "Alt" });
    expect(metadata.alternates?.canonical).toBe("/fr/quiz");
    expect(metadata.openGraph).toMatchObject({
      title: "L’entretien · Sidorovich RH",
      url: "/fr/quiz",
      locale: "fr_FR",
      alternateLocale: ["en_US", "uk_UA", "ru_RU"],
      images: [{ url: "/fr/opengraph-image/default", width: 1200, height: 630, alt: "Alt" }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.robots).toBeUndefined();
  });

  it("l'accueil porte le nom du site, sans modèle de titre", () => {
    const metadata = pageMetadata({ ...base, path: "", title: undefined, imageAlt: "Alt" });
    expect(metadata.title).toEqual({ absolute: "Sidorovich RH" });
    expect(metadata.openGraph?.title).toBe("Sidorovich RH");
  });

  it("une page avec sa propre image ne déclare aucune image (clé absente)", () => {
    const metadata = pageMetadata({ ...base, imageAlt: null, index: false });
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("les pages publiques commencent par l'accueil et le questionnaire", () => {
    expect(PUBLIC_PATHS.slice(0, 2)).toEqual(["", "/quiz"]);
  });
});
