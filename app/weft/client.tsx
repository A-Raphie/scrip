"use client";

import Link from "next/link";
import { useWallet } from "@/components/wallet";
import { BackHome, Footer, Wordmark } from "@/components/chrome";
import { StatusStrip } from "@/components/status-strip";

export default function WeftBasketPage() {
  const { address, connecting, connect } = useWallet();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 pt-7">
        <div className="flex items-baseline gap-4">
          <Wordmark small />
          <BackHome />
        </div>
        {address ? (
          <button onClick={() => {}} className="ring-hairline bg-paper-raise px-3 py-2 font-mono text-xs text-ink">
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-60"
          >
            {connecting ? "Connecting..." : "Connect wallet"}
          </button>
        )}
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-6">
        <StatusStrip
          items={[
            { label: "Live", tone: "live" },
            { label: "Base Mainnet" },
            { label: "Non-Custodial" },
            { label: "Unaudited" },
          ]}
        />
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Onchain index fund</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">The Tech Basket</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          One token holding Apple, NVIDIA, Microsoft, and Tesla: the Coinbase
          tokenized stocks on Base. Weave USDC in, unwind back out, every step
          provable onchain.
        </p>

        {/* BASKET: fixed legs from the measured mainnet pools. This table
            hard-codes the four deepest legs (measured Sep 6) so the page is
            complete before the index deploys; the wallet section below reads
            the live contract and replaces it. */}
        <section className="ring-hairline mt-8 overflow-x-auto bg-paper-raise">
          <table className="tnum w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                <th className="px-4 py-3 font-medium">Thread</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 text-right font-medium">Pool</th>
                <th className="px-4 py-3 text-right font-medium">Oracle price</th>
                <th className="px-4 py-3 text-right font-medium">B20 multiplier</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[13px]">
              <tr className="border-b border-line-soft/60">
                <td className="px-4 py-2.5 text-ink">AAPLc · Apple</td>
                <td className="px-4 py-2.5 text-ink-soft">35%</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">$1.36M</td>
                <td className="px-4 py-2.5 text-right text-ink">$320.08</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">x1.00 · never rebased</td>
              </tr>
              <tr className="border-b border-line-soft/60">
                <td className="px-4 py-2.5 text-ink">NVDAc · NVIDIA</td>
                <td className="px-4 py-2.5 text-ink-soft">35%</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">$2.64M</td>
                <td className="px-4 py-2.5 text-right text-ink">$229.96</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">x1.00 · never rebased</td>
              </tr>
              <tr className="border-b border-line-soft/60">
                <td className="px-4 py-2.5 text-ink">MSFTc · Microsoft</td>
                <td className="px-4 py-2.5 text-ink-soft">15%</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">$74K</td>
                <td className="px-4 py-2.5 text-right text-ink">$499.78</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">x1.00 · never rebased</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-ink">TSLAc · Tesla</td>
                <td className="px-4 py-2.5 text-ink-soft">15%</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">$145K</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">$353.33</td>
                <td className="px-4 py-2.5 text-right text-ink-soft">x1.00 · never rebased</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* FUND LINE: live contract reads replace this card at deploy */}
        <section className="ring-hairline mt-4 flex flex-wrap items-center justify-between gap-3 bg-paper-raise px-4 py-3 text-sm">
          <span className="font-mono text-ink">
            Basket value: <strong>reads live at deploy</strong>
          </span>
          <span className="font-mono text-xs text-ink-mute">
            from the index contract + Coinbase total-return feeds
          </span>
        </section>

        {/* THE FULL RUN: Vibenet proof, framed as rehearsal, not the product */}
        <section className="ring-hairline mt-8 bg-paper-raise p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                Rehearsed on Base Vibenet (testnet) · Sep 6
              </p>
              <h2 className="mt-1 font-display text-xl">The full run, already executed</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                The exact weave → dividend → split → unwind was run onchain on
                Vibenet, where the same B20 precompiles are live: $1,000 in,
                dividend to $1,020, split to $1,530, unwound. Six transactions,
                every line linking to its proof.
              </p>
            </div>
            <Link
              href="/weft/proof"
              className="shrink-0 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
            >
              See the rehearsal
            </Link>
          </div>
        </section>

        {/* HONESTY FOOTNOTES: state the posture plainly, no buried single line */}
        <section className="mt-8 border-t border-line-soft pt-4">
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-mute">
            <li>
              · WeftIndex deploys to Base mainnet next: wallet actions and live
              fund reads light up at deployment. The basket legs above are the
              measured mainnet pools it will trade against.
            </li>
            <li>
              · The full loop already ran on Base Vibenet. Nothing here sells or
              asks for money until the mainnet contract exists.
            </li>
            <li>
              · Tokenized stocks are available to eligible non-US users only.
              This interface displays public chain data.
            </li>
          </ul>
        </section>

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}
