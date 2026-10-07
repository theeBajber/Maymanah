"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes has no way to know the resolved theme during SSR (it lives
  // in localStorage/system preference, neither available on the server), so
  // rendering theme-dependent UI before mount causes a hydration mismatch.
  // Render the same neutral state on server and first client paint, then
  // swap to the real icon once mounted.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative size-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all active:scale-95"
    >
      <Sun
        className={`size-[18px] absolute transition-all duration-300 ${
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
        }`}
      />
      <Moon
        className={`size-[18px] absolute transition-all duration-300 ${
          !isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-90"
        }`}
      />
    </button>
  );
}
