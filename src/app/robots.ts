import type { MetadataRoute } from "next";

import { absoluteUrl, isPublished } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // До настройки домена (нет NEXT_PUBLIC_SITE_URL) сайт закрыт от поисковиков.
  if (!isPublished) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
