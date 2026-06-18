"use client";

import { useEffect } from "react";

/** Locks background scroll while `active`, compensating for the scrollbar
 *  width so the page doesn't shift. Used by the mobile nav + filter drawers. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    // The page's scroll container is <html> (document scrollingElement), not
    // <body>, so lock that. Compensate for the removed scrollbar to avoid shift.
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPad = root.style.paddingRight;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPad;
    };
  }, [active]);
}
