import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Redirige "/" vers la langue du navigateur (en-tête Accept-Language, jamais la géolocalisation)
// et mémorise le choix manuel dans un cookie fonctionnel [I-02] [L-03].
export default createMiddleware(routing);

export const config = {
  // Tout sauf /api, /_next, /_vercel et les fichiers (chemins contenant un point).
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
