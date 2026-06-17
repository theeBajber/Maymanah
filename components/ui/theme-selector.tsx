"use client";

import { useTheme } from "next-themes";
import { Sun, Monitor, Moon } from "lucide-react";

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-3">
      {options.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            type="button"
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
              active
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-border-strong bg-bg-primary text-text-secondary hover:border-emerald-300 hover:text-text-primary"
            }`}
            aria-pressed={active}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
