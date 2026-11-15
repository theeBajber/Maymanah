"use client";

import { Check } from "lucide-react";
import { useRef, type ReactNode } from "react";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "primary";

const CHIP_SURFACE: Record<StatusTone, string> = {
  neutral: "border-border bg-bg-hover",
  info: "border-info/30 bg-info-muted",
  success: "border-success/30 bg-success-muted",
  warning: "border-warning/30 bg-warning-muted",
  danger: "border-danger/30 bg-danger-muted",
  primary: "border-primary/30 bg-primary-muted",
};

const DOT_COLOR: Record<StatusTone, string> = {
  neutral: "bg-text-secondary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  primary: "bg-primary",
};

/**
 * A compact state label.
 *
 * The label carries the meaning; the tone only reinforces it. Text stays in
 * the primary ink token because the muted tone fills are too light for the
 * warning colour to pass AA at this size in both themes.
 */
export function StatusChip({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold text-text-primary ${CHIP_SURFACE[tone]} ${className}`}
    >
      <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${DOT_COLOR[tone]}`} />
      {children}
    </span>
  );
}

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  /** Spoken after the label, for choices such as a 1–5 rating. */
  description?: string;
};

/**
 * A single-choice chip group with roving focus.
 *
 * Built on real radio semantics rather than styled links: arrow keys move the
 * selection, Home and End jump to either end, and only the active chip is in
 * the tab order.
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className = "",
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  if (options.length === 0) return null;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function move(current: number, direction: 1 | -1) {
    const next = (current + direction + options.length) % options.length;
    onChange(options[next].value);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={index === activeIndex ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(index, 1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(index, -1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                onChange(options[0].value);
                buttons.current[0]?.focus();
              }
              if (event.key === "End") {
                event.preventDefault();
                onChange(options[options.length - 1].value);
                buttons.current[options.length - 1]?.focus();
              }
            }}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "border-primary bg-primary text-text-inverse"
                : "border-border bg-bg-elevated text-text-primary hover:bg-bg-hover"
            }`}
          >
            {active ? <Check aria-hidden className="size-3.5 shrink-0" /> : null}
            <span>{option.label}</span>
            {option.description ? (
              <span className="sr-only">, {option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
