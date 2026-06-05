export const THEME_KEY = "theme";

export type Theme = "light" | "dark" | "system";

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_KEY) as Theme) || "system";
}

export function getEffectiveTheme(): "light" | "dark" {
  const stored = getStoredTheme();
  if (stored === "system") return getSystemTheme();
  return stored;
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const effective = getEffectiveTheme();
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(effective);
}
