import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { AyahText } from "@/components/ui/ayah";
import { GirihField } from "@/components/ui/girih";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex w-full flex-col items-center gap-24 overflow-hidden pb-24 md:gap-32">
      <Hero />
      <Quote />
      <Principles />
      <Support />
    </main>
  );
}

/* ---------------------------------------------------------------
   Hero — split composition: the pitch and its proof (a live,
   worldwide network) sit side by side instead of stacked.
   --------------------------------------------------------------- */
function Hero() {
  return (
    <section className="relative w-full">
      {/* night atmosphere */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_0%,#0E1B23_0%,#0B151B_55%,transparent_100%)]"
      />
      <GirihField
        className="absolute inset-0"
        opacity={0.05}
        tile={84}
        fade="radial"
        animate
      />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-[30rem] w-[42rem] max-w-full -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(198,161,91,0.13),transparent)]"
      />

      <div className="stagger-fade relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 pt-16 pb-10 md:pt-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start gap-6 text-left">
          <p className="flex items-center gap-2 rounded-full border border-brass/25 bg-brass/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            <Globe className="size-3.5" />A global spiritual sanctuary
          </p>

          <h1
            className={`${elMessiri.className} text-balance text-5xl font-bold leading-[1.08] text-ivory sm:text-6xl lg:text-[3.5rem]`}
          >
            The Quran
            <br />
            <span className="text-brass">Without Borders.</span>
          </h1>

          <p className="max-w-md text-balance text-base leading-relaxed text-sage md:text-lg">
            Maymanah connects expert volunteer teachers with dedicated
            students worldwide, transcending geography to bring Quranic
            excellence to every home.
          </p>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
            >
              <ButtonSheen />
              Get started free
              <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
            </Link>
            <Link
              href="/teach"
              className={buttonClasses("ghost", "lg", "w-full sm:w-auto")}
            >
              Apply to teach
            </Link>
          </div>

          <AvatarStack />
        </div>

        <WorldPanel />
      </div>
    </section>
  );
}

/* Proof-of-network visual: a world map card with a floating
   live-session plaque, replacing a stock hero photo. */
