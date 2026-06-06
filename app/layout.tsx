import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F&B Business Consultant Calculator",
  description: "Kalkulator konsultasi bisnis F&B lokal-first",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
