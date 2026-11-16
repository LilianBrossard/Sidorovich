import type { VideoSource } from "./BackgroundVideo";

/**
 * Fond vidéo du bunker : Sidorovich derrière son comptoir, en boucle de 10 s, sans son.
 * Fichiers dans public/media/bunker/, produits par `npm run video` (docs/05-direction-artistique.md).
 * Images reprises du jeu : propriété de GSC Game World, hors licence MIT (voir LICENSE).
 * Le MP4 vient en premier : deux fois plus léger que le WebM, pour une qualité égale.
 */
export const BUNKER_VIDEO: {
  readonly poster: string;
  readonly sources: readonly VideoSource[];
} | null = {
  poster: "/media/bunker/sidorovich-poster.webp",
  sources: [
    { src: "/media/bunker/sidorovich.mp4", type: "video/mp4" },
    { src: "/media/bunker/sidorovich.webm", type: "video/webm" },
  ],
};
