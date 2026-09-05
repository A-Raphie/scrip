import { getAddress, keccak256, toBytes } from "viem";
import { TICKERS, TICKER_BY_TOKEN, type Ticker } from "./tickers";
import { fetchHolderTransfers, fetchLiveState, loadActions, type ActionEvent } from "./history";
import "server-only";
import type { Holding, Statement, StatementRow } from "./format";
import { fmtShares, fmtTokens } from "./format";

export { fmtShares, fmtTokens, fmtUsd, fmtDate, fmtMultiplier } from "./format";
export type { Holding, StatementRow, RowKind } from "./format";

const WAD = 10n ** 18n;
const ZERO = "0x0000000000000000000000000000000000000000";

type MergedEvent =
  | {
      kind: "transfer";
      order: number;
      at: number;
      tx: string;
      from: string;
      to: string;
      valueRaw: bigint;
    }
  | { kind: "action"; order: number; at: number; tx: string; action: ActionEvent };

export async function buildStatement(
  addressInput: string,
  opts?: { blockNumber?: bigint },
): Promise<Statement> {
  const address = getAddress(addressInput.trim());
  const lower = address.toLowerCase();

  const blockNumber = opts?.blockNumber ?? 0n;
  const actions = await loadActions();

  // 1. which registry tokens does the address hold right now?
  const { client, ib20Abi } = await import("./b20");
  const balances = await client.multicall({
    contracts: TICKERS.map(
      (t) =>
        ({
          address: t.token,
          abi: ib20Abi,
          functionName: "balanceOf",
          args: [address],
        }) as const,
    ),
    allowFailure: true,
  });
  const active: Ticker[] = [];
  for (let i = 0; i < TICKERS.length; i++) {
    const r = balances[i];
    if (r.status === "success" && (r.result as bigint) > 0n) active.push(TICKERS[i]);
  }

  // 2. history (Blockscout) + live state (RPC) per active token
  const perToken = await Promise.all(
    active.map(async (ticker) => {
      const [live, history] = await Promise.all([
        fetchLiveState(address, ticker.token, ticker.feed),
        fetchHolderTransfers(address, ticker.token),
      ]);
      const tokenActions = actions.filter((a) => a.sym === ticker.symbol);
      return { ticker, live, history, tokenActions };
    }),
  );

  const holdings: Holding[] = [];
  const rows: StatementRow[] = [];
  let truncated = false;

  for (const { ticker, live, history, tokenActions } of perToken) {
    const unit = 10n ** BigInt(live.decimals);
    truncated = truncated || history.truncated;

    // merge transfers and corporate actions into one chronological walk
    const merged: MergedEvent[] = [
      ...history.transfers.map((t) => ({
        kind: "transfer" as const,
        order: t.block,
        at: t.ts,
        tx: t.tx,
        from: t.from,
        to: t.to,
        valueRaw: t.valueRaw,
      })),
      ...tokenActions.map((a) => ({
        kind: "action" as const,
        order: a.b,
        at: a.t,
        tx: a.tx,
        action: a,
      })),
    ].sort((a, b) => a.order - b.order || a.kind.localeCompare(b.kind) || a.at - b.at);

    let rawAt = 0n; // replayed raw token balance through the walk
    for (const e of merged) {
      if (e.kind === "transfer") {
        const tokens = Number(e.valueRaw) / Number(unit);
        if (e.to === lower) {
          const opening = rawAt === 0n;
          rawAt += e.valueRaw;
          if (e.from === ZERO) {
            rows.push({
              kind: "ISSUED",
              symbol: ticker.symbol,
              at: e.at,
              txHash: e.tx,
              headline: `Issued ${fmtTokens(tokens)} ${ticker.symbol} from the authorized participant desk`,
              detail: "New stock tokens minted to this address",
              proofUrl: `https://basescan.org/tx/${e.tx}`,
            });
          } else {
            rows.push({
              kind: "ACQUIRED",
              symbol: ticker.symbol,
              at: e.at,
              txHash: e.tx,
              headline: `Acquired ${fmtTokens(tokens)} ${ticker.symbol}`,
              detail: opening ? "Opening position" : undefined,
              proofUrl: `https://basescan.org/tx/${e.tx}`,
            });
          }
        } else {
          rawAt = rawAt > e.valueRaw ? rawAt - e.valueRaw : 0n;
          if (e.to === ZERO) {
            rows.push({
              kind: "REDEEMED",
              symbol: ticker.symbol,
              at: e.at,
              txHash: e.tx,
              headline: `Redeemed ${fmtTokens(tokens)} ${ticker.symbol} through the authorized participant desk`,
              proofUrl: `https://basescan.org/tx/${e.tx}`,
            });
          } else {
            rows.push({
              kind: "DELIVERED",
              symbol: ticker.symbol,
              at: e.at,
              txHash: e.tx,
              headline: `Delivered ${fmtTokens(tokens)} ${ticker.symbol}`,
              proofUrl: `https://basescan.org/tx/${e.tx}`,
            });
          }
        }
      } else {
        const a = e.action;
        if (a.k === "m") {
          const oldWad = BigInt(a.o ?? "0");
          const newWad = BigInt(a.n ?? "0");
          if (oldWad === 0n || newWad === oldWad) continue;
          // scheduled updates are recorded at scheduling time but apply at
          // the effective date; that economic date is what a statement shows
          const effectiveAt = a.e && a.e !== "0" ? Number(a.e) : 0;
          const at = effectiveAt > a.t ? effectiveAt : a.t;
          const ratio = Number(newWad) / Number(oldWad);
          const pctChange = (ratio - 1) * 100;
          const holderSharesAt = Number((rawAt * oldWad) / WAD) / Number(unit);
          const gainedShares =
            Number((rawAt * (newWad - oldWad)) / oldWad) / Number(unit);
          if (ratio >= 2) {
            rows.push({
              kind: "SPLIT",
              symbol: ticker.symbol,
              at,
              txHash: a.tx,
              headline: `${ratio.toFixed(1).replace(/\.0$/, "")}-for-1 split applied`,
              detail:
                holderSharesAt > 0
                  ? `Position adjusted: +${fmtShares(gainedShares)} shares on ${fmtShares(holderSharesAt)} held`
                  : "No position held at the effective time",
              proofUrl: `https://basescan.org/tx/${a.tx}`,
            });
          } else if (Math.abs(pctChange) > 0.000001) {
            rows.push({
              kind: "DIVIDEND",
              symbol: ticker.symbol,
              at,
              txHash: a.tx,
              headline: `Dividend reinvested: ${pctChange > 0 ? "+" : ""}${pctChange.toFixed(4).replace(/\.?0+$/, "")}% in shares`,
              detail:
                holderSharesAt > 0
                  ? `Reinvested as ${fmtShares(gainedShares)} shares on a position of ${fmtShares(holderSharesAt)}`
                  : "No position held at the effective time",
              proofUrl: `https://basescan.org/tx/${a.tx}`,
            });
          }
        } else {
          const desc = (a.d ?? "").trim();
          rows.push({
            kind: "NOTICE",
            symbol: ticker.symbol,
            at: a.t,
            txHash: a.tx,
            headline:
              desc.length > 160 ? desc.slice(0, 157) + "..." : desc || `Issuer notice ${a.i ?? ""}`,
            detail: "Issuer announcement recorded onchain",
            proofUrl: `https://basescan.org/tx/${a.tx}`,
          });
        }
      }
    }

    const scaledShares = Number(live.scaledRaw) / Number(unit);
    const valueUsd =
      live.feedPrice !== null && !live.feedStale ? scaledShares * live.feedPrice : null;

    holdings.push({
      symbol: ticker.symbol,
      name: live.name || ticker.name,
      token: ticker.token,
      decimals: live.decimals,
      multiplier: live.multiplier,
      tokenBalance: Number(live.rawBalance) / Number(unit),
      scaledShares,
      feedPrice: live.feedPrice,
      feedUpdatedAt: live.feedUpdatedAt,
      feedStale: live.feedStale,
      valueUsd,
    });
  }

  rows.sort((a, b) => b.at - a.at);

  const canonical = JSON.stringify({
    a: address,
    h: holdings.map((h) => [h.symbol, h.scaledShares, h.multiplier.toString()]),
    r: rows.map((r) => [r.kind, r.symbol, r.at, r.txHash, r.headline]),
  });
  const statementHash = keccak256(toBytes(canonical));
  const serial = `SCRIP-${statementHash.slice(2, 6).toUpperCase()}-${statementHash
    .slice(6, 10)
    .toUpperCase()}-${statementHash.slice(10, 14).toUpperCase()}`;

  return {
    address,
    blockNumber,
    generatedAt: Math.floor(Date.now() / 1000),
    holdings,
    rows,
    truncated,
    statementHash,
    serial,
  };
}

export function tickerByToken(token: string): Ticker | undefined {
  return TICKER_BY_TOKEN.get(token.toLowerCase());
}
