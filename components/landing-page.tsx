import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteUrl } from "@/lib/site-url";

type Language = "en" | "es";

const copy = {
  en: {
    navigationLabel: "Main navigation",
    languageLink: "Español",
    signIn: "Sign in",
    signUp: "Create an account",
    homeLabel: "Fawredd Thoughts Assistant home",
    title: "Organize your thoughts with AI",
    description:
      "A web app designed for long-term memory and reflective coaching.",
    aboutTitle: "An AI-powered space for your thoughts",
    aboutDescription:
      "Fawredd Thoughts Assistant is a web app for organizing your thoughts with AI.",
    memoryTitle: "Long-term memory",
    memoryDescription: "Designed for long-term memory.",
    coachingTitle: "Reflective coaching",
    coachingDescription: "Designed for reflective coaching.",
    disclaimerTitle: "Important note",
    disclaimer:
      "This app does not replace professional judgment in any way. For medical advice or diagnoses, consult a professional.",
    projectNote: "This app was developed as a hobby and as a learning project.",
    footerLabel: "Footer navigation",
  },
  es: {
    navigationLabel: "Navegación principal",
    languageLink: "English",
    signIn: "Iniciar sesión",
    signUp: "Crear una cuenta",
    homeLabel: "Inicio de Fawredd Thoughts Assistant",
    title: "Organiza tus pensamientos con IA",
    description:
      "Una aplicación web diseñada para la memoria a largo plazo y el coaching reflexivo.",
    aboutTitle: "Un espacio para organizar tus pensamientos con IA",
    aboutDescription:
      "Fawredd Thoughts Assistant es una aplicación web para organizar tus pensamientos con IA.",
    memoryTitle: "Memoria a largo plazo",
    memoryDescription: "Diseñada para la memoria a largo plazo.",
    coachingTitle: "Coaching reflexivo",
    coachingDescription: "Diseñada para el coaching reflexivo.",
    disclaimerTitle: "Aviso importante",
    disclaimer:
      "Esta aplicación no reemplaza el criterio profesional en ningún sentido. Para obtener consejos o diagnósticos médicos, consulta a un profesional.",
    projectNote: "Esta aplicación se desarrolló como pasatiempo y proyecto de aprendizaje.",
    footerLabel: "Navegación del pie de página",
  },
} as const;

const brandName = "Fawredd Thoughts Assistant";

export function LandingPage({ language }: { language: Language }) {
  const content = copy[language];
  const homeUrl = new URL(language === "en" ? "/" : "/es", getSiteUrl()).toString();

  return (
    <>
      <header lang={language} className="border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href={language === "en" ? "/" : "/es"}
            aria-label={content.homeLabel}
            className="font-semibold tracking-tight text-primary"
          >
            {brandName}
          </Link>
          <nav
            aria-label={content.navigationLabel}
            className="flex items-center gap-3 text-sm sm:gap-6"
          >
            <Link href={language === "en" ? "/es" : "/"} lang={language === "en" ? "es" : "en"}>
              {content.languageLink}
            </Link>
            <Link href="/sign-in" className="hidden sm:inline">
              {content.signIn}
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              {content.signUp}
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" lang={language} className="flex-1">
        <section className="px-4 py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              {brandName}
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
              {content.title}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {content.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 font-bold text-primary-foreground"
              >
                {content.signUp}
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center rounded-full border px-8 font-semibold"
              >
                {content.signIn}
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="about-title"
          className="border-y bg-muted/40 px-4 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="mx-auto max-w-3xl space-y-3 text-center">
              <h2 id="about-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
                {content.aboutTitle}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {content.aboutDescription}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <article className="rounded-2xl border bg-background p-6">
                <h3 className="text-lg font-semibold">{content.memoryTitle}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {content.memoryDescription}
                </p>
              </article>
              <article className="rounded-2xl border bg-background p-6">
                <h3 className="text-lg font-semibold">{content.coachingTitle}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {content.coachingDescription}
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="disclaimer-title"
          className="mx-auto max-w-5xl px-4 py-12 sm:py-16"
        >
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
            <h2 id="disclaimer-title" className="font-semibold">
              {content.disclaimerTitle}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {content.disclaimer}
            </p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {content.projectNote}
            </p>
          </div>
        </section>
      </main>

      <footer lang={language} className="border-t">
        <nav
          aria-label={content.footerLabel}
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground"
        >
          <span>{brandName}</span>
          <div className="flex gap-5">
            <Link href="/sign-up">{content.signUp}</Link>
            <Link href="/sign-in">{content.signIn}</Link>
          </div>
        </nav>
      </footer>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: brandName,
              url: getSiteUrl().toString(),
              inLanguage: language,
            },
            {
              "@type": "SoftwareApplication",
              name: brandName,
              description: `${content.title}. ${content.description}`,
              url: homeUrl,
              operatingSystem: "Web",
              inLanguage: language,
            },
          ],
        }}
      />
    </>
  );
}
