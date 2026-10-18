import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NOM_SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${NOM_SITE} · De l'idée au PRD qui tient en une page`,
  description:
    "Classe tes fonctionnalités en Must, Should, Could et Won't, trace ta ligne MVP, puis exporte un PRD.md prêt pour Claude Code. Gratuit, en français, sans compte.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
