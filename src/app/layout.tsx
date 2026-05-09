import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Promptlib — Biblioteca comunitaria de prompts IA",
  description:
    "Descubre, copia y guarda prompts para generación de imágenes con IA. Comunidad de creadores compartiendo recursos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh" suppressHydrationWarning>
        <Providers>
          <Suspense>
            <NavBar />
          </Suspense>
          <main className="container-app py-8 md:py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
