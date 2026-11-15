"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const CHARS_PER_TICK = 2;
const TICK_MS = 30;

function subscribeMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

interface Props {
  readonly text: string;
  readonly speaker: string;
  /** Libellé du bouton qui affiche tout le texte d'un coup. */
  readonly skipLabel: string;
}

/**
 * Réplique de Sidorovich, tapée à la machine [F-16]. Un clic affiche tout le texte ;
 * avec prefers-reduced-motion, le texte s'affiche directement [V-06].
 * Les lecteurs d'écran reçoivent la phrase entière, une seule fois.
 */
export function SidorovichLine(props: Props) {
  // Nouvelle phrase, nouvelle frappe : la clé remet le compteur à zéro.
  return <Typewriter key={props.text} {...props} />;
}

function Typewriter({ text, speaker, skipLabel }: Props) {
  const reduced = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false);
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const done = reduced || skipped || shown >= text.length;

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => setShown((n) => n + CHARS_PER_TICK), TICK_MS);
    return () => window.clearInterval(timer);
  }, [done]);

  return (
    <figure className="border-l-2 border-rust-500 pl-4">
      <blockquote className="relative font-typewriter leading-relaxed text-paper-300">
        <p className="sr-only">{text}</p>
        {/* Le texte complet, invisible, réserve la place : rien ne bouge pendant la frappe. */}
        <p aria-hidden="true" className="invisible">
          {text}
        </p>
        <p aria-hidden="true" className="absolute inset-0">
          {done ? text : text.slice(0, shown)}
          {!done && <span className="animate-pulse text-amber-400">▌</span>}
        </p>
      </blockquote>
      <figcaption className="mt-2 flex items-center gap-3 font-terminal text-xs text-paper-500">
        <span>— {speaker}</span>
        {!done && (
          <button
            type="button"
            onClick={() => setSkipped(true)}
            className="underline underline-offset-4 hover:text-paper-100"
          >
            {skipLabel}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
