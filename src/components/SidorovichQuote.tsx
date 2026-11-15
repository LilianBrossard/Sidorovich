import type { ReactNode } from "react";

/** Réplique de Sidorovich sans effet de frappe : lisible sans JavaScript et par les robots. */
export function SidorovichQuote({ speaker, children }: { speaker: string; children: ReactNode }) {
  return (
    <figure className="border-l-2 border-rust-500 pl-4">
      <blockquote className="space-y-2 font-typewriter leading-relaxed text-paper-300">
        {children}
      </blockquote>
      <figcaption className="mt-2 font-terminal text-xs text-paper-500">— {speaker}</figcaption>
    </figure>
  );
}
