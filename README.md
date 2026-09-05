# Scrip

**Statements for tokenized stocks.** Paste any Base address and Scrip prints the brokerage-grade statement the new Coinbase tokenized stocks never came with: every trade, dividend, split, and issuer notice, each line backed by its transaction.

Live: https://scrip-roan.vercel.app

## The 60-second judge path

1. Open the live link.
2. Hit "See a live statement" (a real Base address holding Coinbase stock tokens).
3. Watch the tape print the holder's actual trade history, then open any line's `proof` link: it is the transaction on Basescan.
4. Press "Mint the certificate": Scrip re-draws the statement from the chain and stamps the certificate VERIFIED when every line still matches.

No wallet connection. Nothing signs. The whole product is read-only.

## Why this exists

Coinbase puts real stocks on Base as B20 tokens: AAPLc, TSLAc, NVDAc and ten more. Holding and trading them is permissionless. What a holder gets today: a token balance. What a holder does not get: a statement, cost history, dividend notices, split records, anything they can show an accountant, a friend, or a counterparty.

The B20 standard was engineered for this and almost nobody noticed:

- Dividends are not paid in cash. The issuer raises an onchain **multiplier** (`UIMultiplierUpdated`): your tokens quietly become more shares. Scrip turns those events back into the dividend lines a real statement shows.
- Issuer notices are written onchain as human-readable `Announcement` events, explicitly "to support public reporting requirements". Scrip is the reporting surface.
- Every holder action is a standard `Transfer` log. Scrip renders them as the trade ledger, each row stamped with its transaction.

## How it works

- **Trades**: Blockscout's public API gives full per-address token transfer history for Base (free RPC gateways cap `eth_getLogs` at 10,000 blocks, which makes history walks impossible at render time).
- **Live state**: official Base gateway multicall. Balances, `scaledBalanceOf` (raw tokens x multiplier = redeemable shares), and the Coinbase total-return Chainlink feeds for prices, with the documented staleness rules applied.
- **Corporate actions**: a GitHub Actions indexer walks the chain every 30 minutes in 9,500-block windows and commits every `UIMultiplierUpdated` and `Announcement` event to `data/actions.jsonl` in this repo. The walk resumes from a cursor, so it keeps up with chain head forever.
- **Certificates**: `/c/{address}/{hash}` re-draws the whole statement from scratch and compares the hash. Identical: VERIFIED. Different: AMENDED. Verification is a replay, not a stored badge.

## Honest status

| Claim | Status |
|---|---|
| Real Coinbase stock registry (13 tokens) read live | yes, balances and total-return prices onchain |
| Real trade history per address | yes, from public indexer, every line links its tx |
| Dividend and split lines from multiplier events | engine live in production, zero events exist yet |
| Chain-wide corporate-action indexing | running every 30 minutes via Actions |

The last two rows are the honest catch, and they are the interesting one: the Coinbase registry is weeks old and **no dividend or split has ever executed**. Every token's multiplier reads exactly 1.0 today (you can check: `multiplier()` on any registry token). The statement engine consumes those events already, the indexer is already watching, and the moment the issuer runs the first dividend, every holder's statement grows the dividend line automatically. Where a claim could not be verified, the UI says so instead of guessing: stale price feeds hide valuations, positions closed before indexed history carry a footnote, and the split-versus-dividend label follows a stated ratio rule.

## Stack

Next.js (App Router, RSC) + TypeScript + Tailwind v4 + viem. No database: the chain is the database, the repo is the corporate-action store, and certificates are verified by replay. Deployed on Vercel.

## Verification, for the skeptical

```bash
# any registry token's multiplier, right now
cast call 0xb200000000000000000000C2e324d24d7eEcd1fb "multiplier()(uint256)" --rpc-url https://mainnet.base.org
# -> 1000000000000000000  (1.0: the first dividend is still in the future)

# the corporate-action store, committed by the indexer
git log --oneline -- data/
```

Token addresses and feed addresses are the official ones from `docs.base.org/specifications/b20/tokenized-stocks-on-base`. Scrip is not affiliated with Coinbase or Base. Tokenized stocks are available to eligible non-US users only; Scrip displays public chain data and does not enable trading.

---

built by [Raphie](https://x.com/a_raphie)
