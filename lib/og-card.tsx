import { ImageResponse } from "next/og";
import { BRAND_COLORS, SITE_DESCRIPTION } from "@/lib/seo";

export const OG_CARD_SIZE = { width: 1200, height: 630 };

/**
 * The site's default social share card, shared by opengraph-image.tsx
 * and twitter-image.tsx so both platforms render an identical, on-brand
 * preview without duplicating the layout.
 */
export function renderOgCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${BRAND_COLORS.layl} 0%, ${BRAND_COLORS.laylDeep} 100%)`,
          position: "relative",
        }}
      >
        {/* brass ambient glow, echoing the site's night-lantern theme */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: 200,
            width: 800,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND_COLORS.brass}33 0%, ${BRAND_COLORS.brass}00 70%)`,
            display: "flex",
          }}
        />

        {/* four small rotated squares — an echo of the khatam lattice */}
        <div style={{ position: "absolute", top: 64, left: 64, display: "flex" }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: `2px solid ${BRAND_COLORS.brass}55`,
              transform: "rotate(45deg)",
            }}
          />
        </div>
        <div style={{ position: "absolute", bottom: 64, right: 64, display: "flex" }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: `2px solid ${BRAND_COLORS.brass}55`,
              transform: "rotate(45deg)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "0 100px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 96,
              fontWeight: 700,
              color: BRAND_COLORS.ivory,
              letterSpacing: -2,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: `4px solid ${BRAND_COLORS.brass}`,
                transform: "rotate(45deg)",
                display: "flex",
              }}
            />
            <span>Maymanah</span>
          </div>

          <div
            style={{
              height: 2,
              width: 140,
              background: `linear-gradient(to right, transparent, ${BRAND_COLORS.brass}, transparent)`,
              display: "flex",
            }}
          />

          <div
            style={{
              fontSize: 32,
              color: BRAND_COLORS.sage,
              textAlign: "center",
              maxWidth: 880,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { ...OG_CARD_SIZE },
  );
}
