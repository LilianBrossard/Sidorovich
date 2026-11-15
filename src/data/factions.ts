import type { Factions } from "@/lib/quiz/types";

/**
 * Profils déclarés des 12 factions, dans l'ordre des axes :
 *            ORD   ALT   COL   FOI   FOR   ZON   IDE
 * Ils expriment l'intention de conception. Le moteur compare le candidat aux
 * centres calibrés (centers.v1.json), calculés à partir de ces profils.
 */
export const FACTIONS = {
  SOL: { profile: [-0.3, 0.2, -0.8, 0.1, 0.0, 0.0, -0.5], games: ["soc", "cs", "cop", "s2"] },
  DEV: { profile: [0.9, 0.6, 0.9, -0.2, 0.7, -0.9, 0.7], games: ["soc", "cs", "cop", "s2"] },
  LIB: { profile: [-0.9, 0.3, -0.2, -0.3, 0.1, 0.3, 0.6], games: ["soc", "cs", "cop", "s2"] },
  BAN: { profile: [-0.6, -0.9, 0.2, 0.0, 0.8, -0.2, -0.8], games: ["soc", "cs", "cop", "s2"] },
  MER: { profile: [0.3, -0.6, -0.3, -0.5, 0.7, -0.5, -1.0], games: ["soc", "cs", "cop", "s2"] },
  MON: { profile: [0.8, -0.3, 1.0, 1.0, 0.9, 0.8, 0.9], games: ["soc", "cs", "cop", "s2"] },
  ECO: { profile: [0.2, 0.5, 0.0, -1.0, -0.9, 0.3, 0.2], games: ["soc", "cs", "cop", "s2"] },
  MIL: { profile: [1.0, -0.2, 0.8, -0.2, 0.9, -0.7, -0.5], games: ["soc", "cs", "cop"] },
  CS: { profile: [0.0, 0.8, 0.6, -0.4, 0.2, 0.4, 0.7], games: ["cs"] },
  WAR: { profile: [0.7, 0.5, 0.4, -0.7, 0.4, -1.0, -0.2], games: ["s2"] },
  SPA: { profile: [-0.3, 0.6, 0.5, 0.6, 0.3, 1.0, 0.8], games: ["s2"] },
  NOO: { profile: [0.3, 0.0, 0.9, 0.3, 0.8, -0.3, 0.5], games: ["s2"] },
} as const satisfies Factions;
