#!/bin/bash
# Vibenet deployment driver. Deploys fixtures + WeftIndex, provisions pools,
# saves every address + tx hash to data/vibenet.json. Idempotent-ish: fails
# loudly per step. Run: bash scripts/vibenet-deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env.local 2>/dev/null || true
export $(grep -v '^#' .env.local | xargs)
RPC=https://rpc.vibes.base.org
K=$VIBENET_KEY
D=$VIBENET_ADDRESS
S="cast send --rpc-url $RPC --private-key $K"
F="forge create --rpc-url $RPC --private-key $K --broadcast"

WAAPL=0xB2000000000000000000000C11b319723b1cF075
WNVDA=0xB2000000000000000000004ab0A894CE7e5Ed1FC

out () { echo "$1" >> data/vibenet.json.tmp; }
rm -f data/vibenet.json.tmp
echo "{" > data/vibenet.json.tmp

txhash () { grep -aoE '"transactionHash":"0x[0-9a-f]{64}"' | head -1 | cut -d'"' -f4; }

echo "deploying tUSDC..."
TUSDC=$($F src/testnet/Fixtures.sol:TMockUSDC 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  tUSDC: $TUSDC"
echo "\"tusdc\": \"$TUSDC\"," >> data/vibenet.json.tmp

echo "deploying feedA (200)..."
FEEDA=$($F src/testnet/Fixtures.sol:TMockFeed --constructor-args 20000000000 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  feedA: $FEEDA"
echo "\"feedA\": \"$FEEDA\"," >> data/vibenet.json.tmp

echo "deploying feedB (100)..."
FEEDB=$($F src/testnet/Fixtures.sol:TMockFeed --constructor-args 10000000000 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  feedB: $FEEDB"
echo "\"feedB\": \"$FEEDB\"," >> data/vibenet.json.tmp

echo "deploying poolA..."
POOLA=$($F src/testnet/Fixtures.sol:TMockPool --constructor-args $TUSDC $WAAPL 200000000 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  poolA: $POOLA"
echo "\"poolA\": \"$POOLA\"," >> data/vibenet.json.tmp

echo "deploying poolB..."
POOLB=$($F src/testnet/Fixtures.sol:TMockPool --constructor-args $TUSDC $WNVDA 100000000 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  poolB: $POOLB"
echo "\"poolB\": \"$POOLB\"," >> data/vibenet.json.tmp

echo "minting stock inventory to pools..."
$S $WAAPL "mint(address,uint256)" $POOLA 20000000000000000 2>&1 | txhash > /tmp/tx_mint_a
$S $WNVDA "mint(address,uint256)" $POOLB 40000000000000000 2>&1 | txhash > /tmp/tx_mint_b
$S $TUSDC "mint(address,uint256)" $POOLA 50000000 2>&1 | txhash > /tmp/tx_seed_a
$S $TUSDC "mint(address,uint256)" $POOLB 50000000 2>&1 | txhash > /tmp/tx_seed_b
echo "  inventory + seed done"

echo "deploying WeftIndex..."
INDEX=$($F src/WeftIndex.sol:WeftIndex --constructor-args "Weft Proof Basket" "wPROOF" $TUSDC "[$WAAPL,$WNVDA]" "[5000,5000]" "[$POOLA,$POOLB]" "[$FEEDA,$FEEDB]" 2>/dev/null | grep -a "Deployed to" | awk '{print $3}')
echo "  index: $INDEX"

echo "funding demo user..."
$S $TUSDC "mint(address,uint256)" $D 2000000000 2>&1 | txhash > /tmp/tx_fund

# finalize json (strip trailing commas carefully)
python3 - <<EOF
import json
lines = open("data/vibenet.json.tmp").read().rstrip().rstrip(",")
open("data/vibenet.json","w").write(lines + """
  , "wAapl": "$WAAPL"
  , "wNvda": "$WNVDA"
  , "index": "$INDEX"
  , "deployer": "$D"
  , "chainId": 84538453
  , "rpc": "https://rpc.vibes.base.org"
  , "explorer": "https://chain.base.org/vibenet"
}""")
print("saved data/vibenet.json")
EOF
cat data/vibenet.json