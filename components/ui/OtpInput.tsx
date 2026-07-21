"use client";
import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (index: number) => {
    if (index < 0 || index >= length) return;
    inputs.current[index]?.focus();
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const digits = value.split("").slice(0, length);
    digits[index] = char;
    const next = digits.join("");
    onChange(next);
    if (char && index < length - 1) focus(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const digits = value.split("").slice(0, length);
      if (digits[index]) {
        digits[index] = "";
        onChange(digits.join(""));
      } else if (index > 0) {
        digits[index - 1] = "";
        onChange(digits.join(""));
        focus(index - 1);
      }
    }
    if (e.key === "ArrowLeft") focus(index - 1);
    if (e.key === "ArrowRight") focus(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const nextIndex = pasted.length;
    if (nextIndex < length) focus(nextIndex);
    else focus(length - 1);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl border border-border bg-bg-primary text-text-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
