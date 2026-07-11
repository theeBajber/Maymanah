"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { elMessiri } from "@/components/ui/fonts";

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
    name: "Yasser Al-Dossari",
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

export function Reviews() {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(reviews.length / perPage);
  const visible = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
      <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2
            className={`${elMessiri.className} text-3xl font-semibold text-ivory md:text-4xl`}
          >
            Voices of the sanctuary
          </h2>
          <p className="text-sage">
            Reflections from those who have journeyed through our corridors
            and found clarity.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous reviews"
            className="flex size-10 items-center justify-center rounded-[10px] border border-ivory/15 text-sage transition-colors hover:border-brass/40 hover:text-ivory disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-semibold tabular-nums text-sage/70">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="Next reviews"
            className="flex size-10 items-center justify-center rounded-[10px] border border-ivory/15 text-sage transition-colors hover:border-brass/40 hover:text-ivory disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visible.map((review, index) => (
          <figure
            key={review.name}
            className="glass-still hover-lift stagger-item flex flex-col justify-between gap-8 rounded-2xl p-8 hover:border-brass/30 md:p-10"
            style={{ "--i": index } as React.CSSProperties}
          >
            <blockquote className="flex flex-col gap-5">
              <span
                aria-hidden
                className="h-px w-12 bg-linear-to-r from-brass/60 to-transparent"
              />
              <p
                className={`${elMessiri.className} text-xl leading-relaxed text-ivory/90 md:text-2xl`}
              >
                &ldquo;{review.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="flex items-center gap-4">
              <Image
                alt={`Portrait of ${review.name}`}
                width={225}
                height={225}
                className="size-13 rounded-full border border-brass/40 object-cover"
                src={review.portrait}
              />
              <div>
                <p className="font-semibold text-ivory">{review.name}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-brass">
                  {review.title}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === page ? "w-6 bg-brass" : "w-1.5 bg-ivory/20 hover:bg-ivory/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
