import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import { RootDocument } from "@/components/root-document";
import { ThemeProvider } from "@/components/theme-provider";
import { getOrCreateUser } from "@/lib/db-utils";
import { LanguageProvider } from "@/lib/language-context";
import "../globals.css";

export const metadata: Metadata = {
  title: "Journal",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getOrCreateUser();
  if (!user) {
    throw new Error("Unable to initialize the authenticated account.");
  }

  const language = user.language === "en" ? "en" : "es";

  return (
    <RootDocument language={language}>
      <ClerkProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLanguage={language}>
            <div className="flex min-h-full flex-col">
              <Header />
              <main className="flex flex-1 flex-col">{children}</main>
              <Toaster richColors closeButton position="bottom-right" />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </ClerkProvider>
    </RootDocument>
  );
}
