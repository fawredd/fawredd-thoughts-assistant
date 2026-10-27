import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.VERCEL_ENV !== "production") {
    return [];
  }

  const siteUrl = getSiteUrl();
  const englishUrl = new URL("/", siteUrl).toString();
  const spanishUrl = new URL("/es", siteUrl).toString();
  const languageAlternates = {
    en: englishUrl,
    es: spanishUrl,
  };

  return [
    {
      url: englishUrl,
      alternates: { languages: languageAlternates },
    },
    {
      url: spanishUrl,
      alternates: { languages: languageAlternates },
    },
  ];
}
