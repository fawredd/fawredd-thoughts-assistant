import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { getSiteUrl } from "@/lib/site-url";

const description =
  "Una aplicación web con IA para organizar tus pensamientos, diseñada para la memoria a largo plazo y el coaching reflexivo.";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Organiza tus pensamientos con IA",
  description,
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      es: "/es",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Fawredd Thoughts Assistant",
    title: "Organiza tus pensamientos con IA",
    description,
    url: new URL("/es", siteUrl),
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organiza tus pensamientos con IA",
    description,
  },
};

export default function SpanishHomePage() {
  return <LandingPage language="es" />;
}
