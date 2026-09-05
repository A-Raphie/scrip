import type { Metadata } from "next";
import { Libre_Bodoni, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const bodoni = Libre_Bodoni({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Scrip: statements for tokenized stocks",
  description:
    "Paste any Base address. Scrip reads Coinbase tokenized stock tokens (B20) and prints a brokerage-grade statement: trades, dividends, splits, and issuer notices, each line backed by its transaction.",
  openGraph: {
    title: "Scrip: statements for tokenized stocks",
    description:
      "The paperwork your tokenized stocks never came with. Every line backed by its transaction.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bodoni.variable} ${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
