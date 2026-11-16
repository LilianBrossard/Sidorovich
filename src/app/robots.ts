import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Robots [T-08] : tout est ouvert ; les pages à ne pas indexer portent leur propre balise. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
