import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude-minne",
  description: "Privat molnminne för Claude. Dashboard V1.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
