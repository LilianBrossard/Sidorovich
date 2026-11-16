import type { MetadataRoute } from "next";

/** Manifeste de l'application web [T-08]. Le nom reste celui de la version anglaise. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sidorovich HR",
    short_name: "Sidorovich",
    description:
      "Sit Sidorovich’s job interview and find out which faction of the Zone you belong to.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0b",
    theme_color: "#0d0d0b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
