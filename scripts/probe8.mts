import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { keccak256, toBytes } from "viem";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 5 }) });
const head = await client.getBlockNumber();

const multTopic = keccak256(toBytes("UIMultiplierUpdated(uint256,uint256,uint256)"));
const annTopic = keccak256(toBytes("Announcement(address,string,string,string)"));

// chain-wide scan (no address filter) since token era began
for (const [name, topic] of [["mult", multTopic], ["ann", annTopic]] as const) {
  const hits: any[] = [];
  for (let k = 0; k < 9; k++) {
    const hi = head - BigInt(k) * 100_000n;
    const lo = hi - 99_000n;
    if (lo < 0n) break;
    try {
      const logs = await client.getLogs({ topics: [[topic]], fromBlock: lo, toBlock: hi });
      hits.push(...logs);
    } catch {
      // halve once
      const mid = lo + (hi - lo) / 2n;
      try {
        const a = await client.getLogs({ topics: [[topic]], fromBlock: lo, toBlock: mid });
        const b = await client.getLogs({ topics: [[topic]], fromBlock: mid + 1n, toBlock: hi });
        hits.push(...a, ...b);
      } catch { console.log(`${name} window ${k}: FAIL`); }
    }
  }
  console.log(`${name}: ${hits.length} events in last ~900k blocks`);
  const addrs = new Map<string, number>();
  for (const h of hits) {
    const a = h.address.toLowerCase();
    addrs.set(a, (addrs.get(a) ?? 0) + 1);
  }
  for (const [a, n] of [...addrs.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8)) {
    console.log("  ", a, "x", n);
  }
}
