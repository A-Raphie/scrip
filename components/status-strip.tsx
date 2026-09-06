"use client";

/// Mono status strip (winsznx anatomy): live dot · chain · counts · custody.
/// Values arrive as props; color never the sole signal (dot + word).
export function StatusStrip({
  items,
}: {
  items: { label: string; tone?: "live" | "mute" }[];
}) {
  return (
    <div
      aria-label="Status"
      className="ring-hairline flex flex-wrap items-center gap-x-5 gap-y-1 bg-paper-raise px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute"
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {it.tone === "live" && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2EBD85] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2EBD85]" />
            </span>
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}
