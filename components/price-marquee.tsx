"use client";

import { useEffect, useRef, useState } from "react";

type Row = { symbol: string; price: number | null; stale: boolean };

/// Continuous price marquee: the registry, alive. Seamless loop via a
/// duplicated track; pauses on hover; prefers-reduced-motion honored.
export function PriceMarquee({ rows }: { rows: Row[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaused(true);
    }
  }, []);

  const track = [...rows, ...rows];

  return (
    <div
      className="ring-hairline relative overflow-hidden bg-paper-raise py-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Live registry prices from the Coinbase oracle feeds"
    >
      {/* edge fades */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper to-transparent" />
      <div
        ref={ref}
        className="flex w-max items-baseline gap-8 px-4 font-mono text-[13px]"
        style={{
          animation: paused ? "none" : "marquee 48s linear infinite",
        }}
      >
        {track.map((r, i) => (
          <span key={i} className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-ink">{r.symbol}</span>
            {r.price !== null && !r.stale ? (
              <span className="text-ink-mute">
                ${r.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-ink-mute/60">—</span>
            )}
            <span className="text-line">·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
