// Codes de résultat partageables, sans base de données [F-25] [F-26].
//
// Format : <version : 1 car.><réponses : n car.><contrôle : 2 car.>, alphabet base64url.
// Les réponses forment un nombre en base mixte (4 options par question à choix,
// 5 par affirmation), écrit en base 64 sur une longueur fixe.
// Le contrôle est une somme pondérée modulo 4093 (nombre premier) : il détecte toute
// substitution d'un caractère et toute inversion de deux caractères voisins.
import { compile } from "./engine";
import type { Answers, Questionnaire } from "./types";

export const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE = BigInt(CODE_ALPHABET.length);
const CHECKSUM_MODULUS = 4093;

export type DecodeError = "length" | "alphabet" | "version" | "checksum" | "range";

export type DecodeResult<Q extends Questionnaire = Questionnaire> =
  | { readonly ok: true; readonly questionnaire: Q; readonly answers: number[] }
  | { readonly ok: false; readonly error: DecodeError };

/** Nombre de combinaisons de réponses possibles. */
const combinations = (questionnaire: Questionnaire): bigint =>
  compile(questionnaire).radices.reduce((total, radix) => total * BigInt(radix), 1n);

/** Longueur fixe de la partie « réponses » du code. */
export function payloadLength(questionnaire: Questionnaire): number {
  let length = 0;
  for (let capacity = 1n; capacity < combinations(questionnaire); capacity *= BASE) length++;
  return length;
}

export const codeLength = (questionnaire: Questionnaire): number =>
  1 + payloadLength(questionnaire) + 2;

/** Somme de contrôle (2 caractères) d'un corps de code : version + réponses. */
export function checksum(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum = (sum + CODE_ALPHABET.indexOf(body[i]) * (i + 1)) % CHECKSUM_MODULUS;
  }
  return CODE_ALPHABET[Math.floor(sum / 64)] + CODE_ALPHABET[sum % 64];
}

/** Encode des réponses complètes en code d'URL. */
export function encodeAnswers(questionnaire: Questionnaire, answers: Answers): string {
  const { radices } = compile(questionnaire);
  if (
    answers.length !== radices.length ||
    !answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < radices[i])
  ) {
    throw new RangeError("Réponses incomplètes ou hors limites.");
  }

  // Base mixte, la première question en poids fort.
  let value = answers.reduce((acc, answer, i) => acc * BigInt(radices[i]) + BigInt(answer), 0n);

  let payload = "";
  for (let i = 0; i < payloadLength(questionnaire); i++) {
    payload = CODE_ALPHABET[Number(value % BASE)] + payload;
    value /= BASE;
  }
  const body = questionnaire.codeChar + payload;
  return body + checksum(body);
}

/**
 * Décode un code de résultat. Ne lève jamais d'exception : toute entrée invalide
 * renvoie une erreur typée, pour afficher une page propre [F-25].
 */
export function decodeAnswers<Q extends Questionnaire>(
  versions: readonly Q[],
  code: string,
): DecodeResult<Q> {
  if (typeof code !== "string" || code.length < 3) return { ok: false, error: "length" };
  if ([...code].some((char) => !CODE_ALPHABET.includes(char))) {
    return { ok: false, error: "alphabet" };
  }

  const questionnaire = versions.find((q) => q.codeChar === code[0]);
  if (!questionnaire) return { ok: false, error: "version" };
  if (code.length !== codeLength(questionnaire)) return { ok: false, error: "length" };

  const body = code.slice(0, -2);
  if (checksum(body) !== code.slice(-2)) return { ok: false, error: "checksum" };

  let value = [...body.slice(1)].reduce(
    (acc, char) => acc * BASE + BigInt(CODE_ALPHABET.indexOf(char)),
    0n,
  );
  if (value >= combinations(questionnaire)) return { ok: false, error: "range" };

  const { radices } = compile(questionnaire);
  const answers = new Array<number>(radices.length);
  for (let i = radices.length - 1; i >= 0; i--) {
    const radix = BigInt(radices[i]);
    answers[i] = Number(value % radix);
    value /= radix;
  }
  return { ok: true, questionnaire, answers };
}
