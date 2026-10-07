"use client";

import { useId, useRef } from "react";

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
};

/**
 * The selected index, or zero when the value matches nothing.
 *
 * Falling back rather than rendering a highlight under no option keeps a stale
 * value from pointing at the wrong choice. The mismatch itself is the caller's
 * problem to fix; the control refuses to mislead in the meantime.
 */
export function selectedIndex<T extends string>(options: Option<T>[], value: T): number {
  return Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: SegmentedControlProps<T>) {
  const fallbackId = useId();
  const groupLabel = label ?? fallbackId;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  if (options.length === 0) return null;

  const index = selectedIndex(options, value);

  function move(current: number, direction: 1 | -1) {
    const next = (current + direction + options.length) % options.length;
    onChange(options[next].value);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className={`relative grid grid-flow-col auto-cols-fr w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] p-1 ${className}`}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-[9px] bg-brass shadow-[0_0_24px_-6px_rgba(198,161,91,0.5)] transition-transform duration-300 ease-qandeel"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option, optionIndex) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[optionIndex] = element;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(optionIndex, 1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(optionIndex, -1);
              }
            }}
            className={`relative z-10 h-11 rounded-[9px] text-sm font-semibold transition-colors duration-300 ${
              active ? "text-layl-deep" : "text-sage hover:text-ivory"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}