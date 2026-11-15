"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useSaveData } from "@/lib/motion";

export interface VideoSource {
  readonly src: string;
  readonly type: string;
}

interface Props {
  readonly poster: string;
  readonly sources: readonly VideoSource[];
  readonly pauseLabel: string;
  readonly playLabel: string;
}

/**
 * Vidéo de fond en boucle, muette et décorative.
 * - Rien n'est téléchargé si la personne réduit les animations ou économise ses données :
 *   l'image fixe suffit [V-06].
 * - Pause automatique hors de l'écran ; bouton pause, car l'animation dure plus de
 *   5 secondes (WCAG 2.2.2).
 */
export function BackgroundVideo({ poster, sources, pauseLabel, playLabel }: Props) {
  const reduced = usePrefersReducedMotion(true);
  const saveData = useSaveData();
  const active = !reduced && !saveData;
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const element = video.current;
    if (!element || !active) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const element = video.current;
    if (!element || !active) return;
    if (paused || !onScreen) element.pause();
    else element.play().catch(() => setPaused(true));
  }, [active, paused, onScreen]);

  return (
    <>
      <video
        // Nouvelle clé quand les sources apparaissent : le navigateur les recharge.
        key={active ? "video" : "poster"}
        ref={video}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={active}
        preload={active ? "auto" : "none"}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover"
      >
        {active && sources.map(({ src, type }) => <source key={src} src={src} type={type} />)}
      </video>
      {active && (
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? playLabel : pauseLabel}
          className="absolute right-3 bottom-3 z-10 inline-flex size-11 items-center justify-center rounded-sm border border-paper-300/40 bg-bunker-950/70 text-paper-100 hover:bg-bunker-950"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {paused ? <path d="M7 4.5v15l12-7.5z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
          </svg>
        </button>
      )}
    </>
  );
}
