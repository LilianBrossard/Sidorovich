/**
 * Emblème provisoire : l'initiale de la faction, façon tampon. Les 12 emblèmes SVG
 * originaux arrivent avec la direction artistique (phase 5) [V-03].
 */
export function FactionMark({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dimensions = size === "lg" ? "size-16 text-3xl sm:size-20 sm:text-4xl" : "size-12 text-2xl";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 -rotate-3 items-center justify-center rounded-sm border-2 border-rust-500 font-typewriter text-rust-500 ${dimensions}`}
    >
      {name.charAt(0)}
    </span>
  );
}
