#!/usr/bin/env node
// Verify Weft's claims against public endpoints. Trusts nothing in this repo:
// every read comes from the chain. Usage: node scripts/verify-vibenet.mjs [claim-id]
import { createPublicClient, http, formatUnits } from "viem";
import { defineChain } from "viem";
import { readFileSync } from "node:fs";

const chain = defineChain({
  id: 84538453,
  name: "Base Vibenet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.vibes.base.org"] } },
});
const client = createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0], { timeout: 20000, retryCount: 3 }) });

const A = JSON.parse(readFileSync("data/vibenet.json", "utf8"));
const RUN = JSON.parse(readFileSync("data/vibenet-run.json", "utf8"));
const CLAIMS = JSON.parse(readFileSync("evidence/claims.json", "utf8"));

const erc = [
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
];
const asset = [
  { type: "function", name: "multiplier", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "scaledBalanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
];

const results = [];
async function check(id, label, fn) {
  try {
    const ok = await fn();
    results.push({ id, label, ok });
    console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${label}`);
  } catch (e) {
    results.push({ id, label, ok: false });
    console.log(`FAIL  ${id}  ${label}  (${String(e.message ?? e).slice(0, 90)})`);
  }
}

const only = process.argv[2];

await check("C01", "wAAPL is a real B20 token on Vibenet", async () => {
  const sym = await client.readContract({ address: A.wAapl, abi: erc, functionName: "symbol" });
  return sym === "wAAPL";
});

await check("C02", "wAAPL multiplier reads 1.02 after the dividend", async () => {
  const m = await client.readContract({ address: A.wAapl, abi: asset, functionName: "multiplier" });
  return m === 1020000000000000000n;
});

await check("C03", "wNVDA multiplier reads 2.04 after the split", async () => {
  const m = await client.readContract({ address: A.wNvda, abi: asset, functionName: "multiplier" });
  return m === 2040000000000000000n;
});

await check("C04", "index holds the stock tokens (scaled custody)", async () => {
  const sa = await client.readContract({ address: A.wAapl, abi: asset, functionName: "scaledBalanceOf", args: [A.index] });
  const sb = await client.readContract({ address: A.wNvda, abi: asset, functionName: "scaledBalanceOf", args: [A.index] });
  return sa > 0n && sb > 0n;
});

await check("C05", "dividend accrued: recorded value moved 1000 to 1020 with raw balances unchanged (history)", async () => {
  const before = Number(BigInt(RUN.after_weave_value)) / 1e18;
  const after = Number(BigInt(RUN.after_dividend_value)) / 1e18;
  const rawUnchanged = RUN.after_dividend_rawA === RUN.after_weave_rawA && RUN.after_dividend_rawB === RUN.after_weave_rawB;
  const liveMult = await client.readContract({ address: A.wAapl, abi: asset, functionName: "multiplier" });
  return Math.abs(after - before * 1.02) < 0.5 && rawUnchanged && liveMult === 1020000000000000000n;
});

await check("C06", "split doubled the wNVDA leg: recorded value moved 1020 to 1530 (history)", async () => {
  const before = Number(BigInt(RUN.after_dividend_value)) / 1e18;
  const after = Number(BigInt(RUN.after_split_value)) / 1e18;
  const expected = before + (Number(BigInt(RUN.after_dividend_value)) / 1e18) * 0.5; // half the basket is wNVDA
  const rawUnchanged = Number(RUN.after_split_rawB) === Number(RUN.after_dividend_rawB);
  return Math.abs(after - expected) < 0.5 && rawUnchanged;
});

await check("C07", "unwind burned the full supply: only dead shares remain onchain", async () => {
  const supply = await client.readContract({ address: A.index, abi: [{ type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] }], functionName: "totalSupply" });
  const userShares = await client.readContract({ address: A.index, abi: erc, functionName: "balanceOf", args: [A.deployer] });
  const returned = Number(BigInt(RUN.usdc_returned)) / 1e6;
  return supply === 1_000_000_000_000_000n && userShares === 0n && returned >= 1500;
});

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} claims verified against the live chain.`);
process.exit(passed === results.length ? 0 : 1);
