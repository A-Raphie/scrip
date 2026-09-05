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
              fontSize: 72,
              lineHeight: 1.06,
              letterSpacing: -2,
              maxWidth: 940,
              display: "flex",
            }}
          >
            The paperwork your tokenized stocks never came with.
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: "#45514a", display: "flex" }}>
            Trades, dividends, splits, issuer notices. Every line backed by its transaction.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 22, color: "#6f7a72", fontFamily: "monospace", display: "flex" }}>
            AAPLc · TSLAc · NVDAc · COINc · GOOGLc · MSFTc · METAc · AMZNc · MSTRc · CRCLc · INTCc · SNDKc · SPCXc
          </div>
          <div style={{ fontSize: 22, color: "#0052ff", fontFamily: "monospace", display: "flex" }}>
            Coinbase Tokenized Stocks on Base · every line has proof
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
