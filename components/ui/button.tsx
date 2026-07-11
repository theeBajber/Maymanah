import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const VARIANTS = {
  primary:
    "bg-brass text-layl-deep hover:bg-[#D2AF6B] hover:shadow-glow-brass",
  ghost: "border border-ivory/15 text-ivory hover:bg-ivory/5 hover:border-ivory/25",
  quiet: "text-lapis hover:text-ivory",
};

const BASE =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[10px] font-semibold tracking-tight transition-all duration-300 ease-qandeel select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50";

/** Button styling for non-button elements (e.g. Link CTAs). */
export function buttonClasses(
  variant: keyof typeof VARIANTS = "primary",
  size: keyof typeof SIZES = "md",
  extra = "",
) {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${extra}`;
}

/** The primary variant's hover sheen, for use inside link CTAs. */
export function ButtonSheen() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[400%]"
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {variant === "primary" && (
        /* brass sheen sweep on hover; static under reduced motion */
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[400%]"
        />
      )}
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
