import type { Metadata, Viewport } from "next";
import { Libre_Bodoni, Geist, Geist_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#eff3ec",
};

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
  metadataBase: new URL("https://tryscrip.vercel.app"),
  title: "Weft: one token, woven from real stocks",
  description:
    "Weft weaves USDC into a weighted basket of Coinbase tokenized stocks on Base: one self-custodial index token, dividends handled, redeemable anytime, every step provable.",
  openGraph: {
    title: "Weft: one token, woven from real stocks",
    description:
      "An onchain index fund of Coinbase tokenized stocks. Dividends handled. Every step provable.",
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
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
