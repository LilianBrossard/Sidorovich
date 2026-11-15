import type { Vector } from "@/lib/quiz/types";

interface Props {
  readonly axes: readonly { readonly minus: string; readonly plus: string }[];
  readonly values: Vector;
  /** Texte lu par les lecteurs d'écran pour chaque axe, par exemple « Ordre : +35 ». */
  readonly describe: (index: number) => string;
  /** Couleurs : sur fond sombre (par défaut) ou sur papier. */
  readonly tone?: "dark" | "paper";
}

const TONES = {
  dark: {
    label: "text-paper-500",
    strong: "text-paper-300",
    track: "bg-bunker-700",
    axis: "bg-paper-500",
    fill: "bg-amber-400",
  },
  paper: {
    label: "text-ink-600",
    strong: "font-bold text-ink-900",
    track: "bg-ink-900/15",
    axis: "bg-ink-600",
    fill: "bg-rust-600",
  },
} as const;

/** Signature d'une faction : une barre par axe, partant du centre vers le pôle favorisé. */
export function AxisBars({ axes, values, describe, tone = "dark" }: Props) {
  const colors = TONES[tone];
  return (
    <ul className={`space-y-1.5 text-xs ${colors.label}`}>
      {axes.map(({ minus, plus }, i) => {
        const value = Math.max(-1, Math.min(1, values[i]));
        const width = `${Math.abs(value) * 50}%`;
        return (
          <li key={plus} className="grid grid-cols-[1fr_4.5rem_1fr] items-center gap-2">
            <span className="sr-only">{describe(i)}</span>
            <span aria-hidden="true" className={`text-right ${value < 0 ? colors.strong : ""}`}>
              {minus}
            </span>
            <span aria-hidden="true" className={`relative h-1.5 rounded-full ${colors.track}`}>
              <span className={`absolute inset-y-0 left-1/2 w-px ${colors.axis}`} />
              <span
                className={`absolute inset-y-0 rounded-full ${colors.fill}`}
                style={value >= 0 ? { left: "50%", width } : { right: "50%", width }}
              />
            </span>
            <span aria-hidden="true" className={value > 0 ? colors.strong : ""}>
              {plus}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
