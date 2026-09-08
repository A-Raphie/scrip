# VO take: Honest Man (MiniMax) — beat map

Source: MiniMax_2026-09-08_20_42_44_Honest_Man.wav (stored as demo-take/vo-honest-man.wav)
Duration: 146.25s (2:26) · 32kHz mono PCM · sentence pauses 0.55 to 0.9s
Read: straight through, no long scene gaps, so scene timing derives from the
sentence-gap clusters and the word counts per scene (126 / 161 / 118 / 136 / 69).

## Derived scene boundaries (for per-scene screen takes + atrim mux)

| Scene | Script beat | VO window (s) | Screen |
|---|---|---|---|
| 1 | Hook + situation | 0.0 to ~31.7 | Landing: hero scroll to "the layer that was missing" |
| 2 | Statement | ~31.7 to ~72 | /s/demo: tape prints, one proof link to Basescan and back |
| 3 | Basket | ~72 to ~90 | /weft: basket table scroll, land on multiplier column |
| 4 | Proof run | ~90 to ~124 | /weft/proof: rows, pause on dividend + split |
| 5 | Close | ~124 to 146.25 | Landing final frame, hold 5s at end |

Boundary estimates carry ~1s tolerance: tighten in the edit against the
silence map, not against these numbers.

## Mux rules (from demo-final-gate + natural pacing)

- Never compress his pauses. Sentence gaps of 0.6 to 0.9s are his pacing.
- Per-scene screen takes, atrim to the VO window, join with beat audio.
- Basescan beats stay in the same tab.
- final-gate: max-gap check, scene-covers-beat check, zero grey frames at
  joins (trim the 0.53s avfoundation lead-in per take).
