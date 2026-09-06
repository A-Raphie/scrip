import { AddressForm } from "@/components/address-form";
import { Footer, TickerStrip, Wordmark } from "@/components/chrome";
import Link from "next/link";

// the demo address: a real AAPLc holder on Base mainnet, verified Sep 5 2026
const DEMO_ADDRESS = "0x68275200408371a3B34D36F1Ce058Cba2423F41F";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-7">
        <Wordmark />
        <span className="font-mono text-xs tracking-[0.14em] text-ink-mute">
          AN INDEX FUND OF TOKENIZED STOCKS
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <section className="pt-16 sm:pt-24">
          <h1 className="max-w-2xl font-display text-4xl leading-[1.08] tracking-tight sm:text-[3.4rem]">
            One token, woven from real stocks.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Coinbase puts Apple, NVIDIA, Microsoft, and Tesla on Base as tokens.
            Weft weaves them into a single self-custodial index token: weave
            USDC in, unwind back out, dividends handled, every step provable
            onchain.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/weft"
              className="bg-ink px-6 py-3.5 text-base font-medium text-paper hover:bg-ink-soft"
            >
              Open the basket
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

        <section className="mt-16 ring-hairline bg-paper-raise p-6">
          <h2 className="font-display text-xl">How Weft works</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            <li>
              <span className="font-mono text-xs text-ink-mute">01</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                Weave USDC in. It swaps across the basket weights in one
                transaction, and you receive index shares.
              </p>
            </li>
            <li>
              <span className="font-mono text-xs text-ink-mute">02</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                The basket holds the stock tokens directly: self-custodial, no
                manager, no fees, no keys.
              </p>
            </li>
            <li>
              <span className="font-mono text-xs text-ink-mute">03</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                Unwind any time: shares burn and USDC comes back, pro-rata. Your
                statement and certificate update themselves.
              </p>
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
            Woven from the Coinbase tokenized stock registry on Base
          </h2>
          <div className="ring-hairline mt-3 bg-paper-raise px-4 py-3">
            <TickerStrip />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">
            The weave is built for how these tokens actually work. Tokenized
            stock dividends are not paid in cash: the issuer raises an onchain
            multiplier and your tokens quietly become more shares. Weft reads
            that multiplier directly, so dividends accrue to holders without
            breaking the basket weights. The first dividend Coinbase runs will
            prove it onchain.
          </p>
        </section>

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}
