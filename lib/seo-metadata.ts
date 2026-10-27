import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const brandName = "Fawredd Thoughts Assistant";

export function getRootMetadata(language: "en" | "es"): Metadata {
  const isEnglish = language === "en";
  const title = isEnglish
    ? "AI journaling for long-term memory | Fawredd Thoughts Assistant"
    : "Diario con IA y memoria a largo plazo | Fawredd Thoughts Assistant";
  const description = isEnglish
    ? "An AI-powered web app for organizing your thoughts, designed for long-term memory and reflective coaching."
    : "Una aplicación web con IA para organizar tus pensamientos, diseñada para la memoria a largo plazo y el coaching reflexivo.";
  const isProductionDeployment = process.env.VERCEL_ENV === "production";

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    applicationName: brandName,
    robots: {
      index: isProductionDeployment,
      follow: isProductionDeployment,
    },
    openGraph: {
      type: "website",
      siteName: brandName,
      title,
      description,
      locale: isEnglish ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
