import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/seo";

/**
 * Renders the brand mark — a rotated square (a single unit of the
 * 8-fold khatam lattice) in brass on Layl — at any size. Used for the
 * favicon, apple touch icon, and PWA manifest icons so every surface
 * shares one generated source instead of hand-exported PNGs.
 */
export function renderBrandIcon(size: number) {
  const ring = Math.max(2, Math.round(size * 0.045));
  const diamond = Math.round(size * 0.62);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_COLORS.layl,
        }}
      >
        <div
          style={{
            width: diamond,
            height: diamond,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `${ring}px solid ${BRAND_COLORS.brass}`,
            transform: "rotate(45deg)",
          }}
        >
          <span
            style={{
              transform: "rotate(-45deg)",
              color: BRAND_COLORS.brass,
              fontSize: Math.round(size * 0.34),
              fontWeight: 700,
            }}
          >
            M
          </span>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
