import type { Questionnaire } from "@/lib/quiz/types";

/**
 * Questionnaire v1 : uniquement la logique (deltas par axe).
 * Les textes sont dans src/messages/{langue}.json, sous `questionnaire.{id}`.
 * Toute modification exige de relancer `npm run calibrate`.
 */
export const questionnaireV1 = {
  version: "v1",
  codeChar: "1",
  questions: [
    {
      id: "Q01",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { IDE: -2, ALT: 1, FOR: 1 } },
        { id: "b", deltas: { IDE: 1, FOR: -1, FOI: 1 } },
        { id: "c", deltas: { FOR: -2, ALT: 1 } },
        { id: "d", deltas: { ALT: -1, IDE: -1, COL: 1 } },
      ],
    },
    {
      id: "Q02",
      type: "choice",
      kind: "situation",
      answers: [
        { id: "a", deltas: { ORD: 2, COL: 1 } },
        { id: "b", deltas: { ORD: 1, COL: 1, IDE: -1 } },
        { id: "c", deltas: { ORD: -1, COL: -1, IDE: -1 } },
        { id: "d", deltas: { ORD: -2, COL: -1, IDE: 1 } },
      ],
    },
    {
      id: "Q03",
      type: "choice",
      kind: "situation",
      answers: [
        { id: "a", deltas: { ALT: 2, ORD: 1 } },
        { id: "b", deltas: { ALT: 1, IDE: -1 } },
        { id: "c", deltas: { ALT: -1, IDE: -1 } },
        { id: "d", deltas: { ALT: -2, ORD: -1 } },
      ],
    },
    {
      id: "Q04",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { ALT: 2, IDE: 1 } },
        { id: "b", deltas: { ALT: 1, FOR: 1, IDE: -1 } },
        { id: "c", deltas: { IDE: -1, COL: -1 } },
        { id: "d", deltas: { ALT: -2, COL: -1 } },
      ],
    },
    {
      id: "Q05",
      type: "choice",
      kind: "society",
      answers: [
        { id: "a", deltas: { FOI: -2, ZON: 1, FOR: -1 } },
        { id: "b", deltas: { ZON: -2, FOR: 1, IDE: 1 } },
        { id: "c", deltas: { ZON: -2, ORD: 1, IDE: -1 } },
        { id: "d", deltas: { ZON: 2, FOI: 1 } },
      ],
    },
    { id: "Q06", type: "scale", kind: "statement", deltas: { FOI: 2, ZON: 1 } },
    {
      id: "Q07",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { IDE: 2, ORD: 1 } },
        { id: "b", deltas: { IDE: -2, ORD: 1, COL: -1 } },
        { id: "c", deltas: { ALT: -2, ORD: -1, IDE: -1 } },
        { id: "d", deltas: { IDE: -2, COL: -1 } },
      ],
    },
    {
      id: "Q08",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { ORD: 2, COL: 1, IDE: 1 } },
        { id: "b", deltas: { ORD: -1, ALT: 1, IDE: -1 } },
        { id: "c", deltas: { ORD: -2, COL: 1 } },
        { id: "d", deltas: { ALT: -2, ORD: -1, IDE: -1 } },
      ],
    },
    {
      id: "Q09",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { IDE: -2, ALT: -1 } },
        { id: "b", deltas: { IDE: -1, ALT: 1 } },
        { id: "c", deltas: { IDE: 2 } },
        { id: "d", deltas: { IDE: 1, FOR: 1, ORD: -1 } },
      ],
    },
    { id: "Q10", type: "scale", kind: "statement", deltas: { FOR: 2 } },
    {
      id: "Q11",
      type: "choice",
      kind: "preference",
      answers: [
        { id: "a", deltas: { COL: 2, ORD: 1 } },
        { id: "b", deltas: { COL: 1, ORD: -1 } },
        { id: "c", deltas: { COL: -1, IDE: -1 } },
        { id: "d", deltas: { COL: -2, ALT: -1 } },
      ],
    },
    {
      id: "Q12",
      type: "choice",
      kind: "society",
      answers: [
        { id: "a", deltas: { ZON: -2, IDE: -1 } },
        { id: "b", deltas: { ZON: -1, ALT: 1 } },
        { id: "c", deltas: { ZON: 1, IDE: 1 } },
        { id: "d", deltas: { ZON: 2, FOI: 1, IDE: 1 } },
      ],
    },
    {
      id: "Q13",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { ORD: -2, IDE: 2, COL: -1 } },
        { id: "b", deltas: { ORD: 2, COL: 1 } },
        { id: "c", deltas: { IDE: -1, ORD: 1, ALT: 1 } },
        { id: "d", deltas: { ALT: -2, IDE: -2 } },
      ],
    },
    {
      id: "Q14",
      type: "choice",
      kind: "values",
      answers: [
        { id: "a", deltas: { COL: 2, IDE: 2, FOI: 1, FOR: 1 } },
        { id: "b", deltas: { IDE: 1, FOR: -1 } },
        { id: "c", deltas: { IDE: -1, COL: -1, FOI: -1 } },
        { id: "d", deltas: { IDE: -2, COL: -2, ALT: -1 } },
      ],
    },
    {
      id: "Q15",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { FOI: -1, IDE: -1, ZON: -1 } },
        { id: "b", deltas: { FOI: -1, IDE: 1 } },
        { id: "c", deltas: { ALT: 2, COL: 1, IDE: 1, FOI: -1 } },
        { id: "d", deltas: { FOI: 1, IDE: 1, ZON: 1 } },
      ],
    },
    { id: "Q16", type: "scale", kind: "statement", deltas: { ORD: 2, FOR: 1 } },
    {
      id: "Q17",
      type: "choice",
      kind: "situation",
      answers: [
        { id: "a", deltas: { ALT: 1, ORD: -1, COL: 1 } },
        { id: "b", deltas: { ORD: 2 } },
        { id: "c", deltas: { IDE: -1, ORD: 1, ALT: -1, COL: -1 } },
        { id: "d", deltas: { ALT: -2, FOR: 1, ORD: -1 } },
      ],
    },
    {
      id: "Q18",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { FOR: 2, ZON: -2 } },
        { id: "b", deltas: { ZON: -1, FOI: -2 } },
        { id: "c", deltas: { ZON: 2, FOR: -1 } },
        { id: "d", deltas: { FOI: 2, ZON: 1 } },
      ],
    },
    {
      id: "Q19",
      type: "choice",
      kind: "society",
      answers: [
        { id: "a", deltas: { ORD: 2, IDE: -1 } },
        { id: "b", deltas: { ORD: 1 } },
        { id: "c", deltas: { ORD: -2, IDE: 1, COL: -1 } },
        { id: "d", deltas: { ORD: -2, FOR: 1 } },
      ],
    },
    { id: "Q20", type: "scale", kind: "statement", deltas: { ZON: 2, IDE: 1, FOI: 1 } },
    {
      id: "Q21",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { ALT: 1, COL: 1, IDE: 1 } },
        { id: "b", deltas: { COL: 1, FOR: 1, ORD: 1 } },
        { id: "c", deltas: { COL: -1, ALT: -1 } },
        { id: "d", deltas: { ORD: 2, FOR: 1 } },
      ],
    },
    {
      id: "Q22",
      type: "choice",
      kind: "situation",
      answers: [
        { id: "a", deltas: { ORD: 1, FOR: 2 } },
        { id: "b", deltas: { ORD: 2 } },
        { id: "c", deltas: { ALT: 2, FOR: -1 } },
        { id: "d", deltas: { ORD: -2, FOR: -1 } },
      ],
    },
    { id: "Q23", type: "scale", kind: "statement", deltas: { FOI: -2, ZON: -1 } },
    {
      id: "Q24",
      type: "choice",
      kind: "values",
      answers: [
        { id: "a", deltas: { ALT: 2, ORD: -1, IDE: 1 } },
        { id: "b", deltas: { ZON: -2, IDE: 1, ALT: 1 } },
        { id: "c", deltas: { ZON: 1, FOI: -1, IDE: 1 } },
        { id: "d", deltas: { ALT: -2, IDE: -2, COL: -1 } },
      ],
    },
  ],
} as const satisfies Questionnaire;
