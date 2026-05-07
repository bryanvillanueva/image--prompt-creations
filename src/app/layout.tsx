import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Studio",
  description: "Personalized AI photos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh antialiased bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {children}
        </div>
      </body>
    </html>
  );
}
