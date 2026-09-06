import Link from "next/link";
import { readLivePrices } from "@/lib/feeds";
import { TaglineReveal } from "@/components/tagline-reveal";
import { Reveal } from "@/components/reveal";
import { PriceMarquee } from "@/components/price-marquee";
import { BasketSpecimen } from "@/components/basket-specimen";
import { StatusStrip } from "@/components/status-strip";
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

      <div className="mx-auto mt-3 w-full max-w-6xl px-5">
        <StatusStrip
          items={[
            { label: "Live", tone: "live" },
            { label: "Base Mainnet" },
            { label: "13 Registry Tokens" },
            { label: "Non-Custodial" },
            { label: "No Fees" },
          ]}
        />
      </div>

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

        {/* DESK CATALOG */}
        <Reveal className="mt-16">
          <section>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              05 / The registry desk
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">
              Thirteen stocks. One chain.
            </h2>
            <div className="ring-hairline mt-6 overflow-x-auto bg-paper-raise">
              <table className="tnum w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-left font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                    <th className="px-4 py-3 font-medium">Token</th>
                    <th className="px-4 py-3 font-medium">Issuer</th>
                    <th className="px-4 py-3 text-right font-medium">Oracle price</th>
                    <th className="px-4 py-3 text-right font-medium">Feed</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px]">
                  {prices.map((p) => (
                    <tr key={p.symbol} className="border-b border-line-soft/60 last:border-b-0">
                      <td className="px-4 py-2.5 text-ink">{p.symbol}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{p.name}</td>
                      <td className="px-4 py-2.5 text-right text-ink">
                        {p.price !== null && !p.stale
                          ? `$${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "stale"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#2EBD85]">
                        {p.price !== null && !p.stale ? "live" : "held"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
              Feeds run 24/5 and hold their last close over weekends and
              corporate actions; Weft refuses valuations when a feed goes stale
              rather than guessing.
            </p>
          </section>
        </Reveal>

        {/* THE SITUATION */}
        <Reveal className="mt-24">
          <section>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              01 / The situation
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-snug tracking-tight sm:text-4xl">
              Buying the stocks is easy. Everything after that is missing.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="ring-hairline bg-paper-raise p-5">
                <p className="tnum font-mono text-4xl text-ink">$0</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  cash dividends ever received by mainnet holders. Dividends
                  move through the multiplier, invisible without tooling.
                </p>
              </div>
              <div className="ring-hairline bg-paper-raise p-5">
                <p className="tnum font-mono text-4xl text-ink">x1.00</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  every registry multiplier, frozen since launch. The corporate
                  action machinery is live and waiting.
                </p>
              </div>
              <div className="ring-hairline bg-paper-raise p-5">
                <p className="tnum font-mono text-4xl text-ink">0</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  brokerage statements exist for these holders. Weft generated
                  76 lines for one address in seconds.
                </p>
              </div>
            </div>
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
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              02 / Mechanism
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">How it works</h2>
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
            <p className="ring-hairline mt-8 overflow-x-auto bg-paper-sink/60 px-4 py-3 font-mono text-[12px] text-ink-soft">
              USDC → weave → wTECH (holds the stock tokens) → dividend →
              split → unwind → USDC
            </p>
          </section>
        </Reveal>

        {/* CAN / CANNOT */}
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

        {/* CAN / CANNOT */}
        <Reveal className="mt-24">
          <section>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              03 / Boundary
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">What Weft does and does not do</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="ring-hairline bg-paper-raise p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#2EBD85]">Does</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                  <li className="flex gap-2"><span className="font-mono text-[#2EBD85]">✓</span>Print a full statement for any address, every line backed by its transaction</li>
                  <li className="flex gap-2"><span className="font-mono text-[#2EBD85]">✓</span>Weave USDC into a self-custodial basket of the four deepest stock pools</li>
                  <li className="flex gap-2"><span className="font-mono text-[#2EBD85]">✓</span>Render dividends and splits from the onchain multiplier, with issuer announcements attached</li>
                  <li className="flex gap-2"><span className="font-mono text-[#2EBD85]">✓</span>Re-verify every claim from public RPC, trusting nothing we host</li>
                </ul>
              </div>
              <div className="ring-hairline bg-paper-raise p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">Does not</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-mute">
                  <li className="flex gap-2"><span className="font-mono">✗</span>Enable trading for US users: tokenized stocks are non-US only</li>
                  <li className="flex gap-2"><span className="font-mono">✗</span>Custody your funds, hold keys, or take fees: the contract has no owner</li>
                  <li className="flex gap-2"><span className="font-mono">✗</span>Pay cash dividends: B20 reinvests them as shares by design, and Weft renders that</li>
                  <li className="flex gap-2"><span className="font-mono">✗</span>Come audited: solo hackathon build, disclosed everywhere it matters</li>
                </ul>
              </div>
            </div>
          </section>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mt-24">
          <section>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
              04 / Questions
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">Questions</h2>
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
