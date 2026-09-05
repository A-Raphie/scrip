import { client, ib20Abi, ib20AssetAbi, aggregatorV3Abi } from "./b20";

const BLOCKSCOUT = "https://base.blockscout.com/api/v2";
const ZERO = "0x0000000000000000000000000000000000000000";

export type HolderTransfer = {
  block: number;
  ts: number; // unix seconds
  tx: string;
  from: string;
  to: string;
  valueRaw: bigint;
};

// Blockscout's public API gives address-filtered token transfer history with
// full depth, which the free RPC gateways refuse (10k-block range caps).
export async function fetchHolderTransfers(
  address: string,
  token: string,
  maxPages = 12,
): Promise<{ transfers: HolderTransfer[]; truncated: boolean }> {
  const transfers: HolderTransfer[] = [];
  let url: string | null =
    `${BLOCKSCOUT}/addresses/${address}/token-transfers?type=ERC-20&token=${token}`;
  let truncated = false;

  for (let page = 0; page < maxPages && url; page++) {
    let json: any;
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
        next: { revalidate: 300 },
      });
      json = await res.json();
    } catch {
      truncated = transfers.length > 0 || truncated;
      break;
    }
    const items: any[] = json?.items ?? [];
    for (const it of items) {
      const from = (it.from?.hash ?? ZERO).toLowerCase();
      const to = (it.to?.hash ?? ZERO).toLowerCase();
      transfers.push({
        block: Number(it.block_number),
        ts: Math.floor(new Date(it.timestamp).getTime() / 1000),
        tx: it.transaction_hash,
        from,
        to,
        valueRaw: BigInt(it.total?.value ?? "0"),
      });
    }
    url = json?.next_page_url ?? null;
    if (url && !url.startsWith("http")) url = BLOCKSCOUT.replace("/api/v2", "") + url;
  }
  if (url) truncated = true; // stopped before exhausting pages

  transfers.sort((a, b) => a.block - b.block || a.ts - b.ts);
  return { transfers, truncated };
}

// Corporate actions live in the tiny committed store: one JSONL line per
// UIMultiplierUpdated or Announcement across the registry.
export type ActionEvent = {
  k: "m" | "a";
  sym: string;
  b: number;
  tx: string;
  t: number;
  o?: string; // old multiplier (WAD)
  n?: string; // new multiplier (WAD)
  e?: string; // effectiveAt (unix seconds), scheduled updates only
  i?: string; // announcement id
  d?: string; // announcement description
};

export async function loadActions(): Promise<ActionEvent[]> {
  const lines: string[] = [];
  let source = "repo";

  try {
    const fs = await import("node:fs");
    const path = process.cwd() + "/data/actions.jsonl";
    const text = fs.readFileSync(path, "utf8");
    lines.push(...text.split("\n"));
  } catch {
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/A-Raphie/scrip/main/data/actions.jsonl",
        { next: { revalidate: 900 } },
      );
      if (res.ok) {
        lines.push(...(await res.text()).split("\n"));
        source = "remote";
      }
    } catch {
      // store unavailable; statements render without corporate-action rows
    }
  }

  const events: ActionEvent[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // tolerate a torn last line from a concurrent append
    }
  }
  events.sort((a, b) => a.b - b.b);
  void source;
  return events;
}

// Live reads: balances, multiplier, scaled balance, and the total-return price.
export type LiveTokenState = {
  rawBalance: bigint;
  decimals: number;
  name: string;
  multiplier: bigint;
  scaledRaw: bigint;
  feedPrice: number | null;
  feedUpdatedAt: number | null;
  feedStale: boolean;
};

export async function fetchLiveState(
  address: `0x${string}`,
  token: `0x${string}`,
  feed: `0x${string}`,
): Promise<LiveTokenState> {
  const [meta, feedRes] = await Promise.all([
    client
      .multicall({
        contracts: [
          { address: token, abi: ib20Abi, functionName: "balanceOf", args: [address] },
          { address: token, abi: ib20Abi, functionName: "decimals" },
          { address: token, abi: ib20Abi, functionName: "name" },
          { address: token, abi: ib20AssetAbi, functionName: "multiplier" },
          { address: token, abi: ib20AssetAbi, functionName: "scaledBalanceOf", args: [address] },
        ] as const,
        allowFailure: true,
      })
      .catch(() => null),
    client
      .multicall({
        contracts: [{ address: feed, abi: aggregatorV3Abi, functionName: "latestRoundData" }] as const,
        allowFailure: true,
      })
      .then((r) => r[0])
      .catch(() => null),
  ]);

  const pick = <T>(i: number, fallback: T): T =>
    meta && meta[i]?.status === "success" ? (meta[i].result as T) : fallback;

  let feedPrice: number | null = null;
  let feedUpdatedAt: number | null = null;
  let feedStale = true;
  if (feedRes && feedRes.status === "success") {
    const res = feedRes.result as unknown as bigint[];
    feedPrice = Number(res[1]) / 1e8;
    feedUpdatedAt = Number(res[3]);
    // total-return feeds hold the last close over weekends and freeze during
    // corporate actions; a week without a heartbeat means the price is unusable
    feedStale = Date.now() / 1000 - feedUpdatedAt > 7 * 24 * 3600;
  }

  return {
    rawBalance: pick<bigint>(0, 0n),
    decimals: pick<number>(1, 8),
    name: pick<string>(2, ""),
    multiplier: pick<bigint>(3, 10n ** 18n),
    scaledRaw: pick<bigint>(4, 0n),
    feedPrice,
    feedUpdatedAt,
    feedStale,
  };
}
