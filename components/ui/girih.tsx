"use client";
import { useId } from "react";
import type { CSSProperties } from "react";

type GirihFieldProps = {
  className?: string;
  /** Design system allows 0.03–0.08 ambient, up to ~0.10 on a masked edge strip. */
  opacity?: number;
  color?: "brass" | "ivory";
  /** Rendered tile size in px (the tile itself is drawn on a 64-unit grid). */
  tile?: number;
  /** How the pattern dissolves into the night instead of tiling to a hard edge. */
  fade?: "radial" | "bottom" | "top" | "none";
  /** Barely-perceptible drift; disabled automatically under prefers-reduced-motion. */
  animate?: boolean;
};

const STROKE = { brass: "#C6A15B", ivory: "#EAE6DA" } as const;

const FADES: Record<string, string | undefined> = {
  radial:
    "radial-gradient(ellipse 85% 75% at 50% 40%, black 25%, transparent 100%)",
  bottom: "linear-gradient(to bottom, black 20%, transparent 100%)",
  top: "linear-gradient(to top, black 20%, transparent 100%)",
  none: undefined,
};

/**
 * The one geometric system of the app: an 8-fold khatam (star-and-cross)
 * lattice, drawn as strokes — light on the mosque lattice, not wallpaper.
 * Absolutely position it inside a `relative overflow-hidden` container.
 */
export function GirihField({
  className = "",
  opacity = 0.05,
  color = "brass",
  tile = 72,
  fade = "radial",
  animate = false,
}: GirihFieldProps) {
  const patternId = `girih-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const maskImage = FADES[fade];
  const maskStyle: CSSProperties = maskImage
    ? { maskImage, WebkitMaskImage: maskImage }
    : {};

  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden ${className}`}
      style={maskStyle}
    >
      <svg
        className={animate ? "girih-drift" : undefined}
        style={{
          width: `calc(100% + ${tile}px)`,
          height: `calc(100% + ${tile}px)`,
        }}
      >
        <defs>
          <pattern
            id={patternId}
            width={tile}
            height={tile}
            patternUnits="userSpaceOnUse"
            viewBox="0 0 64 64"
          >
            <g fill="none" stroke={STROKE[color]} strokeWidth="1">
              {/* center khatam: two overlapping squares = 8-point star */}
              <rect x="19" y="19" width="26" height="26" />
              <rect
                x="19"
                y="19"
                width="26"
                height="26"
                transform="rotate(45 32 32)"
              />
              {/* corner khatams (clipped by the tile; neighbors complete them) */}
              {(
                [
                  [0, 0],
                  [64, 0],
                  [0, 64],
                  [64, 64],
                ] as const
              ).map(([cx, cy]) => (
                <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
                  <rect x="-13" y="-13" width="26" height="26" />
                  <rect
                    x="-13"
                    y="-13"
                    width="26"
                    height="26"
                    transform="rotate(45 0 0)"
                  />
                </g>
              ))}
              {/* connectors between stars across tiles */}
              <path d="M32 0 V13.6 M32 50.4 V64 M0 32 H13.6 M50.4 32 H64" />
            </g>
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
          opacity={opacity}
        />
      </svg>
    </div>
  );
}
