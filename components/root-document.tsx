import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export function RootDocument({
  children,
  language,
}: Readonly<{
  children: React.ReactNode;
  language: "en" | "es";
}>) {
  return (
    <html
      lang={language}
      className={`${inter.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full bg-background">{children}</body>
    </html>
  );
}
