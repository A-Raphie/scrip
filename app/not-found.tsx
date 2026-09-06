import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-7">
        <span className="font-display text-xl tracking-tight">Weft</span>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 pb-24">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          This thread was never woven.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          The page you asked for does not exist. The basket and the statement
          pages are both a click away.
        </p>
        <div className="mt-6 flex gap-3">
          <Link className="bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft" href="/">
            Home
          </Link>
          <Link className="ring-hairline bg-paper-raise px-5 py-3 text-sm font-medium text-ink hover:bg-paper-sink" href="/weft">
            The basket
          </Link>
        </div>
      </main>
    </div>
  );
}
