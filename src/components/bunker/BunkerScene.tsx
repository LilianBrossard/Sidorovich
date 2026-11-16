import { BackgroundVideo } from "./BackgroundVideo";
import { BUNKER_VIDEO } from "./video";

interface Props {
  /** Réplique d'accueil de Sidorovich, rendue côté serveur (lisible sans JavaScript). */
  readonly line: string;
  readonly speaker: string;
  readonly pauseLabel: string;
  readonly playLabel: string;
}

/**
 * Le bunker : Sidorovich en vidéo, au format 16:9 pour ne rien recadrer, et sa réplique dans
 * une bulle de papier posée sous l'image, comme un sous-titre. Sans vidéo, ou avant son
 * chargement, il reste l'image fixe ou la lumière chaude de la lampe.
 */
export function BunkerScene({ line, speaker, pauseLabel, playLabel }: Props) {
  return (
    <figure className="relative m-0">
      <div className="relative aspect-video overflow-hidden rounded border border-bunker-700 bg-[#121109]">
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-flicker bg-[radial-gradient(circle_at_63%_20%,rgb(242_181_68/0.38),rgb(242_181_68/0.08)_38%,transparent_64%)] motion-reduce:animate-none"
        />
        {BUNKER_VIDEO && (
          <BackgroundVideo
            poster={BUNKER_VIDEO.poster}
            sources={BUNKER_VIDEO.sources}
            pauseLabel={pauseLabel}
            playLabel={playLabel}
          />
        )}
      </div>

      <div className="relative z-10 mx-3 -mt-6 rounded-sm bg-paper-100 px-5 py-4 text-ink-900 shadow-[0_10px_28px_rgb(0_0_0/0.5)] sm:mx-6">
        <blockquote className="font-typewriter text-[15px] leading-relaxed">
          <p>{line}</p>
        </blockquote>
        <figcaption className="mt-2 font-terminal text-xs text-ink-600">— {speaker}</figcaption>
      </div>
    </figure>
  );
}
