import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { RootDocument } from "@/components/root-document";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Account",
    template: "%s | Fawredd Thoughts Assistant",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootDocument language="en">
      <ClerkProvider>{children}</ClerkProvider>
    </RootDocument>
  );
}
