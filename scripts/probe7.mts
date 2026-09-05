import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 5 }) });
const FACTORY = "0xB20f000000000000000000000000000000000000";
const head = await client.getBlockNumber();

// any logs from the factory at all, recent 9k blocks
const logs = await client.getLogs({ address: FACTORY, fromBlock: head - 9_000n, toBlock: head });
console.log("factory logs in last 9k blocks:", logs.length);
for (const l of logs.slice(0, 3)) {
  console.log(" topics[0]:", l.topics[0]);
  console.log(" topics[1]:", l.topics[1]);
  console.log(" data len:", l.data.length, "block:", l.blockNumber, "tx:", l.transactionHash);
}

// where do AAPLc transfers START? walk 100k strides back from head
const AAPLc = "0xb200000000000000000000C2e324d24d7eEcd1fb";
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
let firstHit: bigint | null = null;
for (let k = 0; k <= 12; k++) {
  const hi = head - BigInt(k) * 100_000n;
  const lo = hi - 9_000n;
  if (lo < 0n) break;
  const ls = await client.getLogs({ address: AAPLc, topics: [[transferTopic]], fromBlock: lo, toBlock: hi });
  console.log(`AAPLc at head-${k}00k: ${ls.length}`);
  if (ls.length > 0 && firstHit === null) firstHit = hi;
}
