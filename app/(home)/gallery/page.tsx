import type { Metadata } from "next";
import Image from "next/image";

import { Callout, MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Images from the Maymanah community.",
  alternates: { canonical: "/gallery" },
};

/**
 * Placeholder imagery.
 *
 * Alt text is empty on decorative images and descriptive on ones that carry
 * meaning, so a screen reader is not read a filename.
 */
const IMAGES = [
  { src: "/sunset_mosque.png", alt: "A mosque silhouetted against a sunset sky", label: "Evening prayer" },
  { src: "/tower_masjid.png", alt: "A minaret rising against an open sky", label: "The call to prayer" },
  { src: "/pattern.png", alt: "A repeating geometric Islamic pattern", label: "Geometric pattern" },
];

export default function GalleryPage() {
  return (
    <MarketingPage title="Gallery" lede="Images from across the community.">
      <Section heading="Recent">
        <div className="grid gap-4 sm:grid-cols-3">
          {IMAGES.map((image) => (
            <figure key={image.src} className="flex flex-col gap-2">
              <Image
                src={image.src}
                alt={image.alt}
                width={400}
                height={300}
                className="h-48 w-full rounded-2xl border border-border object-cover"
              />
              <figcaption className="text-xs text-text-tertiary">{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Callout>
        <p>
          These are placeholder images. Photographs of real classes and students will be published only with the
          consent of everyone shown.
        </p>
      </Callout>
    </MarketingPage>
  );
}
