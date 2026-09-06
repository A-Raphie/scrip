"use client";

import { useEffect, useRef, useState } from "react";

/// Scroll reveal per landing-system B7: translate-y-16 blur-md opacity-0
/// resolving to clear over 800ms with the custom easing curve. Never a
/// window scroll listener.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // hidden state only once JS can reveal
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // arm only if the section is still below the fold: content above the fold
    // and no-JS readers always get full legibility (winsznx Part 3 rule)
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      setArmed(true);
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        },
        { threshold: 0.12 },
      );
      io.observe(el);
      return () => io.disconnect();
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
        !armed || shown ? "translate-y-0 blur-0 opacity-100" : "translate-y-16 blur-md opacity-0"
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
