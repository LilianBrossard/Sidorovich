"use client";

// Préférences du navigateur lues avec useSyncExternalStore : pas d'écart d'hydratation.
import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Vrai si la personne demande moins d'animations [V-06].
 * `serverValue` : valeur supposée pendant le rendu serveur et l'hydratation.
 */
export function usePrefersReducedMotion(serverValue: boolean): boolean {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => serverValue,
  );
}

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };
const subscribeNothing = () => () => {};

/** Vrai si le navigateur demande d'économiser les données (mode « Économiseur de données »). */
export function useSaveData(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => (navigator as NavigatorWithConnection).connection?.saveData === true,
    () => true,
  );
}
