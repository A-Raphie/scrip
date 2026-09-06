import type { Metadata } from "next";
import Link from "next/link";
import { readLiveVibeState, vibe, vibenetTx } from "@/lib/vibenet";
import { fmtDate } from "@/lib/format";
import { BackHome, Footer, Wordmark } from "@/components/chrome";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Weft: the proof run",
  description:
    "A full weave, dividend, split, and unwind executed onchain on Base Vibenet: real B20 precompiles, real multiplier events, every step linked to its transaction.",
};

import fs from "node:fs";
import path from "node:path";

const run: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data/vibenet-run.json"), "utf8"),
);

type ActionRow = {
  k: "m" | "a";
  sym: string;
  b: number;
  tx: string;
  t: number;
  o?: string;
  n?: string;
  e?: string;
  i?: string;
  d?: string;
};

function loadVibeActions(): ActionRow[] {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), "data/vibenet-actions.jsonl"), "utf8");
    return text
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

const r = run as Record<string, string>;
const n18 = (v?: string) => Number(v ?? 0) / 1e18;
const n6 = (v?: string) => Number(v ?? 0) / 1e6;

export default async function ProofPage() {
  const live = await readLiveVibeState();
  const actions = loadVibeActions();

  const rows: {
    kind: string;
    at: number;
    headline: string;
    detail?: string;
    tx: string;
  }[] = [];

  // the loop, from the recorded run
  rows.push({
    kind: "WOVEN",
    at: 0,
    headline: "Wove 1,000 tUSDC into the basket",
    detail: `1,000 wPROOF shares minted; basket now holds 2.5 wAAPL and 5 wNVDA`,
    tx: r.tx_weave,
  });
  rows.push({
    kind: "DIVIDEND",
    at: 0,
    headline: "wAAPL dividend: multiplier 1.00 to 1.02",
    detail: `Basket value $1,000.00 to $${n18(r.after_dividend_value).toFixed(2)}; raw token balances untouched`,
    tx: r.tx_dividend_wAapl,
  });
  rows.push({
    kind: "DIVIDEND",
    at: 0,
    headline: "wNVDA dividend: multiplier 1.00 to 1.02",
    detail: "Dividends on tokenized stocks are share-reinvested, never cash",
    tx: r.tx_dividend_wNvda,
  });
  rows.push({
    kind: "SPLIT",
    at: 0,
    headline: "wNVDA 2-for-1 split: multiplier 1.02 to 2.04",
    detail: `Basket value to $${n18(r.after_split_value).toFixed(2)}; the wNVDA leg now redeems for double`,
    tx: r.tx_split_wNvda,
  });
  rows.push({
    kind: "UNWOUND",
    at: 0,
    headline: "Unwound all 1,000 shares",
    detail: `Unwound into 999.999 tUSDC plus the 1,000 unused weave balance: the fixture pools price at their fixed rate, so the split-doubled value shows in the basket read, not the unwind`,
    tx: r.tx_unwind,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 pt-7">
        <div className="flex items-baseline gap-4">
          <Wordmark small />
          <BackHome />
        </div>
        <span className="font-mono text-xs tracking-[0.14em] text-ink-mute">BASE VIBENET · TESTNET</span>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">The proof run</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">
          Weave, dividend, split, unwind. Onchain.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          No dividend or split has ever executed on the Coinbase tokenized stock
          registry on Base mainnet: every multiplier still reads 1.0. So this run
          was executed on Base Vibenet, where the same B20 precompiles run live.
          Real factory, real multiplier events, real announcements, and the same
          WeftIndex contract bound for mainnet. Every line links to its
          transaction.
        </p>

        {/* the loop */}
        <section className="mt-8">
          <div className="ring-hairline relative bg-paper-raise">
            <div
              aria-hidden
              className="absolute top-0 bottom-0 left-0 w-4 border-r border-line-soft"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--color-line) 1.5px, transparent 1.6px)",
                backgroundSize: "4px 14px",
                backgroundPosition: "6px 7px",
              }}
            />
            <div className="pl-4">
              {rows.map((row, i) => (
                <div key={i} className="flex items-baseline gap-3 border-b border-line-soft/70 px-3 py-2.5 last:border-b-0">
                  <span className="w-[4.7rem] shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
                    {row.kind}
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    <span className="font-mono text-[13px]">{row.headline}</span>
                    {row.detail && (
                      <span className="block text-[13px] leading-snug text-ink-mute">{row.detail}</span>
                    )}
                  </span>
                  {row.tx && (
                    <a
                      href={vibenetTx(row.tx)}
                      target="_blank"
                      rel="noreferrer"
                      className="proof-link shrink-0 font-mono text-[11px]"
                    >
                      proof
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* the numbers table */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl">The measurements</h2>
          <div className="ring-hairline overflow-x-auto bg-paper-raise">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  <th className="px-4 py-3 font-medium">Step</th>
                  <th className="px-4 py-3 font-medium">Basket value</th>
                  <th className="px-4 py-3 font-medium">wAAPL multiplier</th>
                  <th className="px-4 py-3 font-medium">wNVDA multiplier</th>
                  <th className="px-4 py-3 font-medium">Raw balances</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                <tr className="border-b border-line-soft/60">
                  <td className="px-4 py-2.5">after weave</td>
                  <td className="px-4 py-2.5">${n18(r.after_weave_value).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_weave_multA).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_weave_multB).toFixed(2)}</td>
                  <td className="px-4 py-2.5">2.5 / 5.0</td>
                </tr>
                <tr className="border-b border-line-soft/60 bg-paper-sink/40">
                  <td className="px-4 py-2.5">after dividend</td>
                  <td className="px-4 py-2.5">${n18(r.after_dividend_value).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_dividend_multA).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_dividend_multB).toFixed(2)}</td>
                  <td className="px-4 py-2.5">2.5 / 5.0 unchanged</td>
                </tr>
                <tr className="border-b border-line-soft/60">
                  <td className="px-4 py-2.5">after split</td>
                  <td className="px-4 py-2.5">${n18(r.after_split_value).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_split_multA).toFixed(2)}</td>
                  <td className="px-4 py-2.5">x{n18(r.after_split_multB).toFixed(2)}</td>
                  <td className="px-4 py-2.5">2.5 / 5.0 unchanged</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
            Raw token balances never moved: 2.5 wAAPL and 5 wNVDA sat in the
            index through both corporate actions. The dividends and the split
            flowed entirely through the B20 multiplier, which is exactly how
            Coinbase structured it on mainnet: value moves, balances do not.
          </p>
        </section>

        {/* live state right now */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl">Live on Vibenet right now</h2>
          {live.ok ? (
            <div className="ring-hairline grid grid-cols-2 bg-paper-raise sm:grid-cols-4">
              <div className="border-r border-line-soft p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">wAAPL multiplier</p>
                <p className="mt-1 font-mono text-xl text-ink">x{live.multA.toFixed(2)}</p>
              </div>
              <div className="border-r border-line-soft p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">wNVDA multiplier</p>
                <p className="mt-1 font-mono text-xl text-ink">x{live.multB.toFixed(2)}</p>
              </div>
              <div className="border-r border-line-soft p-4 max-sm:border-t">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">Index supply</p>
                <p className="mt-1 font-mono text-xl text-ink">{live.supply.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-4 max-sm:border-t">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">Contract</p>
                <a href={`https://chain.base.org/vibenet/address/${vibe.index}`} target="_blank" rel="noreferrer" className="proof-link mt-1 block font-mono text-sm">
                  {vibe.index.slice(0, 10)}...{vibe.index.slice(-6)}
                </a>
              </div>
            </div>
          ) : (
            <div className="ring-hairline bg-paper-raise p-4 text-sm text-ink-mute">
              Vibenet RPC unreachable from here. The run above is still onchain;
              verify with any Vibenet RPC.
            </div>
          )}
        </section>

        {/* issuer announcements as recorded */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl">The issuer announcements, as recorded onchain</h2>
          <div className="ring-hairline bg-paper-raise">
            {actions
              .filter((a) => a.k === "a")
              .map((a, i) => (
                <div key={i} className="border-b border-line-soft/70 px-4 py-3 last:border-b-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-mute">
                    {a.sym} · announcement {a.i}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink">{a.d}</p>
                  <a href={vibenetTx(a.tx)} target="_blank" rel="noreferrer" className="proof-link mt-1 inline-block font-mono text-[11px]">
                    proof
                  </a>
                </div>
              ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
            B20 writes these human-readable notices onchain explicitly to support
            public reporting requirements. Weft is the reporting surface.
          </p>
        </section>

        <section className="mt-10 border-t border-line-soft pt-4">
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-mute">
            <li>
              · Vibenet is Base&apos;s experimental preview network; test tokens
              hold no monetary value. The B20 factory, policies, multipliers, and
              announcements are the same precompiles as Base mainnet.
            </li>
            <li>
              · The tUSDC, fixed-price pools, and price feeds on Vibenet are
              disclosed fixtures; on mainnet the pools are Aerodrome Slipstream
              ($1.36M and $2.64M measured) and the feeds are Coinbase
              total-return Chainlink.
            </li>
            <li>
              · WeftIndex runs unmodified: the same bytecode this proof run used
              is what deploys to mainnet.
            </li>
          </ul>
        </section>

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}
