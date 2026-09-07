import type { Metadata } from "next";
import { readLivePrices } from "@/lib/feeds";
import { readLiveVibeState } from "@/lib/vibenet";
import WeftBasketPage from "./client";

export const metadata: Metadata = {
  title: "Weft: the Tech Basket",
  description:
    "A live proof basket on Base Vibenet holding two real B20 stock tokens. Weave tUSDC in, unwind back out, dividends and splits rendered from the onchain multipliers. The mainnet basket deploys next.",
};

export const revalidate = 120;

export default async function WeftPage() {
  const [prices, liveState] = await Promise.all([
    readLivePrices().catch(() => []),
    readLiveVibeState(),
  ]);

  const state = liveState.ok
    ? {
        ok: true,
        value: liveState.value,
        supply: liveState.supply,
        symbol: liveState.symbol,
        multA: liveState.multA,
        multB: liveState.multB,
      }
    : { ok: false, value: 0, supply: 0, symbol: "", multA: 1, multB: 1 };

  return <WeftBasketPage prices={prices} liveState={state} />;
}
