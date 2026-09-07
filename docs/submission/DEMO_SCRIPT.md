# Loom demo script (~2:20, his voice, VO above the 320-word standard)

Rules: Loom screen recording, natural cursor pace, never compress pauses.
Read live numbers off the page at record time; do not memorize values that
move (prices, basket lines, statement totals). Basescan opens in the same
tab, never a new one.

## Scene 1: hook on the landing (0:00 to 0:32)

On screen: https://try-weft.vercel.app landing. Slow scroll: hero with the
live basket specimen card, then the situation section with the three stat
cards, stop on "Weft is the layer that was missing."

Say:

"Coinbase just put real stocks onchain. Apple, NVIDIA, Microsoft, Tesla:
actual shares, living on Base as tokens, buyable from any wallet, with no
brokerage account. And people are buying them: this card on the right is
reading live prices off the oracle feeds right now. Thirteen stocks in the
registry. But here's what nobody tells you. When you buy one, all you
receive is a number in your wallet. No statement. No purchase history. No
dividend notice. Nothing you could show an accountant, or a friend, or
yourself six months from now. And dividends here don't arrive as cash at
all: the issuer quietly raises an onchain number, and your tokens become
more shares overnight. If you never check, you never know you got paid."

Action: slow scroll, pin each line to the section it names, hold on the
closing line.

## Scene 2: the statement (0:32 to 1:15)

On screen: click "See a live statement", the tape prints 76 real rows, then
one proof link opens Basescan in the same tab, back to the page.

Say:

"That's the gap Weft closes, and it starts with paperwork. This is a real
address that's been buying these stocks since August. I pasted it in. No
login, no signature, no account: just the address, and Weft prints the full
brokerage statement. Look at the summary: two hundred thirty-eight dollars
and forty-three cents across five positions. Seventy-six lines, straight
off the chain. Every buy, every sell, dated and ordered, valued at the live
oracle price on screen. And this blue proof on every single line opens the
exact transaction on Basescan. Nothing here is stored in a database. There
is no backend holding this page up. The chain is re-read, from scratch,
every single time anyone opens it, which is exactly what a statement should
be."

Action: let the tape print, hover a proof link while the VO names it, click
it, hold Basescan two seconds, navigate back, pause on the summary strip.

## Scene 3: the basket (1:15 to 1:40)

On screen: /weft, scroll slowly across the basket table, land on the
multiplier column, then the fund line.

Say:

"Then the basket itself. Thirty-five percent Apple, thirty-five NVIDIA,
fifteen Microsoft, fifteen Tesla: the four deepest stock pools on Base,
measured, not guessed. Weave USDC in, one transaction swaps across every
pool, and you hold a single index token instead of four separate positions.
The weave swaps on Aerodrome, the deepest liquidity on Base, and the whole
route costs cents in gas. Unwind burns the token and hands your USDC back.
No manager. No fees. No keys. No admin."

Action: slow horizontal scroll across the table, pause on the multiplier
column.

## Scene 4: the proof run (1:40 to 2:10)

On screen: /weft/proof, scroll the five-row loop slowly. Pause on the
dividend row, then the split row, then the raw-balances note under the
measurements table.

Say:

"Now the part a generic basket gets wrong. These dividends are never paid
in cash. The issuer raises an onchain multiplier, and your tokens quietly
become more shares. No dividend has ever run on the mainnet registry: every
multiplier still reads one. So Weft proved the whole loop on Base's
testnet, where the same B20 precompiles are live. The stock tokens there
were created through Coinbase's own factory. One thousand dollars woven in.
The dividend lands: ten twenty, and the issuer announcement is written
onchain in plain English. The split lands: fifteen thirty. Unwound. And
watch the raw balances in that table: they never moved. All of it flowed
through the multiplier, exactly how Coinbase designed it. When the first
real dividend runs on mainnet, Weft renders it the same way,
automatically."

Action: scroll row by row, hold two seconds on the dividend row and the
split row.

## Scene 5: close (2:10 to 2:30)

On screen: back on the landing, hold the final frame: two buttons, footer,
live prices strip still moving.

Say:

"Weft. Real stocks, one token, and the paperwork that was always missing.
The app is live, the source is public, and every claim on this page
re-verifies itself against the chain. The multipliers, the prices, the
history: all of it reads straight from public endpoints, and the repo ships
verify scripts that re-check every number from a fresh connection. You
don't have to trust any of it. Check it."

Action: none. Hold five seconds.

---

# Google Form answers (draft: his clicks, notify-gated)

- Project Name: Weft
- What does it solve in under 1-2 lines: Coinbase tokenized stocks come with
  no paperwork and no way to combine them. Weft prints brokerage-grade
  statements for any address and runs a multiplier-aware index basket,
  every step provable onchain.
- A Demo Video Link: (paste Loom URL after recording)
- Live Project Link: https://try-weft.vercel.app
- What's your Builder Code?: (his code from base.dev, Settings, Builder Code)
- Submission Tweet Link: (paste the X post URL after posting, tag @buildonbase)
