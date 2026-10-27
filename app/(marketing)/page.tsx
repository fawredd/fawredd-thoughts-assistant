import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { getSiteUrl } from "@/lib/site-url";

const description =
  "An AI-powered web app for organizing your thoughts, designed for long-term memory and reflective coaching.";
const title =
  "AI journaling for long-term memory | Fawredd Thoughts Assistant";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      es: "/es",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Fawredd Thoughts Assistant",
    title,
    description,
    url: new URL("/", siteUrl),
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function HomePage() {
  return <LandingPage language="en" />;
}
