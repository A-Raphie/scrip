import Link from "next/link";
import { readLivePrices } from "@/lib/feeds";
import { TaglineReveal } from "@/components/tagline-reveal";
import { Footer } from "@/components/chrome";

// the demo address: a real AAPLc holder on Base mainnet, verified Sep 5 2026
const DEMO_ADDRESS = "0x68275200408371a3B34D36F1Ce058Cba2423F41F";

export const revalidate = 120;

export default async function Home() {
  const prices = await readLivePrices().catch(() => []);
  const withPrice = prices.filter((p) => p.price !== null && !p.stale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-7">
        <span className="font-display text-2xl tracking-tight">Weft</span>
        <span className="hidden font-mono text-xs tracking-[0.14em] text-ink-mute sm:block">
          AN INDEX FUND OF TOKENIZED STOCKS
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        {/* HERO */}
        <section className="pt-16 sm:pt-24">
          <h1 className="max-w-2xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            One token, woven from real stocks.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Coinbase puts Apple, NVIDIA, Microsoft, and Tesla on Base as tokens.
            Weft turns USDC into a single self-custodial basket of them, and
            prints the paperwork nobody else does.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/weft"
              className="bg-ink px-6 py-3.5 text-base font-semibold text-paper hover:bg-ink-soft"
            >
              Weave your basket
            </Link>
            <Link
              href={`/s/${DEMO_ADDRESS}`}
              className="ring-hairline bg-paper-raise px-6 py-3.5 text-base font-medium text-ink hover:bg-paper-sink"
            >
              See a live statement
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink-mute">
            Read-only until you sign. Tokenized stocks are available to eligible
            non-US users only.
          </p>
        </section>

        {/* THE SITUATION */}
        <section className="mt-20">
          <h2 className="max-w-xl font-display text-2xl leading-snug tracking-tight sm:text-3xl">
            Buying the stocks is easy. Everything after that is missing.
          </h2>
          <div className="mt-5 max-w-xl space-y-4 text-[17px] leading-relaxed text-ink-soft">
            <p>
              Buy a tokenized stock and you receive a number in your wallet. No
              statement. No cost basis. No dividend notice. Nothing you could
              show an accountant, a friend, or yourself six months from now.
            </p>
            <p>
              And dividends here work strangely: no cash ever arrives. The
              issuer raises a hidden onchain number, and your tokens quietly
              become more shares. Most holders never see it happen.
            </p>
            <p className="text-ink">Weft is the layer that was missing.</p>
          </div>
        </section>

        {/* TAGLINE REVEAL */}
        <section className="py-24">
          <TaglineReveal text="Your stocks, woven into one holding. Dividends land. Weights hold. The chain does the paperwork." />
        </section>

        {/* WHAT IT DOES */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="ring-hairline flex flex-col bg-paper-raise p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
              01 · Statements
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">
              Paste an address. Get the paperwork.
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              Every buy, sell, dividend, split, and company notice for any
              address, dated and organized like a real brokerage statement. Each
              line carries a proof link to its own transaction.
            </p>
            <p className="mt-4 font-mono text-[13px] text-ink">
              Live example: 76 lines · $238.43 · drawn in seconds
            </p>
            <Link
              href={`/s/${DEMO_ADDRESS}`}
              className="proof-link mt-2 font-mono text-xs underline decoration-line"
            >
              Open the live statement
            </Link>
          </div>

          <div className="ring-hairline flex flex-col bg-paper-raise p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
              02 · The basket
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">
              Weave four stocks into one token.
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              Deposit USDC and one transaction swaps across the weights. You
              hold a single index token: Apple, NVIDIA, Microsoft, Tesla,
              self-custodial, no manager, no fees. Unwind burns it and returns
              your USDC.
            </p>
            <p className="mt-4 font-mono text-[13px] text-ink">
              35% AAPL · 35% NVDA · 15% MSFT · 15% TSLA
            </p>
            <Link
              href="/weft"
              className="proof-link mt-2 font-mono text-xs underline decoration-line"
            >
              Open the basket
            </Link>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight">How it works</h2>
          <ol className="mt-5 space-y-5">
            <li className="flex gap-4">
              <span className="font-mono text-sm text-ink-mute">1</span>
              <div>
                <p className="text-base font-semibold text-ink">Weave USDC in</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  One transaction swaps your deposit across the weights and
                  mints index shares. Minimum $5.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-sm text-ink-mute">2</span>
              <div>
                <p className="text-base font-semibold text-ink">Hold one token</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  The basket holds the stock tokens directly. Dividends and
                  splits flow through the onchain multiplier automatically.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="font-mono text-sm text-ink-mute">3</span>
              <div>
                <p className="text-base font-semibold text-ink">Unwind anytime</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Shares burn, USDC returns, pro-rata. Your statement and
                  certificate update themselves.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* PROOF RUN */}
        <section className="ring-hairline mt-16 bg-paper-raise p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-lg">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                Proven onchain · Base Vibenet testnet
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">
                The full loop, executed.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                $1,000 woven in. A dividend lands: $1,000 becomes $1,020. A
                2-for-1 split lands: $1,530. Unwound. Every step is a real
                transaction, every claim re-verifiable by script.
              </p>
            </div>
            <Link
              href="/weft/proof"
              className="shrink-0 bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
            >
              See the proof run
            </Link>
          </div>
        </section>

        {/* LIVE REGISTRY STRIP */}
        <section className="mt-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
            The Coinbase registry, live from the oracle feeds
          </h2>
          <div className="ring-hairline mt-3 bg-paper-raise px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
              {prices.map((p) => (
                <div key={p.symbol} className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[13px] text-ink">{p.symbol}</span>
                  <span className="font-mono text-[13px] text-ink-mute">
                    {p.price !== null && !p.stale
                      ? `$${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">
            {withPrice.length > 0
              ? `${withPrice.length} live total-return prices, read from the Coinbase oracle feeds at page load.`
              : "Live oracle prices: read from the Coinbase total-return feeds at page load."}{" "}
            The basket is built for exactly these feeds.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="font-display text-2xl tracking-tight">Questions</h2>
          <div className="mt-5 space-y-5">
            {[
              [
                "Is it custodial?",
                "No. The basket contract holds the stock tokens, and only your shares can move your slice. The interface never takes custody of anything.",
              ],
              [
                "What does it cost?",
                "The contract takes zero fees. You pay gas (cents on Base) and the pool's swap fee on each weave or unwind.",
              ],
              [
                "What happens when a dividend is paid?",
                "No cash arrives. The issuer raises the onchain multiplier and your tokens become more shares. The contract reads that multiplier directly, so the dividend lands on holders automatically and shows up on your statement.",
              ],
              [
                "Is it audited?",
                "No. It is a solo, disclosed hackathon build with no owner and no upgrade path. The proof run and the verify scripts exist so you can check everything yourself.",
              ],
              [
                "Who can use it?",
                "Tokenized stocks are available to eligible non-US users only. The app displays public chain data and enables no trading for US users.",
              ],
            ].map(([q, a]) => (
              <div key={q} className="border-b border-line-soft pb-4">
                <p className="text-base font-semibold text-ink">{q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 text-center">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Your stocks, woven into one token.
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/weft"
              className="bg-ink px-6 py-3.5 text-base font-semibold text-paper hover:bg-ink-soft"
            >
              Weave your basket
            </Link>
            <Link
              href={`/s/${DEMO_ADDRESS}`}
              className="ring-hairline bg-paper-raise px-6 py-3.5 text-base font-medium text-ink hover:bg-paper-sink"
            >
              See a live statement
            </Link>
          </div>
        </section>

        <div className="h-8" />
      </main>

      <Footer />
    </div>
  );
}
