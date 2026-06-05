"use client";
import { useState } from "react";
import {
  faBookOpen,
  faBrain,
  faChalkboard,
  faChevronLeft,
  faChevronRight,
  faClockRotateLeft,
  faGlobeAsia,
  faGraduationCap,
  faHandHoldingHeart,
  faHandshake,
  faPenToSquare,
  faQuoteLeft,
  faQuoteRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

const reviews = [
  {
    quote:
      "Maymanah didn't just teach me a skill, it offered a profound shift in how I perceive the intersection of tradition and technology.",
    name: "Idris Abkar",
    title: "Architect of Thought",
    portrait: "/portraits/abkar.jpg",
  },
  {
    quote:
      "The aesthetic alone induces a state of focus. The content depth is unparalleled in the current digital education landscape.",
    name: "YasserAl-Dossari",
    title: "Digital Ethicist",
    portrait: "/portraits/yasser.jpg",
  },
  {
    quote:
      "A sanctuary for the soul. Maymanah has transformed my relationship with the Quran in ways I never thought possible.",
    name: "Hazza Al-Balushi",
    title: "Student of Knowledge",
    portrait: "/portraits/balushi.jpg",
  },
  {
    quote:
      "The teachers here carry an ijazah chain that connects you to the earliest generations. That lineage is priceless.",
    name: "Maher Al-Muaiqly",
    title: "Recitation Scholar",
    portrait: "/portraits/maher.jpg",
  },
];

export default function About() {
  return (
    <main className="w-full flex flex-col pb-16 gap-16 *:sm:px-8 *:px-4">
      <Hero />
      <WhyItsFree />
      <HowItWorks />
      <Exellence />
      <Reviews />
    </main>
  );
}

function Hero() {
  return (
    <section className="flex flex-col items-center text-center gap-4 pt-16">
      <h1 className="text-5xl sm:text-6xl md:text-7xl max-w-4xl font-black">
        The Pursuit of <span className="text-primary">Divine Knowledge</span>
      </h1>
      <p className="text-xl w-full max-w-5xl text-text-secondary">
        Connecting students with teachers for the sake of Allah. Experience a
        sanctuary of focused learning, free from distractions.
      </p>
    </section>
  );
}

function WhyItsFree() {
  return (
    <section className="w-full bg-bg-secondary py-24 flex justify-center">
      <div className="max-w-7xl px-6 grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-bold">Why is it Free?</h2>
          <div className="h-0.5 w-24 bg-primary/50 rounded-full"></div>
          <div className="space-y-6 text-xl text-text-secondary leading-relaxed">
            <p>
              Maymanah operates on the principle of{" "}
              <span className="text-primary font-bold">Sadaqah Jariyah</span>{" "}
              (Voluntary ongoing charity). We believe that the teaching of the
              Quran is a prophetic mission that should never be commodified.
            </p>
            <p>
              Our platform is powered by the selfless devotion of volunteer
              teachers who seek reward from Allah alone. By removing the tuition
              fee, we ensure that a student&apos;s economic status never
              dictates their spiritual growth.
            </p>
          </div>
          <div className="pt-6 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faHandHoldingHeart}
                className="text-primary size-4!"
              />
              <span className="font-medium text-ivory">
                100% Volunteer Based
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faGlobeAsia}
                className="size-4! text-primary"
              />
              <span className="font-medium text-ivory">Global Reach</span>
            </div>
          </div>
        </div>
        <div className="bg-bg-card rounded-2xl p-10 border border-border-strong space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FontAwesomeIcon
              icon={faQuoteRight}
              className="text-primary size-18!"
            />
          </div>
          <h3 className="text-2xl font-bold text-gold">
            A Vision for the Ummah
          </h3>
          <p className="amiri-text text-xl italic text-text-secondary leading-relaxed">
            &quot;When a human being dies, his work comes to an end except for
            three things: ongoing charity, knowledge benefited from, or a
            righteous child who prays for him.&quot; (Sahih Muslim)
          </p>
          <p className="text-text-secondary tracking-wide">
            Every verse taught, every tajweed rule mastered, and every heart
            softened through our platform serves as a legacy for our teachers
            and supporters.
          </p>
        </div>
      </div>
    </section>
  );
}

