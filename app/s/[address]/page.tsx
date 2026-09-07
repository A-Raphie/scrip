import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildStatement, fmtDate, fmtMultiplier, fmtShares, fmtTokens, fmtUsd } from "@/lib/statement";
import { client } from "@/lib/b20";
import { Tape } from "@/components/tape";
import { BackLink, Footer, Wordmark } from "@/components/chrome";

export const revalidate = 120;

type Params = { params: Promise<{ address: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Weft statement: ${shortAddr(address)}`,
    description: `Weft statement for ${shortAddr(address)}: trades, dividends, splits, and issuer notices, each line backed by its transaction.`,
  };
}

function shortAddr(a: string) {
  return a.startsWith("0x") && a.length >= 10 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;
}

export default async function StatementPage({ params }: Params) {
  const { address: raw } = await params;
  let address: string;
  try {
    address = `0x${raw.replace(/^0x/i, "")}`;
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error("bad address");
  } catch {
    notFound();
  }

  let statement;
  try {
    const block = await client.getBlockNumber();
    statement = await buildStatement(address, { blockNumber: block });
  } catch {
    notFound();
  }

  const { holdings, rows, serial, statementHash, truncated } = statement;
  const totalValue = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);
  const actions = rows.filter((r) => r.kind === "DIVIDEND" || r.kind === "SPLIT").length;
  const hasAnything = holdings.length > 0 || rows.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 pt-7">
        <Wordmark small />
        {hasAnything && (
          <Link
            className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
            href={`/c/${address}/${statementHash.slice(2, 10)}`}
          >
            Mint the certificate
          </Link>
        )}
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10">
        {!hasAnything ? (
          <section className="ring-hairline bg-paper-raise p-8">
            <h1 className="font-display text-2xl">Nothing to state, yet.</h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              This address holds none of the Coinbase tokenized stocks right now
              and has no recorded trade history in the registry. If you just
              bought, the registry can take a short while to reflect it.
            </p>
            <p className="mt-4 text-sm text-ink-mute">
              Try the live example instead:{" "}
              <Link className="proof-link font-mono text-xs underline decoration-line" href="/s/0x68275200408371a3B34D36F1Ce058Cba2423F41F">
                0x6827...F41F
              </Link>
            </p>
          </section>
        ) : (
          <>
            {/* statement head */}
            <section>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
                Statement of tokenized stock
              </p>
              <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">
                {shortAddr(address)}
              </h1>
              <p className="mt-2 font-mono text-[13px] text-ink-soft">
                {serial} · drawn {fmtDate(statement.generatedAt)} · block{" "}
                {statement.blockNumber.toString()}
              </p>
            </section>

            {/* summary: four numbers, glance-first */}
            <section className="ring-hairline mt-6 grid grid-cols-2 bg-paper-raise sm:grid-cols-4">
              <div className="border-r border-line-soft p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Total value
                </p>
                <p className="mt-1 font-mono text-xl text-ink">
                  {totalValue > 0 ? fmtUsd(totalValue) : "n/a"}
                </p>
              </div>
              <div className="border-r border-line-soft p-4 sm:border-r">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Positions
                </p>
                <p className="mt-1 font-mono text-xl text-ink">{holdings.length}</p>
              </div>
              <div className="border-r border-line-soft p-4 max-sm:border-t">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Statement lines
                </p>
                <p className="mt-1 font-mono text-xl text-ink">{rows.length}</p>
              </div>
              <div className="p-4 max-sm:border-t">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Dividends and splits
                </p>
                <p className="mt-1 font-mono text-xl text-ink">{actions}</p>
              </div>
            </section>

            {/* THE TAPE */}
            {rows.length > 0 && (
              <section className="mt-10">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="font-display text-xl">The tape</h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                    prints oldest first · every line has proof
                  </span>
                </div>
                <Tape rows={rows} />
              </section>
            )}

            {/* holdings */}
            {holdings.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-3 font-display text-xl">Holdings as drawn</h2>
                <div className="ring-hairline overflow-x-auto bg-paper-raise">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-line-soft text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                        <th className="px-4 py-3 font-medium">Token</th>
                        <th className="px-4 py-3 font-medium">Shares</th>
                        <th className="px-4 py-3 font-medium">Tokens</th>
                        <th className="px-4 py-3 font-medium">Multiplier</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 text-right font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr key={h.symbol} className="border-b border-line-soft/60 last:border-b-0">
                          <td className="px-4 py-3">
                            <span className="font-mono text-[13px] font-semibold">{h.symbol}</span>
                            <span className="block text-xs text-ink-mute">{h.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[13px]">{fmtShares(h.scaledShares)}</td>
                          <td className="px-4 py-3 font-mono text-[13px] text-ink-soft">
                            {fmtTokens(h.tokenBalance)}
                          </td>
                          <td className="px-4 py-3 font-mono text-[13px] text-ink-soft">
                            x{fmtMultiplier(h.multiplier)}
                          </td>
                          <td className="px-4 py-3 font-mono text-[13px] text-ink-soft">
                            {h.feedPrice !== null && !h.feedStale
                              ? fmtUsd(h.feedPrice)
                              : "stale feed"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[13px]">
                            {h.valueUsd !== null ? fmtUsd(h.valueUsd) : "n/a"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* honesty footnotes */}
            <section className="mt-10 border-t border-line-soft pt-4">
              <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-mute">
                <li>
                  · Shares = raw tokens x the onchain multiplier. One token is not
                  permanently one share.
                </li>
                <li>
                  · Prices are the Coinbase total-return oracle feeds, held stale
                  over weekends and corporate actions. Values are hidden when a
                  feed is too stale to trust.
                </li>
                <li>
                  · Dividend and split lines come from the issuer&apos;s onchain
                  multiplier events; the split-versus-dividend label follows the
                  size of the ratio.
                </li>
                {truncated && (
                  <li>
                    · This history was too long to walk fully; the earliest lines
                    may be missing.
                  </li>
                )}
                <li>
                  · Positions closed entirely in the past may not appear here; the
                  registry only reports what the address holds or has traded in
                  indexed history.
                </li>
              </ul>
            </section>
          </>
        )}

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}
