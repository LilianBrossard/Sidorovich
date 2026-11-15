import type { Vector } from "@/lib/quiz/types";

// Radar à 7 branches [F-21], dessiné en SVG côté serveur : aucun JavaScript envoyé.
// Chaque branche va du pôle « − » (au centre) au pôle « + » (au bord) ;
// le cercle pointillé du milieu correspond à l'équilibre (valeur 0).

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LABEL_RADIUS = RADIUS + 18;

export interface RadarSeries {
  readonly label: string;
  readonly values: Vector;
  readonly tone: "candidate" | "faction";
}

interface Props {
  /** Nom du pôle « + » de chaque axe, affiché au bout de la branche. */
  readonly axes: readonly string[];
  readonly series: readonly RadarSeries[];
  readonly title: string;
  readonly description: string;
}

const angle = (i: number, n: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
/** Valeur dans [-1, 1] → distance au centre dans [0, RADIUS]. */
const radiusOf = (value: number) => (RADIUS * (Math.max(-1, Math.min(1, value)) + 1)) / 2;

function point(i: number, n: number, r: number): [number, number] {
  const a = angle(i, n);
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

const polygon = (radii: readonly number[]) =>
  radii
    .map((r, i) => point(i, radii.length, r))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

const TONES = {
  candidate: { fill: "fill-amber-400/25", stroke: "stroke-amber-400", dash: undefined },
  faction: { fill: "fill-paper-300/10", stroke: "stroke-paper-300", dash: "6 4" },
} as const;

export function Radar({ axes, series, title, description }: Props) {
  const n = axes.length;
  const rings = [0.25, 0.5, 0.75, 1].map((k) => k * RADIUS);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={title}
      className="mx-auto block h-auto w-full max-w-md font-sans"
    >
      <title>{title}</title>
      <desc>{description}</desc>

      <g className="fill-none stroke-bunker-700">
        {rings.map((r) => (
          <polygon
            key={r}
            points={polygon(axes.map(() => r))}
            strokeDasharray={r === RADIUS / 2 ? "3 4" : undefined}
            className={r === RADIUS / 2 ? "stroke-paper-500/60" : undefined}
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = point(i, n, RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} />;
        })}
      </g>

      {series.map(({ label, values, tone }) => {
        const style = TONES[tone];
        return (
          <g key={label}>
            <polygon
              points={polygon(values.map(radiusOf))}
              strokeWidth={2}
              strokeDasharray={style.dash}
              strokeLinejoin="round"
              className={`${style.fill} ${style.stroke}`}
            />
            {tone === "candidate" &&
              values.map((v, i) => {
                const [x, y] = point(i, n, radiusOf(v));
                return <circle key={i} cx={x} cy={y} r={3.5} className="fill-amber-400" />;
              })}
          </g>
        );
      })}

      {axes.map((label, i) => {
        const [x, y] = point(i, n, LABEL_RADIUS);
        const cos = Math.cos(angle(i, n));
        const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
        const sin = Math.sin(angle(i, n));
        const dy = sin < -0.5 ? "0" : sin > 0.5 ? "0.9em" : "0.35em";
        return (
          <text
            key={label}
            x={x}
            y={y}
            dy={dy}
            textAnchor={anchor}
            className="fill-paper-300 text-[14px]"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
