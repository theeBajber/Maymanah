import type { Metadata } from "next";
import { amiri, elMessiri } from "@/components/ui/fonts";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Curriculum — Tajweed, Hifdh & Arabic Courses",
  description:
    "A structured, sanad-based curriculum: master Tajweed and recitation, memorize the Quran through our Hifdh track, and learn classical Arabic — each with a clear path to certification.",
  alternates: { canonical: "/curriculum" },
  openGraph: {
    title: "Curriculum — Tajweed, Hifdh & Arabic Courses | Maymanah",
    description:
      "A structured journey through Tajweed, Hifdh, and classical Arabic, built on an unbroken chain of transmission (sanad).",
    url: "/curriculum",
  },
};

/* Course JSON-LD — one entry per track, wording matched exactly to the
   visible copy below per Google's structured-data guidelines. */
const coursesJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/curriculum#tajweed`,
    name: "Tajweed & Recitation",
    description:
      "Perfect your articulation and master the rules of recitation to read the Quran exactly as it was revealed.",
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, sameAs: SITE_URL },
    isAccessibleForFree: true,
    inLanguage: "ar",
    educationalLevel: "Beginner to Advanced",
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/curriculum#hifdh`,
    name: "Memorization (Hifdh)",
    description:
      "A structured memorization program tailored to your capacity, focusing on retention and precise recall.",
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, sameAs: SITE_URL },
    isAccessibleForFree: true,
    inLanguage: "ar",
    educationalLevel: "Self-paced",
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}/curriculum#arabic`,
    name: "Arabic Language",
    description:
      "Bridge the gap between reading and understanding. Learn classical Arabic to comprehend the Quran directly.",
    provider: { "@type": "EducationalOrganization", name: SITE_NAME, sameAs: SITE_URL },
    isAccessibleForFree: true,
    inLanguage: "en",
    educationalLevel: "Beginner to Advanced",
  },
];

export default function Curriculum() {
  return (
    <main className="flex w-full flex-col items-center gap-16 pb-24">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesJsonLd) }}
      />
      <PageHeader
        arabic="سَنَدٌ مُتَّصِلٌ"
        title="A curriculum built on sanad"
        lede="A structured, immersive journey through foundational Islamic knowledge. Progress from absolute beginner to advanced fluency in a high-focus environment."
      />
      <Tracks />
    </main>
  );
}

/* Each track is a designed learning path — a rail of stations
   ending at a brass-lit certification node — not a bullet list. */

type Step = {
  title: string;
  arabic?: string;
  detail?: string;
  final?: boolean;
};

