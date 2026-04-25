import { Globe } from "lucide-react";
import { amiri } from "../ui/fonts";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faQuoteRight,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <main className="w-full flex flex-col pb-16 items-center gap-16 *:px-8">
      <Hero />
      <Hadith />
      <Principles />
      <Support />
    </main>
  );
}

function Hero() {
  return (
    <section className="w-full flex items-center justify-center bg-[linear-gradient(to_bottom,transparent_0%,#fdfcf8cc_60%,#fdfcf8f2_95%,#fdfcf8ff_100%),url('/pattern-light.png')] bg-no-repeat dark:bg-[linear-gradient(to_bottom,transparent_0%,#0d151733_60%,#0d1517cc_95%,#0d1517ff_100%),url('/pattern.png')] bg-bg-primary bg-cover bg-top py-16">
      <div className="grid lg:grid-cols-2 grid-cols-1 items-center gap-16 w-full max-w-7xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 rounded-full bg-secondary-subtle/70 border-border w-fit py-2 px-4 text-primary">
            <Globe className="size-4" />
            <span className="text-xs font-semibold uppercase">
              A Global Spiritual Sanctuary
            </span>
          </div>
          <h1 className={`text-6xl md:text-8xl font-extrabold tracking-tight`}>
            The Quran
            <br />
            <span className="text-primary">Without Borders.</span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg text-text-secondary">
            Rahiq connects expert volunteer teachers with dedicated students
            worldwide, transcending geography to bring Quranic excellence to
            every home.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href={"/register"}
              className="sm:w-56 w-full h-16 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-3xl text-lg font-bold text-text-inverse"
            >
              Get Started Free
            </Link>
            <Link
              href={"/teach"}
              className="sm:w-56 h-16 w-full flex items-center justify-center hover:bg-secondary-subtle/30 bg-secondary-subtle/20 border-2 border-border-strong rounded-3xl text-lg font-bold"
            >
              Apply To Teach
            </Link>
          </div>
          <div className="flex items-center -space-x-3">
            <Image
              src="/portraits/balushi.jpg"
              width={400}
              height={400}
              className="size-12 rounded-full border border-border"
              alt=""
            />
            <Image
              src="/portraits/yasser.jpg"
              width={320}
              height={320}
              className="size-12 rounded-full border border-border"
              alt=""
            />
            <Image
              src="/portraits/sudais.png"
              width={512}
              height={512}
              className="size-12 rounded-full border border-border"
              alt=""
            />
            <Image
              src="/portraits/maher.jpg"
              width={640}
              height={640}
              className="size-12 rounded-full border border-border"
              alt=""
            />
            <Image
              src="/portraits/abkar.jpg"
              width={225}
              height={225}
              className="size-12 rounded-full border border-border"
              alt=""
            />
            <div className="size-12 rounded-full border border-border bg-secondary-subtle font-bold text-xs flex items-center justify-center">
              15K+
            </div>
          </div>
        </div>
        <div className="w-full aspect-square rounded-[2.5rem] relative overflow-hidden border-4 border-secondary-muted">
          <Image
            src="/map.png"
            width={512}
            height={512}
            loading="eager"
            alt=""
            className="w-full h-full grayscale brightness-75 opacity-90"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-color"></div>
          <div className="absolute inset-0 flex justify-center items-center p-4">
            <div className="bg-bg-card border border-primary-dark/50 rounded-xl p-5 w-64 h-24 flex items-center gap-6 shadow-2xl">
              <FontAwesomeIcon
                icon={faVideo}
                className="size-12 text-primary"
              />
              <div className="flex flex-col gap-px">
                <div className="font-bold tracking-widest uppercase text-xs text-primary">
                  Live Session
                </div>
                <div className="font-extrabold">Ustadh Issa</div>
                <div className="flex items-center text-xs text-text-secondary gap-2">
                  <div className="size-2 animate-pulse bg-secondary rounded-full" />
                  Cairo, Egypt
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hadith() {
  return (
    <section className="w-full max-w-4xl flex flex-col items-center gap-6 relative p-8">
      <FontAwesomeIcon
        icon={faQuoteRight}
        className="text-primary-dark/30 size-12! absolute md:top-0 -top-8 left-8 rotate-180"
      />
      <h2
        className={`${amiri.className} text-4xl md:text-5xl text-center leading-loose font-bold text-primary`}
      >
        خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
      </h2>
      <div className="h-px w-24 bg-linear-to-r from-transparent via-primary to-transparent"></div>
      <p className="text-2xl font-semibold text-center text-text-secondary italic">
        &quot;The best of you are those who learn the Quran and teach it.&quot;
      </p>
      <div className="font-semibold uppercase text-primary-dark tracking-wide flex items-center gap-2">
        Prophet Muhammad <span className="text-2xl pb-1">(ﷺ)</span>
      </div>
      <FontAwesomeIcon
        icon={faQuoteRight}
        className="text-primary-dark/30 size-12! absolute md:bottom-0 -bottom-8 right-8"
      />
    </section>
  );
}

function Principles() {
  return (
    <section className="w-full max-w-7xl flex flex-col gap-16">
      <div className="w-full flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-xs tracking-widest font-bold text-primary uppercase">
            Core Principles
          </h2>
          <h3 className="text-5xl lg:text-6xl leading-tight text-text-primary font-extrabold tracking-tight">
            Connecting Hearts <br /> Through Revelation.
          </h3>
        </div>
        <p className="text-xl md:max-w-md leading-relaxed text-text-secondary">
          We provide the digital sanctuary. You provide the heart and the
          dedication to master the Book of Allah.
        </p>
      </div>
      <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-2 md:grid-rows-2 gap-8 min-h-150  *:bg-bg-card *:rounded-2xl *:border *:transition-colors *:border-border *:hover:border-primary-dark">
        <div className="md:row-span-2 flex flex-col justify-end gap-6 relative p-6 group overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-[url(/sunset_mosque.png)] invert-0 bg-cover bg-no-repeat bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50"
            aria-hidden="true"
          />
          <h4 className="text-3xl z-4 invert-100 dark:invert-0 font-black text-text-primary">
            1-on-1 Sessions
          </h4>
          <p className="text-lg z-4 text-text-secondary invert-100 dark:invert-0">
            Dedicated time with vetted teachers to master Tajweed and Hifdh at
            your own speed. Experience a personalized curriculum tailored to
            your specific spiritual goals and learning pace.
          </p>
          <Link
            href={"/curriculum"}
            className="uppercase z-4 w-fit text-sm font-semibold tracking-wide text-text-primary invert-100 dark:invert-0 hover:invert-0 flex items-center gap-2 hover:gap-4 hover:text-primary-dark transition-all"
          >
            Explore learning paths
            <FontAwesomeIcon icon={faArrowRight} className="size-4" />
          </Link>
        </div>
        <div className="relative h-full w-full group p-6 flex flex-col justify-end gap-4 overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-[url(/tower_masjid.png)] bg-cover bg-no-repeat bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50"
            aria-hidden="true"
          />
          <h4 className="text-2xl z-4 font-black text-text-primary invert-100 dark:invert-0">
            Universal Access
          </h4>
          <p className="text-lg z-4 text-text-secondary invert-100 dark:invert-0">
            Our global network ensures that sessions are available across every
            timezone, 24/7.
          </p>
          <Link
            href={"/about"}
            className="uppercase z-4 w-fit text-sm font-semibold tracking-wide text-text-primary invert-100 dark:invert-0 hover:invert-0 flex items-center gap-2 hover:gap-4 hover:text-primary-dark transition-all"
          >
            Learn More
            <FontAwesomeIcon icon={faArrowRight} className="size-4" />
          </Link>
        </div>
        <div className="relative h-full w-full group p-6 flex flex-col justify-end gap-4 overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-[url(/calligraphy.png)] bg-cover bg-no-repeat bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/90 group-hover:via-black/50"
            aria-hidden="true"
          />
          <h4 className="text-2xl z-4 font-black text-text-primary invert-100 dark:invert-0">
            Vetted Teachers
          </h4>
          <p className="text-lg text-text-secondary z-4 invert-100 dark:invert-0">
            Each teacher undergoes rigorous evaluation of recitation and
            pedagogy to ensure quality.
          </p>
          <Link
            href={"/teachers"}
            className="uppercase z-4 w-fit text-sm font-semibold tracking-wide text-text-primary invert-100 dark:invert-0 hover:invert-0 flex items-center gap-2 hover:gap-4 hover:text-primary-dark transition-all"
          >
            Find a teacher
            <FontAwesomeIcon icon={faArrowRight} className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section className="w-full max-w-7xl px-8">
      <div className="w-full bg-bg-card rounded-2xl md:p-16 p-8 flex flex-col md:flex-row justify-between gap-8 md:items-center">
        <div className="flex flex-col gap-4">
          <h2
            className={`uppercase font-extrabold tracking-tighter text-4xl md:text-5xl`}
          >
            Fuel The <span className="text-primary text-justify">Mission</span>
          </h2>
          <p className="text-lg md:max-w-2xl text-text-secondary text-justify">
            Rahiq is a non-profit sanctuary. Your contributions help us keep the
            divine word accessible to thousands of students worldwide,
            completely free of charge.
          </p>
          <p className="flex items-center text-primary-dark tracking-widest text-xs uppercase gap-4 font-extrabold">
            <span className="w-8 h-px bg-linear-to-tr from-transparent via-primary-dark to-transparent"></span>
            Sadaqah Jariah Opportunity
          </p>
        </div>
        <Link
          href={"/donate"}
          className="bg-primary hover:bg-primary-dark text-text-inverse flex items-center justify-center w-full sm:w-44 h-14 rounded-2xl uppercase font-bold tracking-widest gap-2  transition-all"
        >
          Donate
          <FontAwesomeIcon icon={faArrowRight} className="size-4" />
        </Link>
      </div>
    </section>
  );
}
