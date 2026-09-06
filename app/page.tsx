import Link from "next/link";
import { readLivePrices } from "@/lib/feeds";
import { TaglineReveal } from "@/components/tagline-reveal";
import { Reveal } from "@/components/reveal";
import { PriceMarquee } from "@/components/price-marquee";
import { BasketSpecimen } from "@/components/basket-specimen";
import { Footer } from "@/components/chrome";

// the demo address: a real AAPLc holder on Base mainnet, verified Sep 5 2026
const DEMO_ADDRESS = "0x68275200408371a3B34D36F1Ce058Cba2423F41F";

export const revalidate = 120;

export default async function Home() {
  const prices = await readLivePrices().catch(() => []);
  const withPrice = prices.filter((p) => p.price !== null && !p.stale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6">
        <span className="font-display text-2xl tracking-tight">Weft</span>
        <span className="hidden font-mono text-xs tracking-[0.14em] text-ink-mute sm:block">
          AN INDEX FUND OF TOKENIZED STOCKS
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5">
        {/* HERO: copy left, live product surface right */}
        <section className="grid items-center gap-12 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="max-w-xl font-display text-6xl leading-[1.02] tracking-tight text-ink sm:text-7xl">
              One token, woven from{" "}
              <span className="bg-gradient-to-r from-ink to-ink-soft bg-clip-text text-transparent">
                real stocks.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              Coinbase puts Apple, NVIDIA, Microsoft, and Tesla on Base as
              tokens. Weft turns USDC into a single self-custodial basket of
              them, and prints the paperwork nobody else does.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/weft"
                className="bg-ink px-6 py-3.5 text-base font-semibold text-paper transition-transform duration-200 hover:bg-ink-soft active:translate-y-px"
              >
                Weave your basket
              </Link>
              <Link
                href={`/s/${DEMO_ADDRESS}`}
                className="ring-hairline bg-paper-raise px-6 py-3.5 text-base font-medium text-ink transition-colors hover:bg-paper-sink"
              >
                See a live statement
              </Link>
            </div>
            <p className="mt-3 text-sm text-ink-mute">
              Read-only until you sign. Tokenized stocks are available to
              eligible non-US users only.
            </p>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <BasketSpecimen prices={prices} />
          </div>
        </section>

        {/* LIVE MARQUEE */}
        <div className="mt-12">
          <PriceMarquee rows={prices} />
        </div>

        {/* THE SITUATION */}
        <Reveal className="mt-24">
          <section>
            <h2 className="max-w-2xl font-display text-3xl leading-snug tracking-tight sm:text-4xl">
              Buying the stocks is easy. Everything after that is missing.
            </h2>
            <div className="mt-6 grid max-w-4xl gap-6 text-[17px] leading-relaxed text-ink-soft sm:grid-cols-2">
              <p>
                Buy a tokenized stock and you receive a number in your wallet.
                No statement. No cost basis. No dividend notice. Nothing you
                could show an accountant, a friend, or yourself six months from
                now.
              </p>
              <p>
                And dividends here work strangely: no cash ever arrives. The
                issuer raises a hidden onchain number, and your tokens quietly
                become more shares. Most holders never see it happen.{" "}
                <span className="text-ink">Weft is the layer that was missing.</span>
              </p>
            </div>
          </section>
        </Reveal>

        {/* TAGLINE REVEAL */}
        <section className="py-28">
          <TaglineReveal text="Your stocks, woven into one holding. Dividends land. Weights hold. The chain does the paperwork." />
        </section>

        {/* WHAT IT DOES */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="ring-hairline flex h-full flex-col bg-paper-raise p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                01 · Statements
              </p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">
                Paste an address. Get the paperwork.
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                Every buy, sell, dividend, split, and company notice for any
                address, dated and organized like a real brokerage statement.
                Each line carries a proof link to its own transaction.
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
          </Reveal>
          <Reveal delay={120}>
            <div className="ring-hairline flex h-full flex-col bg-paper-raise p-6 transition-transform duration-200 hover:-translate-y-0.5">
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
          </Reveal>
        </section>

        {/* HOW IT WORKS */}
        <Reveal className="mt-24">
          <section>
            <h2 className="font-display text-3xl tracking-tight">How it works</h2>
            <ol className="mt-8 grid gap-8 sm:grid-cols-3">
              <li className="border-t-2 border-ink pt-4">
                <span className="font-mono text-xs text-ink-mute">01</span>
                <p className="mt-2 text-base font-semibold text-ink">Weave USDC in</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  One transaction swaps your deposit across the weights and
                  mints index shares. Minimum $5.
                </p>
              </li>
              <li className="border-t-2 border-line pt-4">
                <span className="font-mono text-xs text-ink-mute">02</span>
                <p className="mt-2 text-base font-semibold text-ink">Hold one token</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  The basket holds the stock tokens directly. Dividends and
                  splits flow through the onchain multiplier automatically.
                </p>
              </li>
              <li className="border-t-2 border-line pt-4">
                <span className="font-mono text-xs text-ink-mute">03</span>
                <p className="mt-2 text-base font-semibold text-ink">Unwind anytime</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Shares burn, USDC returns, pro-rata. Your statement and
                  certificate update themselves.
                </p>
              </li>
            </ol>
          </section>
        </Reveal>

        {/* PROOF RUN */}
        <Reveal className="mt-24">
          <section className="ring-hairline bg-paper-raise p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                  Proven onchain · Base Vibenet testnet
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  $1,000 in. $1,530 out. Here is the whole story.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                  A dividend lands: $1,000 becomes $1,020. A 2-for-1 split
                  lands: $1,530. Unwound to USDC. Every step is a real
                  transaction on Base Vibenet, where the same B20 precompiles as
                  mainnet run today, and every claim re-verifies by script.
                </p>
              </div>
              <Link
                href="/weft/proof"
                className="shrink-0 bg-ink px-5 py-3 text-sm font-medium text-paper transition-transform hover:bg-ink-soft active:translate-y-px"
              >
                See the proof run
              </Link>
            </div>
          </section>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mt-24">
          <section>
            <h2 className="font-display text-3xl tracking-tight">Questions</h2>
            <div className="mt-8 grid max-w-4xl gap-x-12 gap-y-6 sm:grid-cols-2">
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
                [
                  "What is the minimum?",
                  "The first weave is $5. After that, any amount above $1.",
                ],
              ].map(([q, a]) => (
                <div key={q} className="border-t border-line pt-4">
                  <p className="text-base font-semibold text-ink">{q}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* FINAL CTA */}
        <section className="py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Your stocks, woven into one token.
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/weft"
              className="bg-ink px-7 py-4 text-base font-semibold text-paper transition-transform hover:bg-ink-soft active:translate-y-px"
            >
              Weave your basket
            </Link>
            <Link
              href={`/s/${DEMO_ADDRESS}`}
              className="ring-hairline bg-paper-raise px-7 py-4 text-base font-medium text-ink transition-colors hover:bg-paper-sink"
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
