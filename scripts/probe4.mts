import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 3 }) });

const TOKENS: [string, `0x${string}`][] = [
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

const assetAbi = [{
  type: "function",
  name: "multiplier",
  stateMutability: "view",
  inputs: [],
  outputs: [{ type: "uint256" }],
}] as const;

const res = await client.multicall({
  contracts: TOKENS.map(([_, addr]) => ({ address: addr, abi: assetAbi, functionName: "multiplier" })) as any,
  allowFailure: true,
});

for (let i = 0; i < TOKENS.length; i++) {
  const r = res[i];
  if (r.status === "success") {
    console.log(TOKENS[i][0], "multiplier:", (Number(r.result) / 1e18).toFixed(6));
  } else {
    console.log(TOKENS[i][0], "multiplier: READ FAIL");
  }
}
