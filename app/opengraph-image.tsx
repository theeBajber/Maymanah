import { renderOgCard, OG_CARD_SIZE } from "@/lib/og-card";

export const size = OG_CARD_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgCard();
}
