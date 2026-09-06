#!/bin/bash
# The Vibenet proof loop: weave -> dividend -> split -> unwind.
# Measurements and tx hashes land in data/vibenet-run.json.
set -euo pipefail
cd "$(dirname "$0")/.."
source .env.local 2>/dev/null || true
export $(grep -v '^#' .env.local | xargs)
RPC=https://rpc.vibes.base.org
K=$VIBENET_KEY
D=$VIBENET_ADDRESS
S="cast send --rpc-url $RPC --private-key $K"
C="cast call --rpc-url $RPC"
eval $(python3 - <<'EOF'
import json
d = json.load(open("data/vibenet.json"))
for k, v in d.items():
    if isinstance(v, str) and v.startswith("0x"):
        print(f"{k.upper()}={v}")
EOF
)
KV=data/vibenet-run.kv
rm -f $KV
txhash () { grep -aoE '"transactionHash":"0x[0-9a-f]{64}"' | head -1 | cut -d'"' -f4; }

snap () {
  local label=$1
  echo "${label}_value=$( $C $INDEX "totalValueUsd()(uint256)")" >> $KV
  echo "${label}_shares=$($C $INDEX "balanceOf(address)(uint256)" $D)" >> $KV
  echo "${label}_rawA=$($C $WAAPL "balanceOf(address)(uint256)" $INDEX)" >> $KV
  echo "${label}_rawB=$($C $WNVDA "balanceOf(address)(uint256)" $INDEX)" >> $KV
  echo "${label}_multA=$($C $WAAPL "multiplier()(uint256)")" >> $KV
  echo "${label}_multB=$($C $WNVDA "multiplier()(uint256)")" >> $KV
  echo "  [$label] value=$(python3 -c "print(int($($C $INDEX "totalValueUsd()(uint256)"),16)/1e18)")"
}

echo "1) approve"
echo "tx_approve=$($S $TUSDC "approve(address,uint256)" $INDEX 1000000000000 2>&1 | txhash)" >> $KV

echo "2) weave 1000 tUSDC"
echo "tx_weave=$($S $INDEX "deposit(uint256,uint256)" 1000000000 0 2>&1 | txhash)" >> $KV
snap after_weave

echo "3) dividend on both tokens (announced 1.00 -> 1.02)"
CA=$(cast calldata "updateMultiplier(uint256)" 1020000000000000000)
echo "tx_dividend_wAapl=$($S $WAAPL "announce(bytes[],string,string,string)" "[$CA]" "weft-dividend-1" "Quarterly dividend: multiplier raised 1.00 to 1.02; holders receive 2 percent more redeemable shares." "https://tryscrip.vercel.app/weft" 2>&1 | txhash)" >> $KV
echo "tx_dividend_wNvda=$($S $WNVDA "announce(bytes[],string,string,string)" "[$CA]" "weft-dividend-2" "Quarterly dividend: multiplier raised 1.00 to 1.02; holders receive 2 percent more redeemable shares." "https://tryscrip.vercel.app/weft" 2>&1 | txhash)" >> $KV
snap after_dividend

echo "4) split on wNVDA (announced 1.02 -> 2.04)"
CS=$(cast calldata "updateMultiplier(uint256)" 2040000000000000000)
echo "tx_split_wNvda=$($S $WNVDA "announce(bytes[],string,string,string)" "[$CS]" "weft-split-1" "2-for-1 stock split: multiplier doubled 1.02 to 2.04; every token now redeems for twice the shares." "https://tryscrip.vercel.app/weft" 2>&1 | txhash)" >> $KV
snap after_split

echo "5) unwind all"
SHARES=$(python3 -c "print(int('$($C $INDEX "balanceOf(address)(uint256)" $D)',16))")
echo "shares_burned=$SHARES" >> $KV
echo "tx_unwind=$($S $INDEX "redeem(uint256,uint256,uint256)" $SHARES 900000000 300 2>&1 | txhash)" >> $KV
snap after_unwind
echo "usdc_returned=$($C $TUSDC "balanceOf(address)(uint256)" $D)" >> $KV

python3 - <<'EOF'
import json
d = {}
for line in open("data/vibenet-run.kv"):
    line = line.strip()
    if not line or "=" not in line: continue
    k, v = line.split("=", 1)
    d[k] = str(int(v, 16)) if v.startswith("0x") else v
json.dump(d, open("data/vibenet-run.json", "w"), indent=2)
print(json.dumps(d, indent=2))
EOF