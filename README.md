# Weft

**One token, woven from real stocks.** Weft is an onchain index fund built from Coinbase Tokenized Stocks on Base: weave USDC in, receive a self-custodial basket token holding Apple, NVIDIA, Microsoft, and Tesla, unwind back to USDC anytime. Dividends handled. Every step provable.

Live: https://try-weft.vercel.app/weft

## The 60-second judge path

1. Open the live link and hit "Open the basket".
2. Connect a wallet on Base (or watch the recorded weave on the statement pages).
3. Weave USDC in: one transaction swaps across the weights and mints index shares.
4. "See a live statement" shows the proof layer running on the same registry: every trade, dividend, split, and issuer notice, each line backed by its transaction.
5. Unwind: shares burn, USDC returns, pro-rata.

## The proof run (onchain, today)

No dividend or split has ever executed on the mainnet registry (all 13 multipliers read 1.0). So the full loop ran on **Base Vibenet**, where the same B20 precompiles are live: weave 1,000 tUSDC into a real B20 index, both dividends land via announced multiplier events (1.00 to 1.02), a 2-for-1 split lands (1.02 to 2.04), unwind closes the loop. **7/7 claims verified against the public RPC** by `node scripts/verify-vibenet.mjs` (see `evidence/claims.json` for artifacts and regeneration commands). Live page: [/weft/proof](https://try-weft.vercel.app/weft/proof).

The one honest wart: the Vibenet fixture pools use fixed prices, so the split-doubled value reads in the basket valuation but not in the unwind output. On mainnet the pools are Aerodrome Slipstream with live LP pricing.

## Why an index, and why it had to be built for B20

The sponsor's own request-for-builders names it: composable single-name stocks with deep underlying liquidity, turned into personal portfolios. The liquidity is real and measured: AAPLc/USDC holds $1.36M on Aerodrome Slipstream ($1.6M daily volume), NVDAc/USDC $2.6M.

And the part a generic basket gets wrong: tokenized stock dividends are not paid in cash. The issuer raises an onchain multiplier (`UIMultiplierUpdated`) and one B20 token quietly becomes more than one share. Their docs warn: "One B20 token does not permanently equal one share." A basket that reads raw balances breaks silently on the first corporate action. Weft prices its inventory through `scaledBalanceOf` and values it with the Coinbase total-return Chainlink feeds, so dividends accrue to holders and weights stay true. No dividend has executed yet (every registry multiplier reads 1.0 today); the moment one runs, the mechanism is already proven in the tests.

## The contract

`src/WeftIndex.sol`: ~230 lines, no owner, no upgrades, no fees.

- `deposit(usdcIn, minShares)`: swaps USDC across fixed weights directly on Aerodrome Slipstream pools (contract-to-pool, no router middleman), mints shares pro-rata on share-denominated inventory value.
- `redeem(shares, minUsdcOut, slippageBps)`: burns shares, unwinds pro-rata per leg with per-leg slippage guards, returns USDC.
- Valuation: `scaledBalanceOf` (raw x multiplier) x Chainlink total-return price, with documented staleness bounds (feeds freeze on weekends and corporate actions; valuations refuse stale data).
- First-deposit inflation is poisoned with dead shares; reentrancy guarded; per-leg slippage enforced.

Honest disclosure: solo, unaudited, hackathon scope. Weights are fixed at creation; value weights drift with prices between deposits, like any index. The contract is permissionless: the interface carries the same non-US eligibility notice Coinbase's own product carries, and no US-trading features exist.

## Tests

`forge test --match-contract WeftUnitTest`: 6 passing. The load-bearing one is `test_multiplier_bump_accrues_to_holders`: after a simulated 2% dividend (multiplier 1.00 to 1.02), raw balances are untouched, basket value rises 2%, and later depositors receive fewer shares per dollar. Slippage guards, stale-feed refusal, and weight-sum validation are covered.

Fork tests (`WeftFork.t.sol`) are specified but skipped: B20 stock tokens are chain-native precompiles, which test frameworks cannot execute in-process. They document the funded mainnet dry run instead: $10 woven, unwound, and verified onchain before submission.

## The registry (verified against docs.base.org, Sep 2026)

AAPLc, TSLAc, NVDAc, COINc, GOOGLc, MSFTc, METAc, AMZNc, MSTRc, CRCLc, INTCc, SNDKc, SPCXc. Basket v1 holds the four deepest USDC pools (AAPLc, NVDAc, MSFTc, TSLAc); GOOGLc/METAc/AMZNc direct pools did not exist at build time and are noted rather than pretended.

## Stack

Next.js (App Router, RSC) + TypeScript + Tailwind v4 + viem + Foundry. No database: the chain is the database. Deployed on Vercel with the statement/certificate layer.

Weft is not affiliated with Coinbase or Base. Tokenized stocks are available to eligible non-US users only. The interface displays public chain data and does not enable trading for US users.

---

built by [Raphie](https://x.com/a_raphie)
