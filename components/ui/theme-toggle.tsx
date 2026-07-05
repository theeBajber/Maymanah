"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

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
