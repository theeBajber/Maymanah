import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { GirihField } from "@/components/ui/girih";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Become a Volunteer Quran Teacher",
  description:
    "Teach Tajweed, Hifdh, or Arabic online as a volunteer — an ongoing charity (Sadaqah Jariyah) in your name. Four-step application, matched with your first student within two weeks.",
  alternates: { canonical: "/teach" },
  openGraph: {
    title: "Become a Volunteer Quran Teacher | Maymanah",
    description:
      "Volunteer as a Quran teacher — an ongoing charity in your name. Apply in minutes.",
    url: "/teach",
  },
};

export default function Teach() {
  return (
    <main className="flex w-full flex-col items-center gap-16 pb-24">
      <PageHeader
        arabic="وَعَلَّمَهُ"
        title="Teach at Maymanah"
        lede="The second half of the hadith is yours: those who learn the Quran — and teach it. Volunteer your knowledge and make every verse you pass on an ongoing charity."
      />
      <Calling />
      <VettingPath />
      <ApplyPanel />
    </main>
  );
}

function Calling() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-2 md:px-8">
        <div className="flex flex-col justify-center gap-5 p-2 md:p-6">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory`}
          >
            A prophetic calling
          </h2>
          <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-sage">
            <p>
              Teaching the Quran is a trust carried from teacher to student in
              an unbroken chain. At Maymanah, that chain crosses borders: your
              student may sit in Jakarta, Lagos, or São Paulo, and the reward
              of every verse they master returns to you.
            </p>
            <p>
              We never charge tuition, and we never pay salaries. Every
              teacher here serves for the sake of Allah alone — which is
              exactly why students trust the sanctuary.
            </p>
          </div>
        </div>
        <div className="glass-still relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 md:p-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            What we ask of you
          </h3>
          <ul className="flex flex-col gap-4">
            {[
              "Two or more hours each week, at times you choose",
              "A stable connection and a quiet space for live sessions",
              "Patience and rahmah — our pedagogy is built on both",
              "Commitment to each student's progress, session to session",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1.75 size-2 shrink-0 rotate-45 border border-brass/60 bg-layl"
                />
                <span className="text-[15px] leading-relaxed text-ivory/90">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  );
}

/* The vetting process is genuinely sequential, so it earns a numbered path. */
function VettingPath() {
  const steps = [
    {
      step: "Step one",
      title: "Application & ijazah verification",
      detail:
        "Tell us your background. We verify your certifications and the lineage of your ijazah to ensure sound transmission.",
    },
    {
      step: "Step two",
      title: "Live recitation trial",
      detail:
        "Recite before our senior academic committee, who assess tajweed precision and correction instincts in real time.",
    },
    {
      step: "Step three",
      title: "Pedagogical review",
      detail:
        "We evaluate how you teach — pacing, patience, and rahmah — to make sure it matches the sanctuary students expect.",
    },
    {
      step: "Step four",
      title: "Onboarding & continuous assessment",
      detail:
        "You're matched with your first students. Regular feedback loops and training keep the standard world-class.",
    },
  ];

  return (
    <Reveal className="w-full">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 md:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory`}
          >
            The path to your first student
          </h2>
          <p className="max-w-xl text-sage">
            Four stages, usually completed within two weeks.
          </p>
        </div>
        <ol className="relative flex flex-col gap-9">
          <span
            aria-hidden
            className="absolute bottom-4 left-1.25 top-4 w-px bg-linear-to-b from-ivory/10 via-ivory/20 to-brass/60"
          />
          {steps.map((item, index) => (
            <li key={item.title} className="relative flex flex-col gap-1.5 ps-9">
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 size-2.75 rotate-45 ${
                  index === steps.length - 1
                    ? "bg-brass shadow-glow-brass"
                    : "border border-brass/50 bg-layl"
                }`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brass">
                {item.step}
              </span>
              <h3
                className={`${elMessiri.className} text-xl font-semibold text-ivory`}
              >
                {item.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-sage">
                {item.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}

function ApplyPanel() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto w-full max-w-3xl px-6 md:px-8">
        <div className="glass-lantern relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl px-6 py-12 text-center md:px-14">
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
          <h2
            className={`${elMessiri.className} relative text-3xl font-semibold text-ivory`}
          >
            Ready to pass it on?
          </h2>
          <p className="relative max-w-md text-balance text-sage">
            Create a teacher account to begin your application. Our committee
            reviews every submission personally.
          </p>
          <Link
            href="/register?role=teacher"
            className={buttonClasses("primary", "lg", "relative w-full sm:w-56")}
          >
            <ButtonSheen />
            Apply to teach
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contact"
            className="relative text-sm text-lapis transition-colors hover:text-ivory"
          >
            Questions first? Contact us
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
