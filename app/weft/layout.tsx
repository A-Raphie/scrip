import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weft: the Tech Basket",
  description:
    "Weave USDC into a weighted basket of Coinbase tokenized stocks on Base: Apple, NVIDIA, Microsoft, Tesla. One self-custodial index token. Unwind anytime.",
};

export default function WeftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
