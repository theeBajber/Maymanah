"use client";
import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";

/* Four-centered pointed arch, normalized to the element's bounding box. */
const ARCH_PATH =
  "M0,1 L0,0.42 C0,0.20 0.12,0.07 0.35,0.03 L0.5,0 L0.65,0.03 C0.88,0.07 1,0.20 1,0.42 L1,1 Z";

type ArchFrameProps = {
  /** Size the frame here (e.g. "h-64 w-32"). Children fill it (use Image with `fill`). */
  className?: string;
  /** Brass hairline tracing the arch profile. */
  border?: boolean;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Pointed-arch mask — one of the two sanctioned arch placements
 * (image frames; modal crowns). Not for buttons, avatars, or cards.
 */
export function ArchFrame({
  className = "",
  border = true,
  style,
  children,
}: ArchFrameProps) {
  const clipId = `arch-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className={`relative ${className}`} style={style}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={ARCH_PATH} />
          </clipPath>
        </defs>
      </svg>
      {border && (
        <div
          aria-hidden
          className="absolute inset-0 bg-brass/30"
          style={{ clipPath: `url(#${clipId})` }}
        />
      )}
      <div
        className={`absolute overflow-hidden ${border ? "inset-[1.5px]" : "inset-0"}`}
        style={{ clipPath: `url(#${clipId})` }}
      >
        {children}
      </div>
    </div>
  );
}
