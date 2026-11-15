import { AXIS_KEYS, FACTION_KEYS, type FactionKey } from "@/lib/quiz/domain";
import type { Centers, Questionnaire } from "@/lib/quiz/types";

/** Petit questionnaire de test : une question à choix et une affirmation. */
export const tinyQuestionnaire: Questionnaire = {
  version: "v9",
  codeChar: "9",
  questions: [
    {
      id: "Q01",
      type: "choice",
      kind: "dilemma",
      answers: [
        { id: "a", deltas: { ORD: 2, ALT: 1 } },
        { id: "b", deltas: { ORD: -1 } },
        { id: "c", deltas: { ALT: -2 } },
        { id: "d", deltas: { IDE: 1 } },
      ],
    },
    { id: "Q02", type: "scale", kind: "statement", deltas: { ORD: 2, FOI: -1 } },
  ],
};

/** Centres de test : toutes les factions loin du centre, sauf celles données. */
export function centersWith(overrides: Partial<Record<FactionKey, number[]>>): Centers {
  const centers = {} as Record<FactionKey, number[]>;
  for (const faction of FACTION_KEYS) {
    centers[faction] = overrides[faction] ?? AXIS_KEYS.map(() => 1);
  }
  return centers;
}

export const zeros = (): number[] => AXIS_KEYS.map(() => 0);
