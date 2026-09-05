# Loom demo script (~100 seconds, his voice)

Format rules: Loom screen recording, cursor at natural pace, never compress
pauses. Numbers on screen are real at record time: read them off the page, do
not pre-memorize values that change (total value, line count).

## Scene 1: landing (0:00 to 0:14)

On screen: https://tryscrip.vercel.app landing.

Say:

"Coinbase put real stocks onchain: Apple, Tesla, Nvidia, on Base, as tokens.
But when you buy them, you get a balance and nothing else. No statement, no
dividend notice, no paperwork."

## Scene 2: the one-liner (0:14 to 0:26)

On screen: same, cursor to the address form.

Say:

"This is Scrip. Paste any address: no wallet, no signature. It prints the
statement that should have come with the tokens."

Action: click "See a live statement".

## Scene 3: the tape prints (0:26 to 0:55)

On screen: the statement page, tape printing.

Say:

"This is a real address holding five Coinbase stock tokens. The tape prints
its actual trade history from the chain, oldest first. Every line carries a
proof link straight to the transaction on Basescan. Nothing is stored: Scrip
re-reads the chain every single time."

Action: click one proof link, show Basescan for two seconds, come back.

## Scene 4: the dividend mechanism (0:55 to 1:18)

On screen: scroll to the footnotes, then the holdings table with the
multiplier column.

Say:

"Here is the part nobody noticed. Tokenized stock dividends are not paid in
cash. The issuer raises a multiplier onchain instead, and your tokens quietly
become more shares. The standard was engineered for exactly that, but nobody
built the statement line. Scrip's indexer watches every multiplier event and
every issuer announcement, and the moment the first dividend runs, every
holder's statement grows the line automatically."

## Scene 5: the certificate (1:18 to 1:38)

On screen: click "Mint the certificate".

Say:

"Mint the certificate, and Scrip redraws the entire statement from the chain
and compares the hash. If every line still matches, it stamps it verified.
That is verification by replay, not a stored badge."

## Scene 6: close (1:38 to 1:45)

On screen: certificate page.

Say:

"Scrip. The paperwork your tokenized stocks never came with. Link in the
post."

---

# Google Form answers (draft: his clicks, notify-gated)

- Project Name: Scrip
- What does it solve in under 1-2 lines: Coinbase tokenized stocks come with
  no paperwork. Scrip turns onchain stock events into brokerage-grade
  statements: trades, dividends, splits, and issuer notices, each line backed
  by its transaction.
- A Demo Video Link: (paste Loom URL after recording)
- Live Project Link: https://tryscrip.vercel.app
- What's your Builder Code?: (his code from base.dev, Settings, Builder Code)
- Submission Tweet Link: (paste the X post URL after posting, tag @buildonbase)
