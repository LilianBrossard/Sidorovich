import { describe, expect, it } from "vitest";
import { fingerprint, stableStringify } from "@/lib/quiz/fingerprint";

describe("empreinte", () => {
  it("ne dépend pas de l'ordre des clés", () => {
    expect(stableStringify({ b: 1, a: [2, { d: 3, c: 4 }] })).toBe('{"a":[2,{"c":4,"d":3}],"b":1}');
    expect(fingerprint({ x: 1, y: 2 })).toBe(fingerprint({ y: 2, x: 1 }));
  });

  it("ignore les clés non définies, comme JSON", () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it("change dès qu'une valeur change", () => {
    expect(fingerprint({ deltas: { ORD: 1 } })).not.toBe(fingerprint({ deltas: { ORD: 2 } }));
  });

  it("est une chaîne hexadécimale de 14 caractères", () => {
    expect(fingerprint("Sidorovich")).toMatch(/^[0-9a-f]{14}$/);
  });
});
