# Design brief: Scrip

## Consensus default (banned)
Dark web3 dashboard with purple-blue gradient hero, glassmorphic bento stat cards, candlestick chart, neon green/red PnL, Inter/Geist everywhere, emoji feature icons, "Powered by Base" footer. This is what ~80% of Builder Quest entries will look like: the five sponsor-named apps (mini-brokerage, AI index builder, gift links, yield vault, memestock launcher) all collapse into this shape.

## Axes pushed
1. **Typography: engraved-serif display, banknote lineage.** Libre Bodoni for display (the security-print serif: Italian state printing, stock certificates, banknotes), Geist Mono for serials/numerals (Base's own mono fallback, a direct sponsor tie), Geist for body. Concept justification: scrip IS certificate paper; scripophily collectors know Bodoni-adjacent didones as the certificate voice. Not in the portfolio (grotesk numerals = reeve, mono-first = rushes, Binance sans = assay).
2. **Color: security-paper sage-green field + engraving ink + one live blue.** Classic bond/share-certificate green-tinted paper, near-black ink, and Base Blue #0052FF (mined from base.org CSS as rgba(0,82,255,..), Sep 5) reserved exclusively for live/verification moments (proof links, VERIFIED states). Ledger-safe: portfolio has dark (assay/purser/recourse), cream-legal (claimcheck), grey-paper (rushes), cool-white duotone (reeve). Green security-paper is unclaimed and is THE security-print convention.
3. **Motion/layout: THE TAPE.** The statement prints row by row as a ticker-tape / adding-machine printout while the indexer walks the chain; rows punch in with a physical print-head kick, each stamped with its tx hash. All else is still (stillness doctrine). Mechanism = indexing progress made physical; the artifact being printed is the product.

## Axes kept conventional
- Elevation: hairline rings at .5px (matches Base's own inset ring habit: inset 0 0 0 .5px #7575ff). No glow, no soft shadows beyond one tight+diffuse pair on the tape paper.
- Density: statement body is a tables-first data grid (financial convention; where work happens, convention aids use).
- Chrome: address pill + Connect top-right (Jakob anchor: it must read as an onchain product in one second).

## Sponsor synthesis
Base.org verified (not eyeballed): light-first surface (58 white refs), ink ladder #111212/#171717/#262626/#6f6f6f, hairlines #efefef/#e5e5e5/#dddddf, paper greys #f6f6f6/#f7f8f9/#f8f8f8, accent rgba(0,82,255) = #0052FF with satellite blues #224bff/#0735ff/#5b8cff/#7575ff, cyan #00a9dd. Their structure wears: light field, near-black ink, .5px rings. Our divergence: their greys tint toward security-print sage; their blue is rationed to proof.

## Signature move: THE TAPE PRINTS THE STATEMENT
- Mechanism test: PASS - the printout is the indexing engine's output, rows are real B20 events (Transfers, MultiplierUpdated deltas, Announcements), each row carries its tx proof.
- 5-minute test: PASS - print-head punch-in with per-row tx stamps + paper-feed geometry is not a component-library effect; data binding makes it real.
- Demo test: PASS - the money moment is paste address -> the tape prints the dividend/split/trade rows live. It is on screen for the whole demo.
- Scarcity: prints once per statement generation. The certificate share page is completely still. Nothing else animates.

## Avoid-list
Candlestick charts; gradient heroes; glassmorphism; dark dashboards; animating seals/stamps (assay owns stamp-strike); cream legal-paper (claimcheck); dials-on-documents (reeve); streaming event-feeds-as-widgets (recourse); Inter-only; bento grids.

## Familiarity anchor
The address pill + Connect chrome, top right. The one consensus element kept, load-bearing for the onchain read.

## Craft floor
Body 15-25px, line spacing 120-145%, line length 45-90ch measured, mono microcopy at .1em+ tracking when caps, one accent (attention is zero-sum: blue only means PROOF), spacing scale before components, empty states designed (no holdings -> the tape prints a header and a clean nil line, then teaches), never color alone for state (stamps carry words), no em dashes in any UI string.

## Chains to
semantic-tokens -> ui-craft -> claims-verify (every number on a row must come from the chain at render time) -> pre-ship-gate.