function PathRail({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative mt-2 flex flex-col gap-6">
      <span
        aria-hidden
        className="absolute bottom-3 left-1.25 top-3 w-px bg-linear-to-b from-ivory/10 via-ivory/20 to-brass/60"
      />
      {steps.map((step) => (
        <li key={step.title} className="relative flex flex-col gap-1 ps-8">
          <span
            aria-hidden
            className={`absolute left-0 top-1.75 size-2.75 rotate-45 ${
              step.final
                ? "bg-brass shadow-glow-brass"
                : "border border-brass/50 bg-layl"
            }`}
          />
          <span
            className={`flex flex-wrap items-baseline gap-2 text-[15px] font-medium ${
              step.final ? "text-brass" : "text-ivory"
            }`}
          >
            {step.title}
            {step.arabic && (
              <span
                lang="ar"
                dir="rtl"
                className={`${amiri.className} text-lg text-sage`}
              >
                {step.arabic}
              </span>
            )}
          </span>
          {step.detail && (
            <span className="text-[13px] leading-relaxed text-sage">
              {step.detail}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function TrackPanel({
  title,
  arabic,
  badge,
  body,
  steps,
  className = "",
}: {
  title: string;
  arabic?: string;
  badge: string;
  body: string;
  steps: Step[];
  className?: string;
}) {
  return (
    <article
      className={`glass-still hover-lift relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 hover:border-brass/30 md:p-8 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          className={`${elMessiri.className} flex items-baseline gap-3 text-2xl font-semibold text-ivory sm:text-3xl`}
        >
          {title}
          {arabic && (
            <span
              lang="ar"
              dir="rtl"
              className={`${amiri.className} text-2xl text-brass`}
            >
              {arabic}
            </span>
          )}
        </h2>
        <span className="rounded-full border border-brass/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
          {badge}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-sage md:text-[15px]">{body}</p>
      <PathRail steps={steps} />
    </article>
  );
}

function Tracks() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-2 md:px-8">
        <TrackPanel
          title="Tajweed & Recitation"
          badge="4 levels"
          body="Perfect your articulation and master the rules of recitation to read the Quran exactly as it was revealed."
          steps={[
            { title: "Foundational Articulation", arabic: "(مخارج)" },
            { title: "Rules of Noon & Meem Sakinah" },
            { title: "Advanced Madd & Waqf Rules" },
            { title: "Ijazah Preparation", final: true },
          ]}
        />
        <TrackPanel
          title="Memorization"
          arabic="(حفظ)"
          badge="Self-paced"
          body="A structured memorization program tailored to your capacity, focusing on retention and precise recall."
          steps={[
            { title: "Juz Amma & Tabarak" },
            { title: "First Third (10 Ajza)" },
            { title: "Second Third (20 Ajza)" },
            { title: "Complete Hifdh Certification", final: true },
          ]}
        />
        <ArabicTrack />
      </section>
    </Reveal>
  );
}

/* Arabic Language spans both columns: the same path, laid horizontally
   on desktop so the four levels read as stations on one line. */
function ArabicTrack() {
  const levels = [
    {
      level: "Level 1",
      title: "Alphabet & Basic Syntax",
      arabic: undefined as string | undefined,
      detail:
        "Mastering the script, vocabulary building, and nominal sentences.",
      final: false,
    },
    {
      level: "Level 2",
      title: "Morphology",
      arabic: "(صرف)",
      detail: "Understanding verb patterns, root words, and derivations.",
      final: false,
    },
    {
      level: "Level 3",
      title: "Grammar",
      arabic: "(نحو)",
      detail:
        "Complex sentence structures, case endings, and verbal sentences.",
      final: false,
    },
    {
      level: "Level 4",
      title: "Quranic Analysis",
      arabic: undefined,
      detail: "Applying grammar and morphology directly to Quranic texts.",
      final: true,
    },
  ];

  return (
    <article className="glass-still hover-lift relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6 hover:border-brass/30 md:col-span-2 md:p-8">
      <div className="flex flex-col gap-3">
        <h2
          className={`${elMessiri.className} text-2xl font-semibold text-ivory sm:text-3xl`}
        >
          Arabic Language
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-sage md:text-[15px]">
          Bridge the gap between reading and understanding. Learn classical
          Arabic to comprehend the Quran directly.
        </p>
      </div>
      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* the connecting rail, desktop only */}
        <span
          aria-hidden
          className="absolute left-1 right-6 top-1.25 hidden h-px bg-linear-to-r from-ivory/10 via-ivory/20 to-brass/60 lg:block"
        />
        {levels.map((item) => (
          <div key={item.level} className="relative flex flex-col gap-1.5 lg:pt-6">
            <span
              aria-hidden
              className={`absolute left-0 top-0 hidden size-2.75 rotate-45 lg:block ${
                item.final
                  ? "bg-brass shadow-glow-brass"
                  : "border border-brass/50 bg-layl"
              }`}
            />
            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                item.final ? "text-brass" : "text-sage/80"
              }`}
            >
              {item.level}
            </span>
            <span className="flex items-baseline gap-2 text-[15px] font-medium text-ivory">
              {item.title}
              {item.arabic && (
                <span
                  lang="ar"
                  dir="rtl"
                  className={`${amiri.className} text-lg text-sage`}
                >
                  {item.arabic}
                </span>
              )}
            </span>
            <p className="text-[13px] leading-relaxed text-sage">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
