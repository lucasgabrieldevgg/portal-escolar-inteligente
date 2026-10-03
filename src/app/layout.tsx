import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/portal/ThemeProvider";

// Identidade ESCOLA: Nunito (corpo — amigável e legível, cara de escola
// gamificada) + JetBrains Mono (números, XP, código). Zero fonte-default
// de template (Geist/Inter).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const jbm = JetBrains_Mono({
  variable: "--font-jbm",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Portal Escolar Inteligente",
  description:
    "Plataforma escolar com assistente de IA, sistema de XP, rankings, badges e programa de colaboradores. Escola Estadual Professora Eunice Souza dos Santos - Rondonópolis-MT.",
  keywords: [
    "portal escolar",
    "educação",
    "IA",
    "gamificação",
    "XP",
    "ranking",
    "badges",
  ],
  authors: [{ name: "Projeto Portal Escolar Inteligente" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${jbm.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
