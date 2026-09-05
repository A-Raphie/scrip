"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddressForm({ size = "lg" }: { size?: "lg" | "sm" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(v)) {
      setError("That does not look like an address. It should start with 0x and be 42 characters long.");
      return;
    }
    setError(null);
    setBusy(true);
    router.push(`/s/${v}`);
  }

  const big = size === "lg";

  return (
    <form onSubmit={go} className="w-full">
      <div
        className={`ring-hairline flex items-center gap-2 bg-paper-raise p-2 ${
          big ? "flex-col sm:flex-row" : ""
        }`}
      >
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="0x... any Base address"
          spellCheck={false}
          aria-label="Base address"
          className={`w-full bg-transparent font-mono text-ink placeholder:text-ink-mute/70 focus:outline-none ${
            big ? "px-3 py-3 text-base" : "px-2 py-1.5 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={busy}
          className={`shrink-0 bg-ink font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-60 ${
            big ? "w-full px-6 py-3 sm:w-auto" : "px-4 py-1.5 text-sm"
          }`}
        >
          {busy ? "Printing..." : "Print the statement"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-ink-soft">{error}</p>}
    </form>
  );
}
