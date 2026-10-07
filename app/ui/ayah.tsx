import type { ReactNode } from "react";
import { amiri } from "./fonts";

type AyahTextProps = {
  children: ReactNode;
  className?: string;
  /** Optical sizes run ~125% of surrounding Latin — Arabic reads smaller at equal px. */
  size?: "sm" | "md" | "lg";
  /** Gilded brass gradient — for the signature calligraphic element of a page. */
  gilded?: boolean;
};

const SIZES = {
  sm: "text-2xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
};

/**
 * Quranic/hadith Arabic, treated as a first-class design element:
 * Amiri, rtl + lang, line-height 2. Never truncate ayah text.
 */
export function AyahText({
  children,
  className = "",
  size = "md",
  gilded = false,
}: AyahTextProps) {
  return (
    <span
      lang="ar"
      dir="rtl"
      className={`${amiri.className} ${SIZES[size]} [line-height:2] ${
        gilded
          ? "bg-linear-to-b from-[#D8B97C] via-[#C6A15B] to-[#A9854B] bg-clip-text text-transparent"
          : "text-ivory"
      } ${className}`}
    >
      {children}
    </span>
  );
}
