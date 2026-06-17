import { amiri, inter } from "@/components/ui/fonts";
import {
  faBookOpen,
  faBrain,
  faLanguage,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Curriculum() {
  return (
    <main className="w-full flex flex-col pb-16 items-center gap-16 *:sm:px-8 *:px-4">
      <Hero />
      <Bento />
    </main>
  );
}

function Hero() {
  return (
    <section className="w-full pt-16 flex flex-col items-center gap-4 text-center">
      <h1 className={`font-black ${inter.className} text-5xl uppercase`}>
        <span className="text-primary">Curriculum</span> Built on Sanad
      </h1>
      <p className="text-xl text-text-secondary max-w-240">
        A structured, immersive journey through foundational Islamic knowledge.
        Progress from absolute beginner to advanced fluency in a high-focus
        environment.
      </p>
    </section>
  );
}

function Bento() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full max-w-7xl">
      <div className="group relative bg-bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 pt-8 overflow-hidden flex flex-col gap-6">
        <span className="px-3 py-2 absolute top-0 z-4 right-0 text-xs rounded-bl-2xl rounded-tr-2xl bg-primary font-semibold text-text-inverse">
          4 Levels
        </span>
        <div className="absolute hidden dark:block -right-12 -top-12 z-2 w-48 h-48 bg-secondary-subtle/50 rounded-full blur-3xl group-hover:bg-secondary-subtle/80 transition-colors duration-500 pointer-events-none"></div>
        <div className="flex items-center gap-4 z-4">
          <div className="w-14 h-14 rounded-full bg-primary-light text-text-inverse flex items-center justify-center border border-outline/20">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold w-fit">
            Tajweed &amp; Recitation
          </h2>
        </div>
        <p className="text-text-secondary leading-relaxed text-justify">
          Perfect your articulation and master the rules of recitation to read
          the Quran exactly as it was revealed.
        </p>
        <div className="grow flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-tertiary-fixed">
              L1
            </div>
            <span className="text-sm flex items-center gap-2">
              Foundational Articulation{" "}
              <span className={`text-lg ${amiri.className}`}>(مخارج)</span>
            </span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-tertiary-fixed">
              L2
            </div>
            <span className="text-sm">Rules of Noon &amp; Meem Sakinah</span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-tertiary-fixed">
              L3
            </div>
            <span className="text-sm">Advanced Madd &amp; Waqf Rules</span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
              L4
            </div>
            <span className="text-sm text-primary-light">
              Ijazah Preparation
            </span>
          </div>
        </div>
      </div>
      <div className="group relative bg-bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 pt-8 overflow-hidden flex flex-col gap-6">
        <span className="px-3 py-2 absolute top-0 right-0 text-xs rounded-bl-2xl rounded-tr-2xl bg-primary font-semibold text-text-inverse">
          Self-Paced
        </span>
        <div className="absolute  hidden dark:block z-0 -left-12 -bottom-12 w-48 h-48 bg-secondary-subtle/50 rounded-full blur-3xl group-hover:bg-secondary-subtle/80 transition-colors duration-500 pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-light text-text-inverse flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold w-fit">
            Memorization <span className={`${amiri.className}`}>(حفظ)</span>
          </h2>
        </div>
        <div>
          <p className="text-text-secondary leading-relaxed">
            A structured memorization program tailored to your capacity,
            focusing on retention and precise recall.
          </p>
        </div>
        <div className="grow flex flex-col z-4 gap-3 mt-4">
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-secondary-fixed">
              01
            </div>
            <span className="text-sm">Juz Amma &amp; Tabarak</span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-secondary-fixed">
              02
            </div>
            <span className="text-sm">First Third (10 Ajza)</span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-secondary-muted flex items-center justify-center text-xs font-bold text-secondary-fixed">
              03
            </div>
            <span className="text-sm">Second Third (20 Ajza)</span>
          </div>
          <div className="flex items-center gap-3 bg-bg-secondary dark:bg-bg-primary rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-primary-subtle flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
              04
            </div>
            <span className="text-sm text-primary-light">
              Complete Hifdh Certification
            </span>
          </div>
        </div>
      </div>
      <div className="group relative bg-bg-card border border-border rounded-xl md:p-8 p-4 sm:p-6 overflow-hidden flex flex-col gap-6 md:col-span-2">
        <div className="absolute hidden dark:block right-0 top-0 w-64 h-full bg-linear-to-l from-secondary-subtle/50 to-transparent pointer-events-none z-0"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center z-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-light text-text-inverse flex items-center justify-center">
                <FontAwesomeIcon icon={faLanguage} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold">
                Arabic Language
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Bridge the gap between reading and understanding. Learn classical
              Arabic to comprehend the Quran directly.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bg-secondary dark:bg-bg-primary rounded-xl p-5 flex flex-col gap-2">
              <span className="text-xs tracking-widest text-secondaryuppercase font-bold">
                Level 1
              </span>
              <h3 className="font-bold">Alphabet &amp; Basic Syntax</h3>
              <p className="text-xs text-text-secondary">
                Mastering the script, vocabulary building, and nominal
                sentences.
              </p>
            </div>
            <div className="bg-bg-secondary dark:bg-bg-primary rounded-xl p-5 flex flex-col gap-2">
              <span className="text-xs tracking-widest text-secondary-fixed uppercase font-bold">
                Level 2
              </span>
              <h3 className="font-bold flex items-center gap-2">
                Morphology <span className={`${amiri.className}`}>(صرف)</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Understanding verb patterns, root words, and derivations.
              </p>
            </div>
            <div className="bg-bg-secondary dark:bg-bg-primary rounded-xl p-5 flex flex-col gap-2">
              <span className="text-xs tracking-widest text-secondary-fixed uppercase font-bold">
                Level 3
              </span>
              <h3 className="font-bold flex items-center gap-2">
                Grammar <span className={`${amiri.className}`}>(نحو)</span>
              </h3>
              <p className="text-xs text-text-secondary">
                Complex sentence structures, case endings, and verbal sentences.
              </p>
            </div>
            <div className="bg-bg-secondary dark:bg-bg-primary rounded-xl p-5 flex flex-col gap-2 border-l-4 border-l-primary">
              <span className="text-xs tracking-widest text-primary uppercase font-bold">
                Level 4
              </span>
              <h3 className="font-bold">Quranic Analysis</h3>
              <p className="text-xs text-text-secondary">
                Applying grammar and morphology directly to Quranic texts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
