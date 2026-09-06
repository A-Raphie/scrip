#!/usr/bin/env node
// Verify Weft's mainnet claims against Base mainnet public RPC.
// Usage: node scripts/verify-mainnet.mjs [claim-id]
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 3 }) });

const REGISTRY = [
  ["AAPLc", "0xb200000000000000000000C2e324d24d7eEcd1fb"],
  ["TSLAc", "0xb2000000000000000000001e800a7f5189430cD0"],
  ["NVDAc", "0xb20000000000000000000078ee7ce2fE4908108C"],
  ["COINc", "0xb200000000000000000000c85a31389D71F3ecfb"],
  ["GOOGLc", "0xb2000000000000000000002D0BA3164cc74f58B7"],
  ["MSFTc", "0xB200000000000000000000Ab99cFa739E253872B"],
  ["METAc", "0xb2000000000000000000008bC8786B856E61707C"],
  ["AMZNc", "0xb200000000000000000000d9192b6B456483C2E8"],
  ["MSTRc", "0xb2000000000000000000004884b426556b92883d"],
  ["CRCLc", "0xB20000000000000000000019f6E7C675b73C2e4D"],
  ["INTCc", "0xB2000000000000000000004AFF16039bA04bdFBc"],
  ["SNDKc", "0xb200000000000000000000397293Cb8cda9a10c5"],
  ["SPCXc", "0xb2000000000000000000007b9fcbd005511aCBd5"],
];
const abi = [
  { type: "function", name: "multiplier", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
];
const erc = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
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

await check("C09", "mainnet registry live: demo holder has a real AAPLc balance", async () => {
  const b = await client.readContract({
    address: "0xb200000000000000000000C2e324d24d7eEcd1fb",
    abi: erc,
    functionName: "balanceOf",
    args: ["0x68275200408371a3B34D36F1Ce058Cba2423F41F"],
  });
  return b > 0n;
});

await check("C11", "all 13 registry multipliers read exactly 1.0 (no corporate action has ever run)", async () => {
  const res = await client.multicall({
    contracts: REGISTRY.map(([_, addr]) => ({ address: addr, abi, functionName: "multiplier" })),
    allowFailure: false,
  });
  return res.every((m) => m === 1000000000000000000n);
});

await check("C09b", "every registry symbol resolves onchain", async () => {
  const res = await client.multicall({
    contracts: REGISTRY.map(([_, addr]) => ({ address: addr, abi, functionName: "symbol" })),
    allowFailure: true,
  });
  return res.every((r) => r.status === "success" && String(r.result).length > 2);
});

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} mainnet claims verified.`);
process.exit(passed === results.length ? 0 : 1);
