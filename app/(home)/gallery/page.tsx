import type { Metadata } from "next";
import Image from "next/image";
import { elMessiri } from "@/components/ui/fonts";
import { ArchFrame } from "@/components/ui/arch";
import { GirihField } from "@/components/ui/girih";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Scenes of light, geometry, and the houses of the Quran — architecture, calligraphy, and the Islamic geometric tradition behind the Maymanah sanctuary.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Maymanah",
    description: "Scenes of light, geometry, and the houses of the Quran.",
    url: "/gallery",
  },
};

/* Two frame treatments, per the design system:
   arch masks for architecture, lattice-crowned panes for flat art. */

const archItems = [
  {
    src: "/sunset_mosque.png",
    title: "Maghrib over the minarets",
    caption: "The hour the sanctuary fills.",
  },
  {
    src: "/tower_masjid.png",
    title: "The tower masjid",
    caption: "Stone raised for remembrance.",
  },
  {
    src: "/calligraphy.png",
    title: "The written word",
    caption: "Revelation, carried by the pen.",
  },
];

const paneItems = [
  {
    src: "/map.png",
    title: "A borderless ummah",
    caption: "Fifteen thousand students, one qiblah.",
  },
  {
    src: "/portraits/pattern-2.png",
    title: "The geometry of remembrance",
    caption: "Eight points, endlessly returning.",
  },
  {
    src: "/portraits/pattern-5.png",
    title: "Light through the lattice",
    caption: "What the mashrabiya lets through.",
  },
];

export default function Gallery() {
  return (
    <main className="flex w-full flex-col items-center gap-16 pb-24">
      <PageHeader
        arabic="نُورٌ عَلَىٰ نُورٍ"
        title="Light upon light"
        lede="Scenes from the tradition this platform serves — architecture, calligraphy, and the geometry that carries them."
      />

      {/* the arcade: architecture behind pointed arches */}
      <Reveal className="w-full">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 sm:px-6 md:px-8">
          <div className="flex w-full flex-col items-end justify-center gap-8 sm:flex-row sm:gap-6">
            {archItems.map((item, index) => (
              <figure
                key={item.src}
                className="stagger-item flex w-full flex-col items-center gap-3 sm:w-auto"
                style={{ "--i": index } as React.CSSProperties}
              >
                <ArchFrame
                  className={`hover-lift w-full max-w-60 sm:w-52 ${
                    index === 1 ? "h-96 sm:h-104" : "h-80 sm:h-88"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-layl/60 via-transparent to-transparent"
                  />
                </ArchFrame>
                <figcaption className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={`${elMessiri.className} text-lg font-semibold text-ivory`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[13px] text-sage">{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </Reveal>

      {/* flat art in lattice-crowned panes */}
      <Reveal className="w-full">
        <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 px-4 sm:grid-cols-3 sm:px-6 md:px-8">
          {paneItems.map((item, index) => (
            <figure
              key={item.src}
              className="glass-still hover-lift stagger-item group relative flex flex-col overflow-hidden rounded-2xl hover:border-brass/30"
              style={{ "--i": index } as React.CSSProperties}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14"
              >
                <GirihField
                  className="absolute inset-0"
                  opacity={0.1}
                  tile={48}
                  fade="bottom"
                />
              </div>
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover opacity-90 transition-transform duration-700 ease-qandeel motion-safe:group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-[#101E26] via-transparent to-transparent"
                />
              </div>
              <figcaption className="flex flex-col gap-0.5 p-5">
                <span
                  className={`${elMessiri.className} font-semibold text-ivory`}
                >
                  {item.title}
                </span>
                <span className="text-[13px] text-sage">{item.caption}</span>
              </figcaption>
            </figure>
          ))}
        </section>
      </Reveal>
    </main>
  );
}
