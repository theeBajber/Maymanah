"use client";
import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type FieldProps = {
  label: string;
  htmlFor: string;
  /** Inline validation — always explains how to fix the problem. */
  error?: string;
  hint?: string;
  /** Small element on the label row's far side (e.g. "Forgot password?"). */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  error,
  hint,
  trailing,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between px-0.5">
        <label
          htmlFor={htmlFor}
          className="text-[11px] uppercase tracking-[0.18em] font-semibold text-sage"
        >
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] leading-snug text-night-danger px-0.5">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] leading-snug text-sage/70 px-0.5">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  invalid?: boolean;
  /** Slot after the input, inside the frame (e.g. the password toggle). */
  trailingSlot?: ReactNode;
};

export function Input({
  icon,
  invalid = false,
  trailingSlot,
  className = "",
  ...rest
}: InputProps) {
  return (
    <div
      className={`group flex items-center gap-3 h-12 px-4 rounded-[10px] border bg-ivory/[0.04] transition-all duration-300 ${
        invalid
          ? "border-night-danger/60"
          : "border-ivory/10 focus-within:border-brass/60 focus-within:shadow-[0_0_0_3px_rgba(198,161,91,0.12),0_0_28px_-8px_rgba(198,161,91,0.35)]"
      } ${className}`}
    >
      {icon && (
        <span className="shrink-0 text-sage/70 transition-colors group-focus-within:text-brass [&>svg]:size-4">
          {icon}
        </span>
      )}
      <input
        className="w-full min-w-0 bg-transparent text-[15px] text-ivory placeholder:text-sage/40 focus:outline-none"
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {trailingSlot}
    </div>
  );
}

type PasswordInputProps = Omit<InputProps, "type" | "trailingSlot">;

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? "text" : "password"}
      trailingSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="shrink-0 rounded p-1 text-sage/70 transition-colors hover:text-brass"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  );
}