function WorldPanel() {
  return (
    <div className="stagger-item relative w-full" style={{ "--i": 4 } as React.CSSProperties}>
      <div className="glass-still relative aspect-square w-full overflow-hidden rounded-3xl sm:aspect-4/3">
        <Image
          src="/map.png"
          alt="A world map marking Maymanah's global network of students and teachers"
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover opacity-80"
          priority
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-layl-deep/60 via-transparent to-layl-deep/10"
        />
      </div>
      <div className="glass-pane absolute bottom-6 left-1/2 flex w-[calc(100%-2.5rem)] max-w-xs -translate-x-1/2 items-center gap-4 rounded-xl px-5 py-3 sm:left-auto sm:right-6 sm:w-auto sm:-translate-x-0">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-night-success/60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-night-success" />
        </span>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brass">
            Live session
          </span>
          <span className="text-sm font-medium text-ivory">
            Ustadh Issa
            <span className="text-sage"> — Cairo, Egypt</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function AvatarStack() {
  const portraits = [
    "/portraits/yasser.jpg",
    "/portraits/sudais.png",
    "/portraits/maher.jpg",
    "/portraits/balushi.jpg",
  ];
  return (
    <div className="stagger-item flex -space-x-3" style={{ "--i": 5 } as React.CSSProperties}>
      {portraits.map((src) => (
        <span
          key={src}
          className="relative size-9 overflow-hidden rounded-full ring-2 ring-layl-deep"
        >
          <Image src={src} alt="" fill sizes="36px" className="object-cover" />
        </span>
      ))}
      <span className="relative flex size-9 items-center justify-center rounded-full bg-brass/15 text-[11px] font-semibold text-brass ring-2 ring-layl-deep">
        15K+
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------
   Quote — the hadith as its own resting moment between the pitch
   and the proof, framed by a pair of oversized quotation marks.
   --------------------------------------------------------------- */
function Quote() {
  return (
    <Reveal className="w-full">
      <section className="relative mx-auto w-full max-w-4xl px-6 md:px-8">
        <span
          aria-hidden
          className={`${elMessiri.className} pointer-events-none absolute -top-8 left-2 text-7xl text-brass/25 md:-top-12 md:left-0 md:text-8xl`}
        >
          &ldquo;
        </span>
        <div className="flex flex-col items-center gap-5 text-center">
          <AyahText size="md" gilded>
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </AyahText>
          <p className="max-w-xl text-balance text-xl font-medium leading-snug text-ivory md:text-2xl">
            &ldquo;The best of you are those who learn the Quran and teach
            it.&rdquo;
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
            Prophet Muhammad <span lang="ar" className="text-sm">ﷺ</span>
          </p>
        </div>
        <span
          aria-hidden
          className={`${elMessiri.className} pointer-events-none absolute -bottom-20 right-2 text-7xl text-brass/25 md:-bottom-24 md:right-0 md:text-8xl`}
        >
          &rdquo;
        </span>
      </section>
    </Reveal>
  );
}

/* ---------------------------------------------------------------
   Principles — three glass panels on ONE continuous girih field:
   the lattice literally connects them ("Connecting Hearts"), and
   the asymmetric 3/2 split gives 1-on-1 mentorship flagship weight.
   --------------------------------------------------------------- */
function Principles() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 md:px-8">
        <div className="flex w-full flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex flex-col gap-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brass">
              Core principles
            </h2>
            <h3
              className={`${elMessiri.className} text-4xl font-semibold leading-tight text-ivory lg:text-5xl`}
            >
              Connecting hearts
              <br />
              through revelation.
            </h3>
          </div>
          <p className="max-w-md text-base leading-relaxed text-sage md:text-lg">
            We provide the digital sanctuary. You provide the heart and the
            dedication to master the Book of Allah.
          </p>
        </div>

        <div className="relative">
          {/* the connective lattice behind all three panels */}
          <GirihField
            className="absolute -inset-6 md:-inset-10"
            opacity={0.06}
            tile={72}
            fade="radial"
          />
          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-5">
            <PrincipleCard
              flagship
              index={0}
              className="md:col-span-3 md:row-span-2"
              image="/1-on-1.png"
              title="1-on-1 Sessions"
              body="Dedicated time with vetted teachers to master Tajweed and Hifdh at your own speed. Experience a personalized curriculum tailored to your specific spiritual goals and learning pace."
              linkHref="/curriculum"
              linkLabel="Explore learning paths"
            />
            <PrincipleCard
              index={1}
              className="md:col-span-2"
              image="/universal-access.png"
              title="Universal Access"
              body="Our global network ensures that sessions are available across every timezone, 24/7."
              linkHref="/about"
              linkLabel="Learn more"
            />
            <PrincipleCard
              index={2}
              className="md:col-span-2"
              image="/vetted-teachers.jpg"
              title="Vetted Teachers"
              body="Each teacher undergoes rigorous evaluation of recitation and pedagogy to ensure quality."
              linkHref="/teachers"
              linkLabel="Find a teacher"
            />
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PrincipleCard({
  flagship = false,
  index = 0,
  className = "",
  image,
  title,
  body,
  linkHref,
  linkLabel,
}: {
  flagship?: boolean;
  index?: number;
  className?: string;
  image: string;
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <article
      className={`glass-still hover-lift stagger-item group relative flex flex-col overflow-hidden rounded-2xl hover:border-brass/30 ${className}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div
        className={`relative w-full overflow-hidden ${flagship ? "h-56 md:h-72" : "h-28"}`}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover opacity-80 transition-transform duration-700 ease-qandeel motion-safe:group-hover:scale-[1.04]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-[#101E26] via-[#101E26]/45 to-transparent"
        />
      </div>
      <div className={`flex flex-col gap-3 p-6 ${flagship ? "md:p-8" : ""}`}>
        <h4
          className={`${elMessiri.className} font-semibold text-ivory ${flagship ? "text-3xl" : "text-xl"}`}
        >
          {title}
        </h4>
        <p className="text-sm leading-relaxed text-sage md:text-[15px]">
          {body}
        </p>
        <Link
          href={linkHref}
          className="mt-1 flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brass transition-all hover:gap-3.5 hover:text-ivory"
        >
          {linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------
   Support — sadaqah jariyah framed as sanctuary, not urgency.
   --------------------------------------------------------------- */
function Support() {
  return (
    <Reveal className="w-full">
      <section className="mx-auto w-full max-w-6xl px-6 md:px-8">
        <div className="glass-still relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between md:py-12">
          {/* lattice light entering from the panel's edge */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-56">
            <GirihField
              className="absolute inset-0"
              opacity={0.07}
              tile={56}
              fade="none"
            />
          </div>

          <div className="relative flex flex-col gap-3">
            <h2
              className={`${elMessiri.className} text-3xl font-bold text-ivory md:text-4xl`}
            >
              Fuel the <span className="text-brass">mission</span>
            </h2>

            <p className="max-w-xl text-balance text-base leading-relaxed text-sage md:text-lg">
              Maymanah is a non-profit sanctuary. Your contributions help us
              keep the divine word accessible to thousands of students
              worldwide, completely free of charge.
            </p>

            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-brass">
              <span className="h-px w-8 bg-linear-to-r from-transparent to-brass/60" />
              Sadaqah jariyah opportunity
            </p>
          </div>

          <Link
            href="/donate"
            className={buttonClasses("primary", "lg", "relative w-full shrink-0 sm:w-auto")}
          >
            <ButtonSheen />
            Donate
            <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </Reveal>
  );
}
