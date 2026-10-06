import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * The shapes used by every form on the site.
 *
 * Sizes, radii and focus treatment are defined once here so that a sign-in form
 * and a settings form cannot drift apart. Colours come from the tokens already
 * in `globals.css`, so light and dark are handled by the stylesheet rather than
 * by props.
 */

const FIELD_BASE =
  "w-full rounded-2xl border border-border bg-bg-elevated px-4 py-3 text-text-primary " +
  "placeholder:text-text-muted outline-none transition " +
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

function describedBy(...ids: (string | undefined)[]): string | undefined {
  const present = ids.filter(Boolean);
  return present.length > 0 ? present.join(" ") : undefined;
}

export interface FieldRenderProps {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
  className: string;
}

export interface FieldProps {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

export function Field({ label, name, hint, error, children }: FieldProps) {
  const id = `field-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
      </label>

      {children({
        id,
        "aria-describedby": describedBy(hintId, errorId),
        "aria-invalid": Boolean(error),
        className: FIELD_BASE,
      })}

      {hint ? (
        <p id={hintId} className="text-xs text-text-tertiary">
          {hint}
        </p>
      ) : null}

      {/*
        role="alert" so a message that appears after submission is announced,
        rather than only being visible to someone who happens to look.
      */}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-60";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-text-inverse hover:bg-primary-dark",
  secondary: "bg-secondary-subtle/30 border-2 border-border-strong hover:bg-secondary-subtle/50",
  ghost: "hover:bg-bg-hover",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BUTTON_BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    />
  );
}

/** Shown above a form for a result the whole page should notice. */
export function FormNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "danger";
  children: ReactNode;
}) {
  const tones = {
    info: "bg-info-muted text-text-primary border-info/40",
    success: "bg-success-muted text-text-primary border-success/40",
    danger: "bg-danger-muted text-text-primary border-danger/40",
  } as const;

  return (
    <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

/** Centred card used by every page that is only a form. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full max-w-md flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-text-secondary">{subtitle}</p> : null}
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-bg-card p-6 sm:p-8 shadow-sm">
        {children}
      </div>

      {footer ? <div className="flex flex-col gap-3 text-center text-sm text-text-secondary">{footer}</div> : null}
    </div>
  );
}

export function AltLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-primary hover:underline underline-offset-4">
      {children}
    </Link>
  );
}