function Exellence() {
  return (
    <section className="w-full bg-bg-secondary text-text-secondary py-24 flex justify-center">
      <div className="max-w-7xl px-6 w-full">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/3 text-left space-y-6">
            <h2 className="text-4xl font-bold text-primary">
              Verified Excellence
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed italic border-l-2 border-primary-dark pl-6">
              Quality is never sacrificed for cost. Every teacher at Maymanah
              undergoes a rigorous screening process to ensure authentic
              transmission of knowledge.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="flex gap-5 items-start">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-primary size-6!"
              />
              <div>
                <h4 className="text-text-primary text-xl font-bold mb-2">
                  Ijazah Verification
                </h4>
                <p className="leading-relaxed">
                  We verify the certifications and lineage of teachers to ensure
                  sound tajweed and knowledge.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <FontAwesomeIcon
                icon={faChalkboard}
                className="size-6! text-primary"
              />
              <div>
                <h4 className="text-text-primary text-xl font-bold mb-2">
                  Recitation Trial
                </h4>
                <p className="leading-relaxed">
                  Each candidate must pass a live recitation assessment with our
                  senior academic committee.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <FontAwesomeIcon
                icon={faBrain}
                className="text-primary size-6!"
              />

              <div>
                <h4 className="text-text-primary text-xl font-bold mb-2">
                  Pedagogical Review
                </h4>
                <p className="leading-relaxed">
                  We evaluate teaching styles to ensure they match our values of
                  patience and Rahmah.
                </p>
              </div>
            </div>
            <div className="flex gap-5 items-start">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="size-6! text-primary"
              />
              <div>
                <h4 className="text-text-primary text-xl font-bold mb-2">
                  Continuous Assessment
                </h4>
                <p className="leading-relaxed">
                  Regular feedback loops and training sessions keep our
                  educational standards world-class.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black tracking-tighter mb-6">
              <span className="text-primary">VOICES</span> OF THE SANCTUARY
            </h2>
            <p className="text-text-secondary tracking-wide">
              Reflections from those who have journeyed through our corridors
              and found clarity.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="size-4!" />
            </button>
            <span className="text-xs text-text-muted font-bold tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faChevronRight} className="size-4!" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visible.map((review: any) => (
            <div
              key={review.name}
              className="p-12 bg-bg-card rounded-xl border border-border flex flex-col justify-between group hover:border-primary/20 transition-all duration-500"
            >
              <div>
                <FontAwesomeIcon
                  icon={faQuoteLeft}
                  className="opacity-30 text-primary mb-6 size-12!"
                />
                <p className="text-2xl font-light text-text-secondary leading-snug italic">
                  &quot;{review.quote}&quot;
                </p>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <Image
                  alt={review.name}
                  width={225}
                  height={225}
                  className="w-16 h-16 rounded-full border-2 border-primary/40 object-cover"
                  src={review.portrait}
                />
                <div>
                  <p className="text-lg font-bold text-text-primary tracking-tight">
                    {review.name}
                  </p>
                  <p className="text-xs uppercase text-primary tracking-widest">
                    {review.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? "w-6 bg-primary" : "w-1.5 bg-primary/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-16 relative z-10">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-4">
          How It <span className="text-primary">Works</span>
        </h2>
        <p className="text-text-secondary text-lg">
          Join our global community in just four simple steps! Bismillah.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative">
        <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-border -z-10"></div>
        <div className="flex flex-col items-center text-center gap-6 flex-1 w-full">
          <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(26,96,112,0.3)] border border-border z-10">
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="text-primary size-6!"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Apply</h3>
            <p className="text-text-secondary text-sm max-w-62.5 mx-auto">
              Submit your application and set your goals and current level.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center gap-6 flex-1 w-full">
          <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(26,96,112,0.3)] border border-border z-10">
            <FontAwesomeIcon
              icon={faHandshake}
              className="text-primary size-6!"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Match</h3>
            <p className="text-text-secondary text-sm max-w-62.5 mx-auto">
              Get paired with a qualified teacher based on your specific needs.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center text-center gap-6 flex-1 w-full">
          <div className="w-20 h-20 rounded-full bg-bg-card flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(26,96,112,0.3)] border border-border z-10">
            <FontAwesomeIcon
              icon={faBookOpen}
              className="text-primary size-6!"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Learn</h3>
            <p className="text-text-secondary text-sm max-w-62.5 mx-auto">
              Start your sessions in our dedicated digital sanctuary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
