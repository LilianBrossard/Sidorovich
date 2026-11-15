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
 * Le bunker : fond vidéo en boucle et réplique de Sidorovich dans une bulle de papier.
 * Sans vidéo, ou avant son chargement, il reste la lumière chaude de la lampe.
 */
export function BunkerScene({ line, speaker, pauseLabel, playLabel }: Props) {
  return (
    <figure className="relative m-0">
      <div className="relative z-10 -mb-5 rounded-sm bg-paper-100 px-5 py-4 text-ink-900 shadow-[0_10px_28px_rgb(0_0_0/0.5)] md:absolute md:top-6 md:left-6 md:mb-0 md:max-w-xs">
        <blockquote className="font-typewriter text-[15px] leading-relaxed">
          <p>{line}</p>
        </blockquote>
        <figcaption className="mt-2 font-terminal text-xs text-ink-600">— {speaker}</figcaption>
      </div>

      <div className="relative h-72 overflow-hidden rounded border border-bunker-700 bg-[#121109] md:h-[560px]">
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
    </figure>
  );
}
