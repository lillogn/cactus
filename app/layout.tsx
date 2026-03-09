// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CACTUS — Lead Generation Locale",
  description: "Trova business locali senza sito web in Campania",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className="noise antialiased">{children}</body>
    </html>
  );
}
