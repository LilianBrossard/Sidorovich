import type { VideoSource } from "./BackgroundVideo";

/**
 * Fond vidéo du bunker : Sidorovich derrière son comptoir, en boucle.
 * Fichiers à poser dans public/media/bunker/ (cahier des charges : docs/05-direction-artistique.md).
 * Tant que la vidéo n'est pas fournie (null), la scène affiche la lumière de la lampe seule.
 */
export const BUNKER_VIDEO: {
  readonly poster: string;
  readonly sources: readonly VideoSource[];
} | null = null;
