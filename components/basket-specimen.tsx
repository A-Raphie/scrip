import Link from "next/link";
import type { LiveTicker } from "@/lib/feeds";

const BASKET = [
  { symbol: "AAPLc", weight: "35%", name: "Apple" },
  { symbol: "NVDAc", weight: "35%", name: "NVIDIA" },
  { symbol: "MSFTc", weight: "15%", name: "Microsoft" },
  { symbol: "TSLAc", weight: "15%", name: "Tesla" },
];

/// The product on the hero surface: the Tech Basket rendered as a live
/// specimen, priced from the Coinbase total-return oracle feeds.
export function BasketSpecimen({ prices }: { prices: LiveTicker[] }) {
  const bySymbol = new Map(prices.map((p) => [p.symbol, p]));
  const legs = BASKET.map((b) => ({ ...b, price: bySymbol.get(b.symbol)?.price ?? null }));

  return (
    <div className="cert-border relative bg-paper-raise p-6 sm:p-7">
      {/* specimen stamp */}
      <div className="absolute right-4 top-4 rotate-6 border border-ink/40 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-mute">
        Specimen
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
        Weft · The Tech Basket
      </p>
      <h3 className="mt-2 font-display text-2xl tracking-tight">
        wTECH
        <span className="ml-2 align-middle font-mono text-xs font-normal text-ink-mute">
          index token
        </span>
      </h3>

      <div className="mt-5 space-y-0">
        {legs.map((leg, i) => (
          <div
            key={leg.symbol}
            className={`flex items-baseline justify-between gap-3 py-2.5 ${
              i < legs.length - 1 ? "border-b border-line-soft" : ""
            }`}
          >
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[13px] font-semibold text-ink">{leg.symbol}</span>
              <span className="text-xs text-ink-mute">{leg.name}</span>
            </span>
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-[13px] text-ink-mute">{leg.weight}</span>
              <span className="w-20 text-right font-mono text-[13px] text-ink">
                {leg.price !== null
                  ? `$${leg.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-xs text-ink-mute">
          Prices: Coinbase total-return oracle feeds
        </span>
        <Link href="/weft" className="proof-link font-mono text-[11px]">
          weave in
        </Link>
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-mute/80">
        Dividends and splits flow through the B20 multiplier. Proven onchain:
        see the proof run.
      </p>
    </div>
  );
}
