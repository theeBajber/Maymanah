import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing use of Maymanah.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 pb-24 pt-16 md:pt-20">
      <header className="flex flex-col gap-3">
        <h1
          className={`${elMessiri.className} text-4xl font-semibold text-ivory md:text-5xl`}
        >
          Terms and Conditions
        </h1>
        <p className="text-sage">Last updated: April 22, 2026</p>
      </header>

      <article className="flex flex-col gap-12 text-[15px] leading-relaxed text-sage md:text-base">
        <section className="flex flex-col gap-4">
          <h2
            className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
          >
            1. Agreement to terms
          </h2>
          <span
            aria-hidden
            className="h-px w-12 bg-linear-to-r from-brass/50 to-transparent"
          />
          <p>
            By accessing or using Maymanah, you agree to be bound by these
            Terms and Conditions. If you disagree with any part of the terms,
            you may not access the service. These terms constitute a legally
            binding agreement made between you and Maymanah.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2
            className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
          >
            2. Educational use
          </h2>
          <span
            aria-hidden
            className="h-px w-12 bg-linear-to-r from-brass/50 to-transparent"
          />
          <p>
            The materials provided on this platform are for educational and
            spiritual growth purposes. You are granted a limited,
            non-exclusive, non-transferable license to access and use the
            curriculum for personal, non-commercial use.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Do not redistribute materials without explicit permission.",
              "Maintain respect for the sacred nature of the texts provided.",
              "Account sharing is strictly prohibited and may result in termination.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rotate-45 bg-brass/60"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2
            className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
          >
            3. User conduct
          </h2>
          <span
            aria-hidden
            className="h-px w-12 bg-linear-to-r from-brass/50 to-transparent"
          />
          <p>
            Users are expected to conduct themselves with adab (etiquette)
            within community forums and live sessions. Harassment, hate
            speech, or disruptive behavior will lead to immediate account
            suspension.
          </p>
        </section>
      </article>

      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-sm text-lapis transition-colors hover:text-ivory"
      >
        <ArrowLeft className="size-4" />
        Return to home
      </Link>
    </main>
  );
}
