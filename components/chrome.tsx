import Link from "next/link";

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`font-display tracking-tight ${small ? "text-xl" : "text-2xl"}`}
    >
      Scrip
    </span>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line-soft">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-5 py-8 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
        <p>
          Scrip reads public chain data. Not affiliated with Coinbase or Base.
          Tokenized stocks are available to eligible non-US users only.
        </p>
        <p className="shrink-0">
          built by{" "}
          <a
            className="proof-link underline decoration-line"
            href="https://x.com/a_raphie"
            target="_blank"
            rel="noreferrer"
          >
            Raphie
          </a>
        </p>
      </div>
    </footer>
  );
}

export function TickerStrip() {
  const symbols = [
    "AAPLc",
    "TSLAc",
    "NVDAc",
    "COINc",
    "GOOGLc",
    "MSFTc",
    "METAc",
    "AMZNc",
    "MSTRc",
    "CRCLc",
    "INTCc",
    "SNDKc",
    "SPCXc",
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[13px] tracking-tight text-ink-soft">
      {symbols.map((s) => (
        <span key={s}>{s}</span>
      ))}
    </div>
  );
}

export function ProofLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="proof-link font-mono text-xs underline decoration-line"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export function BackHome() {
  return (
    <Link className="text-sm text-ink-mute hover:text-ink" href="/">
      Back
    </Link>
  );
}
