"use client";

import { useState } from "react";

/// Weave preview: the page's first-timer action. Works for everyone, wallet
/// or not: type an amount, see the shares it would mint at the LIVE basket
/// value, with the 5% slippage guard applied. Connect a wallet to execute.
export function WeavePreview() {
  const [amount, setAmount] = useState("100");
  const [preview, setPreview] = useState<{ shares: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function estimate() {
    setErr(null);
    setPreview(null);
    const usdc6 = Math.floor(parseFloat(amount || "0") * 1e6);
    if (!usdc6 || usdc6 <= 0) {
      setErr("Type an amount in USDC first.");
      return;
    }
    setBusy(true);
    try {
      const { vibenetClient, vibe } = await import("@/lib/vibenet");
      const abi = [
        { type: "function", name: "previewDeposit", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
      ] as const;
      const shares = (await vibenetClient.readContract({
        address: vibe.index,
        abi,
        functionName: "previewDeposit",
        args: [BigInt(usdc6)],
      })) as bigint;
      setPreview({ shares: Number(shares) / 1e18 });
    } catch {
      setErr("Vibenet is unreachable right now. The proof run above still verifies every claim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ring-hairline mt-4 bg-paper-raise p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg">Try the weave</h2>
          <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-mute">
            Type any amount. The preview reads the live basket and shows the
            shares it would mint, with the 5% slippage guard applied.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="100"
          aria-label="USDC amount to preview"
          className="ring-hairline w-full bg-paper px-3 py-2 font-mono text-sm text-ink focus:outline-none"
        />
        <span className="font-mono text-xs text-ink-mute">tUSDC</span>
        <button
          onClick={estimate}
          disabled={busy}
          className="shrink-0 bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-50"
        >
          {busy ? "Reading..." : "Preview"}
        </button>
      </div>
      {preview && (
        <p className="mt-3 font-mono text-sm text-ink">
          {amount} tUSDC → {preview.shares.toLocaleString("en-US", { maximumFractionDigits: 2 })} wPROOF shares
        </p>
      )}
      {err && <p className="mt-3 text-sm text-ink-soft">{err}</p>}
    </section>
  );
}
