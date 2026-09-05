export type RowKind =
  | "ISSUED"
  | "ACQUIRED"
  | "DELIVERED"
  | "REDEEMED"
  | "DIVIDEND"
  | "SPLIT"
  | "NOTICE";

export type StatementRow = {
  kind: RowKind;
  symbol: string;
  at: number; // unix seconds shown on the line
  txHash: string;
  headline: string;
  detail?: string;
  proofUrl: string;
};

export type Holding = {
  symbol: string;
  name: string;
  token: string;
  decimals: number;
  multiplier: bigint; // WAD
  tokenBalance: number; // raw token units, human formatted
  scaledShares: number; // redeemable shares (scaledBalanceOf / 10^decimals)
  feedPrice: number | null;
  feedUpdatedAt: number | null;
  feedStale: boolean;
  valueUsd: number | null;
};

export type Statement = {
  address: string;
  blockNumber: bigint;
  generatedAt: number;
  holdings: Holding[];
  rows: StatementRow[]; // newest first
  truncated: boolean;
  statementHash: string;
  serial: string;
};

export function fmtShares(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function fmtTokens(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function fmtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtMultiplier(wad: bigint): string {
  return (Number(wad) / 1e18).toFixed(4).replace(/\.?0+$/, "");
}
