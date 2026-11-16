// Compositions des images d'aperçu [F-28], rendues par Satori : styles en ligne et flexbox
// uniquement (pas de classes Tailwind), SVG avec tailles et couleurs explicites.
import { FactionEmblem } from "@/components/FactionEmblem";
import { polygon, radiusOf, RADIUS, SIZE } from "@/components/result/Radar";
import { FACTION_KEYS, type FactionKey } from "@/lib/quiz/domain";
import type { Vector } from "@/lib/quiz/types";
import { TERMINAL, TYPEWRITER } from "./fonts";

const AMBER = "#f2b544";
const AMBER_DIM = "rgba(242,181,68,0.72)";

interface DefaultCardProps {
  readonly kicker: string;
  readonly title: string;
  readonly tagline: string;
}

/** Image par défaut : le bunker, le nom du site et les 12 emblèmes. */
export function DefaultCard({ kicker, title, tagline }: DefaultCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: "#16150f",
        backgroundImage:
          "radial-gradient(circle at 84% 12%, rgba(242,181,68,0.34), rgba(242,181,68,0.06) 38%, rgba(242,181,68,0) 62%)",
        color: "#efe6cf",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: TERMINAL,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: AMBER,
          }}
        >
          {kicker}
        </div>
        <div style={{ fontFamily: TYPEWRITER, fontSize: 112, lineHeight: 1, marginTop: 22 }}>
          {title}
        </div>
        <div style={{ fontFamily: TYPEWRITER, fontSize: 36, marginTop: 26, color: "#d9c9a3" }}>
          {tagline}
        </div>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {FACTION_KEYS.map((faction) => (
          <FactionEmblem key={faction} faction={faction} color={AMBER_DIM} size={70} />
        ))}
      </div>
    </div>
  );
}

interface VerdictCardProps {
  readonly kicker: string;
  readonly faction: FactionKey;
  readonly label: string;
  readonly name: string;
  readonly compatibility: string;
  readonly siteName: string;
  readonly cta: string;
  readonly profile: Vector;
  readonly center: Vector;
}

/** Image d'un résultat : l'écran du PDA, l'emblème, la faction, le % et le radar. */
export function VerdictCard(props: VerdictCardProps) {
  const { kicker, faction, label, name, compatibility, siteName, cta, profile, center } = props;
  const rings = [0.25, 0.5, 0.75, 1].map((k) => polygon(profile.map(() => k * RADIUS)));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 26,
        backgroundColor: "#2e2f24",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 36,
          padding: "44px 48px",
          borderRadius: 18,
          backgroundColor: "#0b0c08",
          color: AMBER,
          fontFamily: TERMINAL,
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 22, color: AMBER_DIM }}>{`> ${kicker}`}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <FactionEmblem faction={faction} color={AMBER} size={150} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 20,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: AMBER_DIM,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.05, marginTop: 8 }}>
                {name}
              </div>
              <div style={{ fontSize: 32, marginTop: 12 }}>{compatibility}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
            <span style={{ letterSpacing: 4, textTransform: "uppercase", color: AMBER_DIM }}>
              {siteName}
            </span>
            <span>{cta}</span>
          </div>
        </div>
        <svg
          width={360}
          height={360}
          viewBox={`${SIZE / 2 - RADIUS - 6} ${SIZE / 2 - RADIUS - 6} ${2 * RADIUS + 12} ${2 * RADIUS + 12}`}
        >
          {rings.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke={i === 1 ? "rgba(242,181,68,0.4)" : "rgba(242,181,68,0.2)"}
              strokeDasharray={i === 1 ? "3 4" : undefined}
            />
          ))}
          <polygon
            points={polygon(center.map(radiusOf))}
            fill="none"
            stroke="rgba(242,181,68,0.75)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <polygon
            points={polygon(profile.map(radiusOf))}
            fill="rgba(242,181,68,0.25)"
            stroke={AMBER}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
