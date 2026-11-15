import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import ru from "@/messages/ru.json";
import uk from "@/messages/uk.json";

// Complétude des traductions [I-03] : le français est la référence.

type Catalog = { [key: string]: string | Catalog };

function flatten(catalog: Catalog, prefix = ""): Record<string, string> {
  return Object.entries(catalog).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? { ...acc, [path]: value }
      : { ...acc, ...flatten(value, path) };
  }, {});
}

/** Variables ICU d'un message, par exemple {first} ou {count, plural, …}. */
const placeholders = (message: string) =>
  [...message.matchAll(/\{\s*([\w]+)/g)].map((match) => match[1]).sort();

const catalogs: Record<string, Catalog> = { fr, en, uk, ru };
const reference = flatten(fr);

describe("traductions [I-03]", () => {
  it("chaque langue du routage a un catalogue, et inversement", () => {
    expect(Object.keys(catalogs).sort()).toEqual([...routing.locales].sort());
  });

  for (const [locale, catalog] of Object.entries(catalogs)) {
    const messages = flatten(catalog);

    it(`${locale} : mêmes clés que le français`, () => {
      expect(Object.keys(messages).sort()).toEqual(Object.keys(reference).sort());
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

    it(`${locale} : apostrophes typographiques (’) et pas d'apostrophe droite dans un mot`, () => {
      // L'apostrophe droite est un caractère d'échappement en syntaxe ICU.
      const straight = Object.entries(messages).filter(([, v]) => /\p{L}'\p{L}/u.test(v));
      expect(straight).toEqual([]);
    });
  }
});
