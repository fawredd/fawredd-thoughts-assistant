import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fawredd - Thoughts Assistant",
  description: "AI-assisted journaling with longitudinal memory",
};

import { Header } from "@/components/header";
import { getOrCreateUser } from "@/lib/db-utils";
import { LanguageProvider } from "@/lib/language-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getOrCreateUser();
  const language = (user?.language as 'es' | 'en') || 'es';

  return (
    <ClerkProvider>
      <html lang={language} suppressHydrationWarning className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
        <body className="min-h-full flex flex-col bg-background">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider initialLanguage={language}>
              <Header />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <Toaster richColors closeButton position="bottom-right" />
            </LanguageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
