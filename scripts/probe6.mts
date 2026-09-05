import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org", { timeout: 20000, retryCount: 5 }) });
const AAPLc = "0xb200000000000000000000C2e324d24d7eEcd1fb";
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const head = await client.getBlockNumber();
console.log("head:", head);

for (let k = 0; k <= 48; k++) {
  const hi = head - BigInt(k) * 1_000_000n;
  const lo = hi - 9_000n;
  if (lo < 0n) break;
  try {
    const logs = await client.getLogs({
      address: AAPLc,
      topics: [[transferTopic]],
      fromBlock: lo,
      toBlock: hi,
    });
    console.log(`window at head-${k}M: ${logs.length} transfers`);
  } catch {
    console.log(`window at head-${k}M: ERR`);
  }
}
