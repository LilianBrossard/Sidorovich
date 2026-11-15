import { notFound } from "next/navigation";

/** Toute URL inconnue sous une langue affiche la 404 de cette langue. */
export default function CatchAllPage() {
  notFound();
}
