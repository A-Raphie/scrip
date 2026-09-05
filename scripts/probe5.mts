import { createPublicClient, http, decodeEventLog, type Abi } from "viem";
import { base } from "viem/chains";
import { keccak256, toBytes } from "viem";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 5 }) });
const FACTORY = "0xB20f000000000000000000000000000000000000";
const topic = keccak256(toBytes("B20Created(address,uint8,string,string,uint8,bytes)"));
console.log("topic:", topic);

const abi = [{
  type: "event",
  name: "B20Created",
  inputs: [
    { name: "token", type: "address", indexed: true },
    { name: "variant", type: "uint8", indexed: true },
    { name: "name", type: "string", indexed: false },
    { name: "symbol", type: "string", indexed: false },
    { name: "decimals", type: "uint8", indexed: false },
    { name: "variantEventParams", type: "bytes", indexed: false },
  ],
}] as const satisfies Abi;

const head = await client.getBlockNumber();
const START = head - 8_000_000n;
const W = 9_500n;
const all: any[] = [];
let from = START;
while (from < head) {
  const to = from + W > head ? head : from + W;
  try {
    const logs = await client.getLogs({
      address: FACTORY,
      event: abi,
      fromBlock: from,
      toBlock: to,
    });
    all.push(...logs);
  } catch (e: any) {
    // halve
    const mid = from + (to - from) / 2n;
    try {
      const a = await client.getLogs({ address: FACTORY, event: abi, fromBlock: from, toBlock: mid });
      const b = await client.getLogs({ address: FACTORY, event: abi, fromBlock: mid + 1n, toBlock: to });
      all.push(...a, ...b);
    } catch { /* skip window */ }
  }
  from = to;
}
console.log("B20Created events in window:", all.length);
const seen = new Set<string>();
for (const l of all) {
  try {
    const { args } = decodeEventLog({ abi, data: l.data, topics: l.topics });
    const a = args as any;
    const key = (a.token as string).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    console.log(`block ${l.blockNumber}: ${a.symbol} - ${a.name} variant=${a.variant} dec=${a.decimals} ${a.token}`);
  } catch {}
}
