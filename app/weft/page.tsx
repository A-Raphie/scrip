"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUnits, type Address } from "viem";
import { base } from "viem/chains";
import { useWallet } from "@/components/wallet";
import Link from "next/link";
import { BackHome, Footer, Wordmark } from "@/components/chrome";

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address;

const INDEX_ADDRESS = (process.env.NEXT_PUBLIC_WEFT_INDEX ?? "") as Address;

const TICKER_META: Record<string, { label: string }> = {
  "0xb200000000000000000000C2e324d24d7eEcd1fb": { label: "Apple" },
  "0xb20000000000000000000078ee7ce2fE4908108C": { label: "NVIDIA" },
  "0xB200000000000000000000Ab99cFa739E253872B": { label: "Microsoft" },
  "0xb2000000000000000000001e800a7f5189430cD0": { label: "Tesla" },
};

type BasketLeg = { token: Address; weightBps: bigint; label: string };

const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ type: "address" }, { type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const indexAbi = [
  { type: "function", name: "basketLength", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokens", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "weightsBps", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalValueUsd", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "previewDeposit", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "deposit", stateMutability: "nonpayable", inputs: [{ type: "uint256" }, { type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }], outputs: [{ type: "uint256" }] },
] as const;

function fmtUsd18(v: bigint): string {
  const n = Number(v) / 1e18;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function WeftBasketPage() {
  const { address, connecting, connect, walletClient } = useWallet();
  const [legs, setLegs] = useState<BasketLeg[]>([]);
  const [symbol, setSymbol] = useState("");
  const [totalValue, setTotalValue] = useState<bigint | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [userShares, setUserShares] = useState<bigint | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [usdcAllowed, setUsdcAllowed] = useState(false);
  const [amount, setAmount] = useState("");
  const [redeemPct, setRedeemPct] = useState("100");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const hasIndex = INDEX_ADDRESS.startsWith("0x") && INDEX_ADDRESS.length === 42;

  const refresh = useCallback(async () => {
    if (!hasIndex) return;
    const { client } = await import("@/lib/b20");
    const idx = INDEX_ADDRESS as Address;
    const len = Number(await client.readContract({ address: idx, abi: indexAbi, functionName: "basketLength" }));
    const nextLegs: BasketLeg[] = [];
    for (let i = 0; i < len; i++) {
      const token = (await client.readContract({ address: idx, abi: indexAbi, functionName: "tokens", args: [BigInt(i)] })) as Address;
      const w = (await client.readContract({ address: idx, abi: indexAbi, functionName: "weightsBps", args: [BigInt(i)] })) as bigint;
      nextLegs.push({ token, weightBps: w, label: TICKER_META[token.toLowerCase()]?.label ?? token.slice(0, 8) });
    }
    setLegs(nextLegs);
    setSymbol(await client.readContract({ address: idx, abi: indexAbi, functionName: "symbol" }));
    setTotalValue((await client.readContract({ address: idx, abi: indexAbi, functionName: "totalValueUsd" })) as bigint);
    setTotalSupply((await client.readContract({ address: idx, abi: indexAbi, functionName: "totalSupply" })) as bigint);
    if (address) {
      setUserShares((await client.readContract({ address: idx, abi: indexAbi, functionName: "balanceOf", args: [address] })) as bigint);
      setUsdcBalance((await client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [address] })) as bigint);
      setUsdcBalance((await client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [address] })) as bigint);
    }
  }, [address, hasIndex]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  async function weave() {
    setErr(null);
    setMsg(null);
    const usdcIn = Math.floor(parseFloat(amount || "0") * 1e6);
    if (!usdcIn || usdcIn < 5) {
      setErr("Minimum first weave is $5.");
      return;
    }
    setBusy("weaving");
    try {
      const { client } = await import("@/lib/b20");
      const idx = INDEX_ADDRESS as Address;
      const allowed = (await client.readContract({ address: USDC, abi: erc20Abi, functionName: "allowance", args: [address!, idx] })) as bigint;
      if (allowed < BigInt(usdcIn)) {
        const hash = await walletClient!.writeContract({
          chain: base,
          address: USDC,
          abi: erc20Abi,
          functionName: "approve",
          args: [idx, BigInt(usdcIn) * 10n],
          account: address!,
        });
        await client.waitForTransactionReceipt({ hash });
      }
      const preview = ((await client.readContract({ address: idx, abi: indexAbi, functionName: "previewDeposit", args: [BigInt(usdcIn)] })) as bigint) ?? 0n;
      const minShares = (preview * 95n) / 100n;
      const hash = await walletClient!.writeContract({
        chain: base,
        address: idx,
        abi: indexAbi,
        functionName: "deposit",
        args: [BigInt(usdcIn), minShares],
        account: address!,
      });
      await client.waitForTransactionReceipt({ hash });
      setMsg(`Woven. ${usdcIn / 1e6} USDC into the basket.`);
      setAmount("");
      await refresh();
    } catch (e: any) {
      setErr(String(e?.shortMessage ?? e?.message ?? e).slice(0, 160));
    } finally {
      setBusy(null);
    }
  }

  async function unwind() {
    setErr(null);
    setMsg(null);
    if (!userShares || userShares === 0n) return;
    const pct = Math.min(100, Math.max(1, parseInt(redeemPct || "100", 10)));
    const shares = (userShares * BigInt(pct)) / 100n;
    setBusy("unweaving");
    try {
      const { client } = await import("@/lib/b20");
      const idx = INDEX_ADDRESS as Address;
      const supply = (await client.readContract({ address: idx, abi: indexAbi, functionName: "totalSupply" })) as bigint;
      const value = (await client.readContract({ address: idx, abi: indexAbi, functionName: "totalValueUsd" })) as bigint;
      const expectedUsd18 = (shares * value) / supply;
      const minUsdc = ((expectedUsd18 * 95n) / 100n) / 1_000_000_000_000n;
      const hash = await walletClient!.writeContract({
        chain: base,
        address: idx,
        abi: indexAbi,
        functionName: "redeem",
        args: [shares, minUsdc, 300n],
        account: address!,
      });
      await client.waitForTransactionReceipt({ hash });
      setMsg(`Unwoven. ${pct}% of your shares returned to USDC.`);
      await refresh();
    } catch (e: any) {
      setErr(String(e?.shortMessage ?? e?.message ?? e).slice(0, 160));
    } finally {
      setBusy(null);
    }
  }

  const positionValue =
    userShares && totalSupply && totalValue && totalSupply > 0n
      ? fmtUsd18((userShares * totalValue) / totalSupply)
      : null;

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

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">Onchain index fund</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">The Tech Basket</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          One token holding Apple, NVIDIA, Microsoft, and Tesla: the Coinbase
          tokenized stocks on Base. Weave USDC in, unwind back out, every step
          provable onchain.
        </p>

        {/* the proof run: executed onchain on Vibenet, open always */}
        <section className="ring-hairline mt-8 bg-paper-raise p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                Live now · Base Vibenet (testnet)
              </p>
              <h2 className="mt-1 font-display text-xl">The proof run</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                No dividend or split has ever run on the mainnet Coinbase
                registry, so Weft executed the full loop onchain where the B20
                precompiles are live today: weave 1,000 tUSDC, both dividends
                land, a 2-for-1 split lands, unwind returns 1,530. Every line
                links to its transaction.
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

        {/* mainnet rail: the measured pools the index is built for */}
        <section className="ring-hairline mt-4 bg-paper-raise p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
            Mainnet rail · Aerodrome Slipstream, measured Sep 6 2026
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["AAPLc / USDC", "$1.36M"],
              ["NVDAc / USDC", "$2.64M"],
              ["TSLAc / USDC", "$145K"],
              ["MSFTc / USDC", "$74K"],
            ].map(([pair, liq]) => (
              <div key={pair} className="ring-hairline bg-paper p-3">
                <p className="font-mono text-[11px] text-ink-mute">{pair}</p>
                <p className="mt-0.5 font-mono text-base text-ink">{liq}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">
            The same WeftIndex bytecode that ran the proof deploys against these
            pools on mainnet. The basket page lights up for wallet actions at
            mainnet deployment.
          </p>
        </section>

        {/* wallet section: reads live when NEXT_PUBLIC_WEFT_INDEX is set */}
        {(address && hasIndex) && (
          <>
            <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {legs.map((leg) => (
                <div key={leg.token} className="ring-hairline bg-paper-raise p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">
                    {leg.label}
                  </p>
                  <p className="mt-1 font-mono text-lg text-ink">
                    {Number(leg.weightBps) / 100}%
                  </p>
                </div>
              ))}
            </section>

            {/* fund line */}
            <section className="ring-hairline mt-4 flex flex-wrap items-center justify-between gap-3 bg-paper-raise px-4 py-3 text-sm">
              <span className="font-mono text-ink">
                Basket value: <strong>{totalValue !== null ? fmtUsd18(totalValue) : "..."}</strong>
              </span>
              <span className="font-mono text-xs text-ink-mute">
                {symbol} · prices are the Coinbase total-return oracle feeds
              </span>
            </section>

            {address && (
              <>
                {/* your position */}
                <section className="ring-hairline mt-4 flex flex-wrap items-center justify-between gap-3 bg-paper-raise px-4 py-3">
                  <span className="text-sm text-ink-soft">Your position</span>
                  <span className="font-mono text-sm text-ink">
                    {userShares !== null && totalSupply && totalValue
                      ? `${(Number(userShares) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 4 })} shares · ${positionValue ?? ""}`
                      : "..."}
                  </span>
                </section>

                {/* actions */}
                <section className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="ring-hairline bg-paper-raise p-5">
                    <h2 className="font-display text-lg">Weave in</h2>
                    <p className="mt-1 text-[13px] text-ink-mute">USDC in, basket shares out.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        inputMode="decimal"
                        placeholder="100"
                        className="ring-hairline w-full bg-paper px-3 py-2 font-mono text-sm text-ink focus:outline-none"
                      />
                      <span className="font-mono text-xs text-ink-mute">USDC</span>
                    </div>
                    {usdcBalance !== null && (
                      <button
                        onClick={() => setAmount(String(Number(usdcBalance) / 1e6))}
                        className="mt-2 font-mono text-[11px] text-ink-mute hover:text-ink"
                      >
                        balance: {(Number(usdcBalance) / 1e6).toLocaleString("en-US")} USDC
                      </button>
                    )}
                    <button
                      onClick={weave}
                      disabled={busy !== null || !amount}
                      className="mt-3 w-full bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-50"
                    >
                      {busy === "weaving" ? "Weaving..." : "Weave USDC in"}
                    </button>
                  </div>

                  <div className="ring-hairline bg-paper-raise p-5">
                    <h2 className="font-display text-lg">Unwind out</h2>
                    <p className="mt-1 text-[13px] text-ink-mute">Shares back to USDC, pro-rata.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={redeemPct}
                        onChange={(e) => setRedeemPct(e.target.value)}
                        inputMode="numeric"
                        className="ring-hairline w-full bg-paper px-3 py-2 font-mono text-sm text-ink focus:outline-none"
                      />
                      <span className="font-mono text-xs text-ink-mute">% of shares</span>
                    </div>
                    <button
                      onClick={unwind}
                      disabled={busy !== null || !userShares || userShares === 0n}
                      className="ring-hairline mt-3 w-full bg-paper-sink py-2.5 text-sm font-medium text-ink hover:bg-line-soft disabled:opacity-50"
                    >
                      {busy === "unweaving" ? "Unweaving..." : "Unwind to USDC"}
                    </button>
                  </div>
                </section>

                {msg && <p className="mt-4 text-sm text-ink-soft">{msg}</p>}
                {err && <p className="mt-4 text-sm text-ink">{err}</p>}

                <section className="mt-8 border-t border-line-soft pt-4">
                  <ul className="space-y-1.5 text-[13px] leading-relaxed text-ink-mute">
                    <li>
                      · The basket reads B20 multipliers directly: dividends and
                      splits accrue to share holders without breaking weights.
                    </li>
                    <li>
                      · Weights are fixed at creation; value weights drift with
                      prices between deposits, like any index.
                    </li>
                    <li>
                      · The contract has no owner and no upgrade path. Unaudited
                      solo build: interact with amounts you are comfortable with.
                    </li>
                    <li>
                      · Tokenized stocks are available to eligible non-US users
                      only. This interface displays public chain data.
                    </li>
                  </ul>
                </section>
              </>
            )}

            <p className="mt-6 text-sm text-ink-mute">
              Wallet actions land with the mainnet deployment. Until then, the
              proof run above is fully live.
            </p>
          </>
        )}

        <div className="h-20" />
      </main>

      <Footer />
    </div>
  );
}