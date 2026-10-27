import type { Metadata } from "next";
import { RootDocument } from "@/components/root-document";
import { getRootMetadata } from "@/lib/seo-metadata";
import "../globals.css";

export const metadata: Metadata = getRootMetadata("en");

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootDocument language="en">{children}</RootDocument>;
}
