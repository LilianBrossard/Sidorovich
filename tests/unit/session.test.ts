import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { questionnaireV1 } from "@/data/questionnaire.v1";
import { compile } from "@/lib/quiz/engine";
import {
  answeredCount,
  answerOrders,
  completedAnswers,
  isComplete,
  newSession,
  parseSession,
  reduceSession,
  serializeSession,
  type QuizAction,
  type QuizSession,
} from "@/lib/quiz/session";
import { tinyQuestionnaire } from "../fixtures";

const q = questionnaireV1;
const total = q.questions.length;
const { radices } = compile(q);
const play = (session: QuizSession, ...actions: QuizAction[]) =>
  actions.reduce((s, action) => reduceSession(q, s, action), session);
const answer = (option: number): QuizAction => ({ type: "answer", option });

describe("déroulé d'une partie", () => {
  it("une partie neuve commence à la question 1, sans réponse", () => {
    const session = newSession(q, 42);
    expect(session).toMatchObject({ version: "v1", seed: 42, current: 0 });
    expect(session.answers).toEqual(radices.map(() => null));
    expect(answeredCount(session)).toBe(0);
    expect(isComplete(q, session)).toBe(false);
  });

  it("répondre enregistre l'option et passe à la question suivante", () => {
    const session = play(newSession(q, 1), answer(2));
    expect(session.answers[0]).toBe(2);
    expect(session.current).toBe(1);
  });

  it("une option hors limites est ignorée", () => {
    const start = newSession(q, 1);
    for (const option of [-1, 4, 1.5, Number.NaN]) {
      expect(play(start, answer(option))).toBe(start);
    }
  });

  it("retour arrière puis nouvelle réponse : la dernière réponse compte [F-13]", () => {
    const session = play(newSession(q, 1), answer(0), answer(1), { type: "back" }, answer(3));
    expect(session.answers.slice(0, 2)).toEqual([0, 3]);
    expect(session.current).toBe(2);
    // La réponse à la question 2 est conservée.
    expect(play(session, { type: "back" }, { type: "back" }, answer(0)).answers[1]).toBe(3);
  });

  it("on ne recule pas avant la question 1", () => {
    const start = newSession(q, 1);
    expect(play(start, { type: "back" })).toBe(start);
  });

  it("on n'avance que sur une question qui a une réponse", () => {
    const start = newSession(q, 1);
    expect(play(start, { type: "forward" })).toBe(start);
    const back = play(start, answer(1), { type: "back" });
    expect(play(back, { type: "forward" }).current).toBe(1);
  });

  it("après la dernière réponse, le dossier est complet ; plus rien ne bouge", () => {
    const done = play(newSession(q, 1), ...radices.map(() => answer(0)));
    expect(done.current).toBe(total);
    expect(isComplete(q, done)).toBe(true);
    expect(completedAnswers(q, done)).toEqual(radices.map(() => 0));
    expect(play(done, answer(1))).toBe(done);
    expect(play(done, { type: "forward" })).toBe(done);
    // On peut revenir sur la dernière question pour la modifier.
    const last = radices[total - 1] - 1;
    const changed = play(done, { type: "back" }, answer(last));
    expect(completedAnswers(q, changed)?.at(-1)).toBe(last);
  });

  it("revenir sur une question rend le dossier incomplet", () => {
    const done = play(newSession(q, 1), ...radices.map(() => answer(0)));
    expect(completedAnswers(q, play(done, { type: "back" }))).toBeNull();
  });
});

describe("mélange des réponses [F-11]", () => {
  it("même graine, même ordre : l'ordre reste stable pendant la partie", () => {
    expect(answerOrders(q, 123)).toEqual(answerOrders(q, 123));
  });

  it("chaque ordre est une permutation des options d'origine", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffffffff }), (seed) => {
        answerOrders(q, seed).forEach((order, i) => {
          expect([...order].sort()).toEqual(Array.from({ length: radices[i] }, (_, k) => k));
        });
      }),
      { numRuns: 300 },
    );
  });

  it("les échelles d'accord ne sont jamais mélangées", () => {
    const orders = answerOrders(q, 987654);
    q.questions.forEach((question, i) => {
      if (question.type === "scale") expect(orders[i]).toEqual([0, 1, 2, 3, 4]);
    });
  });

  it("deux parties ont des ordres différents, même avec des graines voisines", () => {
    const orders = Array.from({ length: 50 }, (_, seed) => JSON.stringify(answerOrders(q, seed)));
    expect(new Set(orders).size).toBe(50);
  });

  it("chaque option arrive en tête environ une fois sur quatre", () => {
    const firsts = [0, 0, 0, 0];
    for (let seed = 0; seed < 4000; seed++) firsts[answerOrders(q, seed)[0][0]]++;
    for (const count of firsts) expect(count).toBeGreaterThan(850);
  });
});

describe("sauvegarde dans le navigateur [F-14]", () => {
  const midGame = play(newSession(q, 7), answer(1), answer(2), answer(0));

  it("sauvegarder puis relire redonne la même partie", () => {
    expect(parseSession(q, serializeSession(midGame))).toEqual(midGame);
  });

  it("rien de sauvegardé ou du JSON cassé : pas de partie", () => {
    expect(parseSession(q, null)).toBeNull();
    expect(parseSession(q, "{pas du json")).toBeNull();
    expect(parseSession(q, "42")).toBeNull();
  });

  it("une partie d'une autre version est ignorée", () => {
    expect(parseSession(tinyQuestionnaire, serializeSession(midGame))).toBeNull();
  });

  it("des données incohérentes sont ignorées", () => {
    const broken: unknown[] = [
      { ...midGame, answers: midGame.answers.slice(1) },
      { ...midGame, answers: midGame.answers.with(0, 9) },
      { ...midGame, current: total + 1 },
      { ...midGame, current: 5 },
      { ...midGame, seed: -1 },
      { ...midGame, seed: 2 ** 32 },
      { ...midGame, answers: midGame.answers.with(0, 1.5) },
    ];
    for (const data of broken) expect(parseSession(q, JSON.stringify(data))).toBeNull();
  });
});
