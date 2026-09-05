import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#eff3ec",
          color: "#151a16",
          padding: "72px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 44, letterSpacing: -1 }}>Scrip</div>
          <div style={{ fontSize: 20, color: "#6f7a72", letterSpacing: 3, fontFamily: "monospace" }}>
            STATEMENTS FOR TOKENIZED STOCKS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
              display: "flex",
            }}
          >
            The paperwork your tokenized stocks never came with.
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#45514a", display: "flex" }}>
            Trades, dividends, splits, issuer notices. Every line backed by its transaction.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 22, color: "#6f7a72", fontFamily: "monospace" }}>
            Coinbase Tokenized Stocks on Base · AAPLc TSLAc NVDAc COINc GOOGLc MSFTc +7
          </div>
          <div style={{ fontSize: 22, color: "#0052ff", fontFamily: "monospace" }}>
            every line has proof
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
