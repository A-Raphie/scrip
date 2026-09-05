import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { buildStatement, fmtDate, fmtShares, fmtUsd } from "@/lib/statement";
import { Footer, Wordmark } from "@/components/chrome";

export const revalidate = 300;

type Params = { params: Promise<{ address: string; hash: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { address, hash } = await params;
  return {
    title: `Scrip certificate ${hash.toUpperCase()} for ${address.slice(0, 6)}...`,
    description: "A verifiable statement certificate for tokenized stock holdings on Base.",
  };
}

export default async function CertificatePage({ params }: Params) {
  const { address: raw, hash } = await params;
  const address = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address) || !/^[0-9a-fA-F]{8}$/.test(hash)) notFound();

  let statement;
  try {
    statement = await buildStatement(address);
  } catch {
    notFound();
  }

  // verification is a replay: draw the statement again and compare the hash.
  // identical means every line still matches the chain.
  const liveHash = statement.statementHash.slice(2, 10).toLowerCase();
  const verified = liveHash === hash.toLowerCase();

  const { holdings, rows, serial } = statement;
  const totalValue = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);
  const top = [...holdings].sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0)).slice(0, 6);
  const actions = rows.filter((r) => r.kind === "DIVIDEND" || r.kind === "SPLIT").length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-7">
        <Wordmark small />
        <Link className="text-sm text-ink-mute hover:text-ink" href={`/s/${address}`}>
          Open the full statement
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-10">
        <article className="cert-border bg-paper-raise p-8 sm:p-12">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mute">
            Certificate of tokenized stock holdings
          </p>
          <h1 className="mt-4 text-center font-display text-3xl tracking-tight sm:text-4xl">
            {holdings.length > 0
              ? `${holdings.length} position${holdings.length > 1 ? "s" : ""}, stated onchain`
              : "No positions on record"}
          </h1>
          <p className="mt-3 text-center font-mono text-[13px] text-ink-soft">{serial}</p>

          {/* verification band: honest, replay-based */}
          <div
            className={`mx-auto mt-6 max-w-md px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.14em] ${
              verified
                ? "bg-ink text-paper"
                : "bg-paper-sink text-ink-soft"
            }`}
          >
            {verified
              ? "Verified: every line still matches the chain"
              : "Amended: the statement changed since this certificate"}
          </div>

          <dl className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-line-soft pb-2">
              <dt className="text-ink-mute">Holder</dt>
              <dd className="font-mono text-[13px]">
                {address.slice(0, 8)}...{address.slice(-6)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line-soft pb-2">
              <dt className="text-ink-mute">Drawn</dt>
              <dd className="font-mono text-[13px]">{fmtDate(statement.generatedAt)}</dd>
            </div>
            <div className="flex justify-between border-b border-line-soft pb-2">
              <dt className="text-ink-mute">Total value</dt>
              <dd className="font-mono text-[13px]">
                {totalValue > 0 ? fmtUsd(totalValue) : "n/a"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line-soft pb-2">
              <dt className="text-ink-mute">Dividends and splits</dt>
              <dd className="font-mono text-[13px]">{actions}</dd>
            </div>
          </dl>

          {top.length > 0 && (
            <table className="mx-auto mt-8 w-full max-w-xl text-sm">
              <tbody>
                {top.map((h) => (
                  <tr key={h.symbol} className="border-b border-line-soft/60 last:border-b-0">
                    <td className="py-2 font-mono text-[13px] font-semibold">{h.symbol}</td>
                    <td className="py-2 text-right font-mono text-[13px] text-ink-soft">
                      {fmtShares(h.scaledShares)} shares
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="mt-10 text-center text-xs leading-relaxed text-ink-mute">
            Anyone can re-verify this certificate by drawing the statement again:
            the hash of every line is recomputed from Base mainnet, never stored.
            Scrip reads public data only and is not affiliated with Coinbase or
            Base.
          </p>
        </article>

        <div className="h-16" />
      </main>

      <Footer />
    </div>
  );
}
