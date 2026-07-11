import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { ArchFrame } from "@/components/ui/arch";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Real journeys through Maymanah — students who completed Hifdh, and volunteer teachers guiding them across time zones and continents.",
  alternates: { canonical: "/stories" },
  openGraph: {
    title: "Success Stories | Maymanah",
    description: "Journeys through the sanctuary, told by the people who made them.",
    url: "/stories",
  },
};

const stories = [
  {
    name: "Hazza Al-Balushi",
    role: "Student, Muscat",
    portrait: "/portraits/balushi.jpg",
    milestone: "From alphabet to Juz Amma in fourteen months",
    paragraphs: [
      "I came to Maymanah unable to connect two letters. My teacher never once made me feel behind — we spent three full sessions on the letter ض alone, and he treated each one like it mattered as much as a khatmah.",
      "Fourteen months later I recited Juz Amma from memory in front of my parents. My mother wept. That recitation belongs to my teacher as much as it belongs to me.",
    ],
  },
  {
    name: "Yasser Al-Dossari",
    role: "Volunteer teacher, Riyadh",
    portrait: "/portraits/yasser.jpg",
    milestone: "Nine students across six time zones",
    paragraphs: [
      "I expected to give knowledge. I did not expect what teaching here would give back. My Tuesday student joins from a hospital shift in Manchester; my Friday student is a grandmother in Kuala Lumpur learning tajweed for the first time at sixty-two.",
      "Every session reminds me why this work must stay free. The chain of transmission was never meant to have a price on it.",
    ],
  },
  {
    name: "Idris Abkar",
    role: "Ijazah candidate, Abu Dhabi",
    portrait: "/portraits/abkar.jpg",
    milestone: "Completed hifdh review, now preparing for ijazah",
    paragraphs: [
      "I had memorized the Quran years ago, but the memorization had rusted. Maymanah's revision program rebuilt it page by page — my teacher tracked every weak surah and returned to it until the recall was effortless.",
      "Now we are working through the ijazah preparation track. When I receive it, my certificate will carry a chain that reaches back through my teacher's teachers. That is what this platform protects.",
    ],
  },
];

export default function Stories() {
  return (
    <main className="flex w-full flex-col items-center gap-16 pb-24">
      <PageHeader
        arabic="قَصَصُ النُّورِ"
        title="Stories from the sanctuary"
        lede="Real journeys through Maymanah — students, teachers, and the verses that carried them."
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 sm:px-6 md:px-8">
        {stories.map((story, index) => (
          <Reveal key={story.name}>
            <article
              className={`glass-still hover-lift flex flex-col gap-6 overflow-hidden rounded-3xl p-6 hover:border-brass/30 sm:gap-10 sm:p-10 ${
                index % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"
              }`}
            >
              <div className="flex shrink-0 flex-col items-center gap-4">
                <ArchFrame className="h-48 w-32">
                  <Image
                    src={story.portrait}
                    alt={`Portrait of ${story.name}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-layl/50 via-transparent to-transparent"
                  />
                </ArchFrame>
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={`${elMessiri.className} text-lg font-semibold text-ivory`}
                  >
                    {story.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-sage/70">
                    {story.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                  <span
                    aria-hidden
                    className="size-1.5 shrink-0 rotate-45 bg-brass/70"
                  />
                  {story.milestone}
                </p>
                {story.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-[15px] leading-relaxed text-sage"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="w-full">
        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-sage">Your story starts with a first session.</p>
          <Link
            href="/register"
            className={buttonClasses("primary", "lg", "w-full sm:w-56")}
          >
            <ButtonSheen />
            Begin your journey
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
        </section>
      </Reveal>
    </main>
  );
}
