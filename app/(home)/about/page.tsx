import type { Metadata } from "next";
import {
  Brain,
  GraduationCap,
  Globe,
  HandHeart,
  History,
  Presentation,
} from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { AyahText } from "@/components/ui/ayah";
import { GirihField } from "@/components/ui/girih";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Reviews } from "./Reviews";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Maymanah is a non-profit sanctuary connecting students with ijazah-verified volunteer teachers worldwide — powered by Sadaqah Jariyah, free for every student, forever.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Maymanah — A Global Quranic Sanctuary",
    description:
      "Why Maymanah is free, how our four-stage teacher vetting works, and the community behind it.",
    url: "/about",
  },
};

export default function About() {
  return (
    <main className="flex w-full flex-col items-center gap-20 pb-24">
      <PageHeader
        arabic="الْعِلْمُ نُورٌ"
        title="The pursuit of divine knowledge"
        lede="Connecting students with teachers for the sake of Allah. Experience a sanctuary of focused learning, free from distractions."
      />
      <WhyItsFree />
      <HowItWorks />
      <Excellence />
      <Reveal className="w-full">
        <Reviews />
      </Reveal>
    </main>
  );
}

function WhyItsFree() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:px-8">
        <div className="flex flex-col gap-6 p-2 md:p-6">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory md:text-4xl`}
          >
            Why is it free?
          </h2>
          <span
            aria-hidden
            className="h-px w-20 bg-linear-to-r from-brass/60 to-transparent"
          />
          <div className="flex flex-col gap-5 text-[15px] leading-relaxed text-sage md:text-base">
            <p>
              Maymanah operates on the principle of{" "}
              <span className="font-semibold text-brass">Sadaqah Jariyah</span>{" "}
              (voluntary ongoing charity). We believe that the teaching of the
              Quran is a prophetic mission that should never be commodified.
            </p>
            <p>
              Our platform is powered by the selfless devotion of volunteer
              teachers who seek reward from Allah alone. By removing the
              tuition fee, we ensure that a student&apos;s economic status
              never dictates their spiritual growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 pt-2">
            <span className="flex items-center gap-3">
              <HandHeart className="size-4.5 text-brass" />
              <span className="text-sm font-medium text-ivory">
                100% volunteer based
              </span>
            </span>
            <span className="flex items-center gap-3">
              <Globe className="size-4.5 text-brass" />
              <span className="text-sm font-medium text-ivory">
                Global reach
              </span>
            </span>
          </div>
        </div>

        {/* the page's signature: the hadith of ongoing charity, treated
            as an illuminated panel rather than a pull-quote */}
        <div className="glass-still relative flex flex-col gap-5 overflow-hidden rounded-3xl p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20"
          >
            <GirihField
              className="absolute inset-0"
              opacity={0.09}
              tile={56}
              fade="bottom"
            />
          </div>
          <h3 className="relative text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            A vision for the ummah
          </h3>
          <AyahText size="sm" className="relative text-ivory/95">
            إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ:
            صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ
            صَالِحٍ يَدْعُو لَهُ
          </AyahText>
          <p className="relative text-[15px] leading-relaxed text-sage">
            &ldquo;When a human being dies, his work comes to an end except
            for three things: ongoing charity, knowledge benefited from, or a
            righteous child who prays for him.&rdquo;
          </p>
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-sage/70">
            Sahih Muslim
          </p>
          <p className="relative text-[14px] leading-relaxed text-sage">
            Every verse taught, every tajweed rule mastered, and every heart
            softened through our platform serves as a legacy for our teachers
            and supporters.
          </p>
        </div>
      </section>
    </Reveal>
  );
}

/* Genuinely sequential, so it earns its stations on a rail. */
function HowItWorks() {
  const steps = [
    {
      title: "Apply",
      detail: "Submit your application and set your goals and current level.",
    },
    {
      title: "Match",
      detail: "Get paired with a qualified teacher based on your specific needs.",
    },
    {
      title: "Learn",
      detail: "Start your sessions in our dedicated digital sanctuary.",
    },
  ];
  return (
    <Reveal className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 md:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory md:text-4xl`}
          >
            How it works
          </h2>
          <p className="text-sage">
            Join our global community in three steps, bismillah.
          </p>
        </div>
        <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <span
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-1.25 hidden h-px bg-linear-to-r from-ivory/15 via-brass/40 to-brass/60 md:block"
          />
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex flex-col items-center gap-3 text-center md:pt-8"
            >
              <span
                aria-hidden
                className={`absolute left-1/2 top-0 hidden size-2.75 -translate-x-1/2 rotate-45 md:block ${
                  index === steps.length - 1
                    ? "bg-brass shadow-glow-brass"
                    : "border border-brass/50 bg-layl"
                }`}
              />
              <h3
                className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
              >
                {step.title}
              </h3>
              <p className="max-w-60 text-sm leading-relaxed text-sage">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}

function Excellence() {
  const standards = [
    {
      icon: GraduationCap,
      title: "Ijazah Verification",
      detail:
        "We verify the certifications and lineage of teachers to ensure sound tajweed and knowledge.",
    },
    {
      icon: Presentation,
      title: "Recitation Trial",
      detail:
        "Each candidate must pass a live recitation assessment with our senior academic committee.",
    },
    {
      icon: Brain,
      title: "Pedagogical Review",
      detail:
        "We evaluate teaching styles to ensure they match our values of patience and Rahmah.",
    },
    {
      icon: History,
      title: "Continuous Assessment",
      detail:
        "Regular feedback loops and training sessions keep our educational standards world-class.",
    },
  ];
  return (
    <Reveal className="w-full">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-12 px-4 sm:px-6 md:flex-row md:gap-16 md:px-8">
        <div className="flex flex-col gap-5 md:w-1/3">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory`}
          >
            Verified excellence
          </h2>
          <p className="border-s-2 border-brass/50 ps-5 text-[15px] leading-relaxed text-sage md:text-base">
            Quality is never sacrificed for cost. Every teacher at Maymanah
            undergoes a rigorous screening process to ensure authentic
            transmission of knowledge.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:w-2/3 md:gap-10">
          {standards.map((standard) => (
            <div key={standard.title} className="flex items-start gap-4">
              <standard.icon className="mt-0.5 size-5 shrink-0 text-brass" />
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold text-ivory">
                  {standard.title}
                </h3>
                <p className="text-sm leading-relaxed text-sage">
                  {standard.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
