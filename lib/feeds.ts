import { client, aggregatorV3Abi } from "./b20";
import { TICKERS } from "./tickers";

export type LiveTicker = {
  symbol: string;
  name: string;
  price: number | null;
  updatedAt: number | null;
  stale: boolean;
};

// Server-side read of every Coinbase total-return feed, one multicall.
// These are the prices the basket itself is valued at.
export async function readLivePrices(): Promise<LiveTicker[]> {
  const results = await client
    .multicall({
      contracts: TICKERS.map(
        (t) =>
          ({
            address: t.feed,
            abi: aggregatorV3Abi,
            functionName: "latestRoundData",
          }) as const,
      ),
      allowFailure: true,
    })
    .catch(() => null);

  return TICKERS.map((t, i) => {
    const r = results?.[i];
    if (!r || r.status !== "success") {
      return { symbol: t.symbol, name: t.name, price: null, updatedAt: null, stale: true };
    }
    const res = r.result as unknown as bigint[];
    const price = Number(res[1]) / 1e8;
    const updatedAt = Number(res[3]);
    const stale = Date.now() / 1000 - updatedAt > 7 * 24 * 3600;
    return { symbol: t.symbol, name: t.name, price, updatedAt, stale };
  });
}
