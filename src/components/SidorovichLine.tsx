"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

const CHARS_PER_TICK = 2;
const TICK_MS = 30;

interface Props {
  readonly text: string;
  readonly speaker: string;
  /** Libellé du bouton qui affiche tout le texte d'un coup. */
  readonly skipLabel: string;
}

/**
 * Réplique de Sidorovich sur une note trombonée, tapée à la machine [F-16]. Un clic
 * affiche tout le texte ; avec prefers-reduced-motion, le texte s'affiche directement [V-06].
 * Les lecteurs d'écran reçoivent la phrase entière, une seule fois.
 */
export function SidorovichLine(props: Props) {
  // Nouvelle phrase, nouvelle frappe : la clé remet le compteur à zéro.
  return <Typewriter key={props.text} {...props} />;
}

function Typewriter({ text, speaker, skipLabel }: Props) {
  const reduced = usePrefersReducedMotion(false);
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const done = reduced || skipped || shown >= text.length;

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => setShown((n) => n + CHARS_PER_TICK), TICK_MS);
    return () => window.clearInterval(timer);
  }, [done]);

  return (
    <figure className="surface-paper relative m-0 -rotate-[1.5deg] bg-paper-300 px-5 pt-7 pb-4 text-ink-900 shadow-[0_10px_24px_rgb(0_0_0/0.45)] motion-safe:animate-fade-in lg:-rotate-2">
      <svg
        aria-hidden="true"
        width="24"
        height="58"
        viewBox="0 0 26 62"
        className="absolute -top-5 left-5"
      >
        <path
          d="M8 40 V10 a5 5 0 0 1 10 0 V48 a8 8 0 0 1 -16 0 V16"
          fill="none"
          stroke="#6b6b3e"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
      <blockquote className="relative font-typewriter text-[15px] leading-relaxed sm:text-base">
        <p className="sr-only">{text}</p>
        {/* Le texte complet, invisible, réserve la place : rien ne bouge pendant la frappe. */}
        <p aria-hidden="true" className="invisible">
          {text}
        </p>
        <p aria-hidden="true" className="absolute inset-0">
          {done ? text : text.slice(0, shown)}
          {!done && <span className="animate-pulse">▌</span>}
        </p>
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-3 font-terminal text-xs text-ink-600">
        <span>— {speaker}</span>
        {!done && (
          <button
            type="button"
            onClick={() => setSkipped(true)}
            className="underline underline-offset-4 hover:text-ink-900"
          >
            {skipLabel}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
