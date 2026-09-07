import type { Metadata } from "next";
import WeftBasketPage from "./client";

export const metadata: Metadata = {
  title: "Weft: the Tech Basket",
  description:
    "One token holding Apple, NVIDIA, Microsoft, and Tesla: the Coinbase tokenized stocks on Base. Basket legs from the measured mainnet pools.",
};

export const revalidate = 120;

export default function WeftPage() {
  return <WeftBasketPage />;
}
