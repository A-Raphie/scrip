"use client";

import { useEffect, useRef, useState } from "react";

/// Tagline reveal: words activate one at a time as they cross into view
/// (landing-page-design B11), muted ink resolving to full ink, custom easing.
export function TaglineReveal({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={ref}
      aria-label={text}
      className="max-w-3xl font-display text-3xl leading-[1.15] tracking-tight sm:text-5xl sm:leading-[1.12]"
    >
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            transitionDelay: `${i * 70}ms`,
            opacity: visible ? 1 : 0.28,
          }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}
