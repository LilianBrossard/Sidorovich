import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import ru from "@/messages/ru.json";
import uk from "@/messages/uk.json";

// Complétude des traductions [I-03] : le français est la référence.

type Catalog = { [key: string]: string | Catalog };

/**
 * Espaces de noms écrits en français mais pas encore traduits : contenu du questionnaire,
 * traduit en phase 3 du plan. Ils doivent être soit absents, soit complets dans une langue.
 * À vider en phase 3.
 */
const PENDING_TRANSLATION = [
  "sidorovich",
  "axes",
  "factions",
  "questionKinds",
  "scale",
  "questionnaire",
] as const;

function flatten(catalog: Catalog, prefix = ""): Record<string, string> {
  return Object.entries(catalog).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? { ...acc, [path]: value }
      : { ...acc, ...flatten(value, path) };
  }, {});
}

/** Variables ICU d'un message, par exemple {faction} ou {count, plural, …}. */
const placeholders = (message: string) =>
  [...message.matchAll(/\{\s*([\w]+)/g)].map((match) => match[1]).sort();

const catalogs: Record<string, Catalog> = { fr, en, uk, ru };
const reference = flatten(fr);
const namespaceOf = (key: string) => key.split(".")[0];

describe("traductions [I-03]", () => {
  it("chaque langue du routage a un catalogue, et inversement", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...routing.locales].sort());
  });

  for (const [locale, catalog] of Object.entries(catalogs)) {
    const messages = flatten(catalog);
    const present = new Set(Object.keys(catalog));
    // Clés attendues : toutes celles du français, sauf les espaces en attente absents ici.
    const expected = Object.keys(reference).filter((key) => {
      const namespace = namespaceOf(key);
      return (
        !(PENDING_TRANSLATION as readonly string[]).includes(namespace) || present.has(namespace)
      );
    });

    it(`${locale} : mêmes clés que le français`, () => {
      expect(Object.keys(messages).sort()).toEqual(expected.sort());
    });

    it(`${locale} : aucune chaîne vide`, () => {
      const empty = Object.entries(messages).filter(([, value]) => value.trim() === "");
      expect(empty).toEqual([]);
    });

    it(`${locale} : mêmes variables que le français`, () => {
      for (const [key, value] of Object.entries(messages)) {
        expect(placeholders(value), key).toEqual(placeholders(reference[key] ?? ""));
      }
    });
  }

  it("le français contient tous les espaces de noms en attente de traduction", () => {
    for (const namespace of PENDING_TRANSLATION) expect(fr).toHaveProperty(namespace);
  });
});
