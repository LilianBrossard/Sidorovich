"use client";

// Partie en cours, gardée dans le stockage local du navigateur [F-14] [L-03].
// Lue avec useSyncExternalStore : le serveur et la première passe d'hydratation supposent
// « aucune partie » (la couverture du dossier s'affiche tout de suite : bon LCP [T-04]),
// puis le client affiche la partie sauvegardée s'il y en a une.
import { useCallback, useSyncExternalStore } from "react";
import { CURRENT_QUESTIONNAIRE } from "@/data/questionnaires";
import {
  newSession,
  parseSession,
  reduceSession,
  serializeSession,
  type QuizAction,
  type QuizSession,
} from "@/lib/quiz/session";

const STORAGE_KEY = "sidorovich.session";
const questionnaire = CURRENT_QUESTIONNAIRE;

/** Stockage de secours en mémoire si le navigateur refuse le stockage local. */
let memory: string | null = null;
let persistent = true;

function readRaw(): string | null {
  if (!persistent) return memory;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    persistent = false;
    return memory;
  }
}

function writeRaw(raw: string | null): void {
  memory = raw;
  if (!persistent) return;
  try {
    if (raw === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    persistent = false;
  }
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Une autre fenêtre du même site a modifié la partie.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// useSyncExternalStore exige le même objet tant que rien n'a changé.
let snapshot: { raw: string | null; session: QuizSession | null } = { raw: null, session: null };

function getSnapshot(): QuizSession | null {
  const raw = readRaw();
  if (raw !== snapshot.raw) snapshot = { raw, session: parseSession(questionnaire, raw) };
  return snapshot.session;
}

const getServerSnapshot = (): null => null;

function save(session: QuizSession | null): void {
  writeRaw(session === null ? null : serializeSession(session));
  notify();
}

function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

/** Vrai si la progression survit à la fermeture de l'onglet. */
export const isPersistent = (): boolean => {
  readRaw();
  return persistent;
};

export interface QuizSessionApi {
  /** `null` s'il n'y a pas de partie (et côté serveur, avant la lecture du stockage). */
  readonly session: QuizSession | null;
  readonly start: () => void;
  readonly dispatch: (action: QuizAction) => QuizSession | null;
  readonly clear: () => void;
}

export function useQuizSession(): QuizSessionApi {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const start = useCallback(() => save(newSession(questionnaire, randomSeed())), []);
  const clear = useCallback(() => save(null), []);
  const dispatch = useCallback((action: QuizAction) => {
    // On relit le stockage : deux touches pressées très vite ne doivent pas se marcher dessus.
    const current = getSnapshot();
    if (!current) return null;
    const next = reduceSession(questionnaire, current, action);
    if (next !== current) save(next);
    return next;
  }, []);

  return { session, start, dispatch, clear };
}

export { questionnaire as sessionQuestionnaire };
