import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { keccak256, toBytes } from "viem";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 6 }) });
const head = await client.getBlockNumber();

const topics: [string, string][] = [
  ["mult", keccak256(toBytes("UIMultiplierUpdated(uint256,uint256,uint256)"))],
  ["ann", keccak256(toBytes("Announcement(address,string,string,string)"))],
  ["seized", keccak256(toBytes("Seized(address,address,address,uint256)"))],
];

for (const [name, topic] of topics) {
  const hits: any[] = [];
  let fails = 0;
  for (let k = 0; k < 80; k++) {
    const hi = head - BigInt(k) * 9_000n;
    const lo = hi - 8_900n;
    if (lo < 0n) break;
    try {
      const logs = await client.getLogs({ topics: [[topic]], fromBlock: lo, toBlock: hi });
      hits.push(...logs);
    } catch { fails++; }
  }
  console.log(`${name}: ${hits.length} events (${fails} failed windows)`);
  const addrs = new Map<string, number>();
  for (const h of hits) {
    const a = h.address.toLowerCase();
    addrs.set(a, (addrs.get(a) ?? 0) + 1);
  }
  for (const [a, n] of [...addrs.entries()].sort((x, y) => y[1] - x[1]).slice(0, 10)) {
    console.log("  ", a, "x", n);
  }
}
