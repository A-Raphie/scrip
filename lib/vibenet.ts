import { createPublicClient, http, type Abi } from "viem";
import { defineChain } from "viem";

// Base Vibenet: Base's experimental preview network where the B20 precompiles
// (and therefore corporate actions) can actually run today.
export const vibenet = defineChain({
  id: 84_538_453,
  name: "Base Vibenet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.vibes.base.org"] } },
  blockExplorers: {
    default: { name: "Vibenet Explorer", url: "https://chain.base.org/vibenet" },
  },
  testnet: true,
});

export const vibenetClient = createPublicClient({
  chain: vibenet,
  transport: http("https://rpc.vibes.base.org", { timeout: 20_000 }),
});

export const vibenetTx = (hash: string) => `https://chain.base.org/vibenet/tx/${hash}`;

const ib20Abi = [
  { type: "function", name: "multiplier", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "scaledBalanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const satisfies Abi;

const indexAbi = [
  { type: "function", name: "totalValueUsd", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const satisfies Abi;

export type VibeAddresses = {
  wAapl: `0x${string}`;
  wNvda: `0x${string}`;
  index: `0x${string}`;
  poolA: `0x${string}`;
  poolB: `0x${string}`;
  tusdc: `0x${string}`;
};

import addresses from "../data/vibenet.json";

export const vibe: VibeAddresses = {
  wAapl: (addresses as any).wAapl,
  wNvda: (addresses as any).wNvda,
  index: (addresses as any).index,
  poolA: (addresses as any).poolA,
  poolB: (addresses as any).poolB,
  tusdc: (addresses as any).tusdc,
};

export async function readLiveVibeState() {
  try {
    const [multA, multB, scaledA, scaledB, value, supply, symbol] = await Promise.all([
      vibenetClient.readContract({ address: vibe.wAapl, abi: ib20Abi, functionName: "multiplier" }),
      vibenetClient.readContract({ address: vibe.wNvda, abi: ib20Abi, functionName: "multiplier" }),
      vibenetClient.readContract({ address: vibe.wAapl, abi: ib20Abi, functionName: "scaledBalanceOf", args: [vibe.index] }),
      vibenetClient.readContract({ address: vibe.wNvda, abi: ib20Abi, functionName: "scaledBalanceOf", args: [vibe.index] }),
      vibenetClient.readContract({ address: vibe.index, abi: indexAbi, functionName: "totalValueUsd" }),
      vibenetClient.readContract({ address: vibe.index, abi: indexAbi, functionName: "totalSupply" }),
      vibenetClient.readContract({ address: vibe.index, abi: indexAbi, functionName: "symbol" }),
    ]);
    return {
      ok: true as const,
      multA: Number(multA) / 1e18,
      multB: Number(multB) / 1e18,
      scaledA: Number(scaledA) / 1e8,
      scaledB: Number(scaledB) / 1e8,
      value: Number(value) / 1e18,
      supply: Number(supply) / 1e18,
      symbol,
    };
  } catch {
    return { ok: false as const };
  }
}
