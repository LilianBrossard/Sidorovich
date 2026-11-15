import type { ReactNode } from "react";
import type { FactionKey } from "@/lib/quiz/domain";

/**
 * Les 12 emblèmes [V-03] : des tampons ronds tracés au trait, un pictogramme par idée.
 * Dessins originaux, volontairement éloignés des logos du jeu [L-02].
 */
const PICTOGRAMS: Readonly<Record<FactionKey, ReactNode>> = {
  // Solitaires : un feu de camp, chacun repart de son côté.
  SOL: (
    <>
      <path d="M48 26 C58 38 60 46 48 58 C36 46 38 38 48 26 Z" />
      <path d="M33 68 L63 60 M33 60 L63 68" />
    </>
  ),
  // Devoir : un bastion.
  DEV: (
    <>
      <path d="M31 68 V40 H37 V33 H44 V40 H52 V33 H59 V40 H65 V68 Z" />
      <path d="M43 68 V57 H53 V68" />
    </>
  ),
  // Liberté : un cadenas ouvert.
  LIB: (
    <>
      <rect x="34" y="46" width="28" height="22" rx="3" />
      <path d="M40 46 V36 C40 26 54 26 55 34" />
      <path d="M48 54 V60" />
    </>
  ),
  // Bandits : un loup de voleur.
  BAN: (
    <>
      <path d="M25 45 C25 38 36 36 48 41 C60 36 71 38 71 45 C71 55 62 60 54 56 L48 52 L42 56 C34 60 25 55 25 45 Z" />
      <path d="M33 46 C36 43 41 43 43 46 M53 46 C55 43 60 43 63 46" />
    </>
  ),
  // Mercenaires : une pièce sous un viseur.
  MER: (
    <>
      <circle cx="48" cy="48" r="15" />
      <path d="M48 20 V33 M48 63 V76 M20 48 H33 M63 48 H76" />
    </>
  ),
  // Monolithe : une stèle qui rayonne.
  MON: (
    <>
      <path d="M42 70 V30 L48 25 L54 30 V70" />
      <path d="M34 36 L28 32 M33 48 H26 M34 60 L28 64 M62 36 L68 32 M63 48 H70 M62 60 L68 64" />
      <path d="M33 72 H63" />
    </>
  ),
  // Écologistes : une fiole de laboratoire.
  ECO: (
    <>
      <path d="M41 26 H55 M44 26 V42 L32 67 H64 L52 42 V26" />
      <path d="M37 57 H59" />
    </>
  ),
  // Militaires : des galons.
  MIL: <path d="M30 41 L48 31 L66 41 M30 53 L48 43 L66 53 M30 65 L48 55 L66 65" />,
  // Clear Sky : un soleil qui se lève sur l'horizon.
  CS: (
    <>
      <path d="M36 60 A12 12 0 0 1 60 60" />
      <path d="M48 40 V32 M35.5 45.5 L30.5 40.5 M60.5 45.5 L65.5 40.5" />
      <path d="M24 60 H72 M32 68 H64" />
    </>
  ),
  // Ward : une clé, gardienne des accès.
  WAR: (
    <>
      <circle cx="39" cy="39" r="9" />
      <path d="M45.5 45.5 L67 67 M58 58 L63 53 M63 63 L68 58" />
    </>
  ),
  // Spark : une étincelle.
  SPA: <path d="M48 23 L53.5 42.5 L73 48 L53.5 53.5 L48 73 L42.5 53.5 L23 48 L42.5 42.5 Z" />,
  // Noon : un cadran arrêté à midi.
  NOO: (
    <>
      <circle cx="48" cy="48" r="20" />
      <path d="M48 31 V34 M65 48 H62 M48 65 V62 M31 48 H34 M48 48 V36" />
    </>
  ),
};

interface Props {
  readonly faction: FactionKey;
  /** Nom lu par les lecteurs d'écran ; sans nom, l'emblème est décoratif. */
  readonly label?: string;
  readonly className?: string;
}

export function FactionEmblem({ faction, label, className }: Props) {
  return (
    <svg
      viewBox="0 0 96 96"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="48" cy="48" r="44" />
        <circle cx="48" cy="48" r="38" strokeWidth="1.2" />
        {PICTOGRAMS[faction]}
      </g>
    </svg>
  );
}
