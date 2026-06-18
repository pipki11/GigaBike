"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

/**
 * Transform-only scroll reveal (ported from the design's useReveal).
 * Anything already in view reveals immediately; the rest on intersection.
 */
export function Reveal({
  as = "div",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}: RevealProps & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vh = window.innerHeight || 800;
    if (el.getBoundingClientRect().top < vh * 0.95) {
      el.classList.add("in");
      return;
    }
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal ${className}`.trim(),
      style: { transitionDelay: `${delay}ms`, ...style },
      ...rest,
    },
    children,
  );
}
