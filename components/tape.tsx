"use client";

import { useState } from "react";
import type { StatementRow } from "@/lib/format";
import { fmtDate } from "@/lib/format";

const KIND_LABEL: Record<StatementRow["kind"], string> = {
  ISSUED: "ISSUED",
  ACQUIRED: "BOUGHT",
  DELIVERED: "SOLD",
  REDEEMED: "REDEEMED",
  DIVIDEND: "DIVIDEND",
  SPLIT: "SPLIT",
  NOTICE: "NOTICE",
};

function Row({ row, index }: { row: StatementRow; index: number }) {
  const delay = Math.min(index * 320, 16_000);
  return (
    <div
      className="tape-row flex items-baseline gap-3 border-b border-line-soft/70 px-3 py-2"
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className="w-[4.7rem] shrink-0 whitespace-nowrap font-mono text-[11px] tracking-[0.02em] text-ink-mute">
        {fmtDate(row.at)}
      </span>
      <span
        className={`w-[4.5rem] shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${
          row.kind === "DIVIDEND" || row.kind === "SPLIT" || row.kind === "NOTICE"
            ? "text-ink"
            : "text-ink-mute"
        }`}
      >
        {KIND_LABEL[row.kind]}
      </span>
      <span className="min-w-0 flex-1 text-sm text-ink">
        <span className="font-mono text-[13px]">{row.headline}</span>
        {row.detail && (
          <span className="block text-[13px] leading-snug text-ink-mute">{row.detail}</span>
        )}
      </span>
      <a
        href={row.proofUrl}
        target="_blank"
        rel="noreferrer"
        className="proof-link shrink-0 font-mono text-[11px]"
        aria-label={`Transaction proof for ${row.headline}`}
      >
        proof
      </a>
    </div>
  );
}

export function Tape({ rows }: { rows: StatementRow[] }) {
  const [skipped, setSkipped] = useState(false);
  const chronological = [...rows].reverse();

  return (
    <div>
      <div
        className={`ring-hairline relative bg-paper-raise ${skipped ? "tape-skip" : ""}`}
      >
        {/* tape feed edge: perforation dots down the left margin */}
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
          {chronological.map((row, i) => (
            <Row key={`${row.txHash}-${i}`} row={row} index={i} />
          ))}
        </div>
      </div>
      {!skipped && chronological.length > 3 && (
        <button
          onClick={() => setSkipped(true)}
          className="mt-2 font-mono text-xs text-ink-mute hover:text-ink"
        >
          skip the print
        </button>
      )}
    </div>
  );
}
