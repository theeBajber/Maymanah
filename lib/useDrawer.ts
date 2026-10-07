"use client";
import { useEffect } from "react";

/**
 * Standard mobile-drawer behavior: Escape closes it, and the page behind
 * it stops scrolling while it's open. Shared by every hamburger-style
 * drawer in the app (public nav, settings sidebar) so they all behave
 * identically.
 */
export function useDrawerBehavior(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);
}
