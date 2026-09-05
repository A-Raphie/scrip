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
          STATEMENTS FOR TOKENIZED STOCKS
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5">
        <section className="pt-16 sm:pt-24">
          <h1 className="max-w-2xl font-display text-4xl leading-[1.08] tracking-tight sm:text-[3.4rem]">
            The paperwork your tokenized stocks never came with.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Coinbase puts real stocks on Base as tokens. What it does not give you
            is the paperwork. Paste any address and Scrip prints the statement:
            every trade, dividend, split, and issuer notice, each line backed by
            its transaction.
          </p>

          <div className="mt-8 max-w-xl">
            <AddressForm />
            <p className="mt-3 text-sm text-ink-mute">
              Read-only. Nothing signs, nothing moves.{" "}
              <Link className="proof-link underline decoration-line" href={`/s/${DEMO_ADDRESS}`}>
                See a live statement
              </Link>
            </p>
          </div>
        </section>

        <section className="mt-16 ring-hairline bg-paper-raise p-6">
          <h2 className="font-display text-xl">How the statement is made</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            <li>
              <span className="font-mono text-xs text-ink-mute">01</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                You paste any Base address. No wallet connection, no signature.
              </p>
            </li>
            <li>
              <span className="font-mono text-xs text-ink-mute">02</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                Scrip reads the Coinbase stock registry: balances, trade history,
                and the corporate actions the issuer writes onchain.
              </p>
            </li>
            <li>
              <span className="font-mono text-xs text-ink-mute">03</span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                You get a brokerage-grade statement. Every line carries its
                transaction, so every number can be checked.
              </p>
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
            Reads the full Coinbase tokenized stock registry on Base
          </h2>
          <div className="ring-hairline mt-3 bg-paper-raise px-4 py-3">
            <TickerStrip />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-mute">
            Dividends on tokenized stocks are not paid in cash. The issuer raises
            a multiplier onchain instead: your tokens quietly become more shares.
            Scrip is the only place that turns those multiplier events back into
            the dividend lines a real statement would show you.
          </p>
        </section>

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}
