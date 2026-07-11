import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions about learning, teaching, or donating? Write to the Maymanah team — a small volunteer team reads every message personally, usually within two days.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Maymanah",
    description: "Write to the Maymanah team — we reply personally.",
    url: "/contact",
  },
};

const quickPaths = [
  {
    title: "Want to teach?",
    detail: "The application and vetting process, step by step.",
    href: "/teach",
    label: "Apply to teach",
  },
  {
    title: "Want to learn?",
    detail: "Create an account and get matched with a teacher.",
    href: "/register",
    label: "Begin your journey",
  },
  {
    title: "Want to help?",
    detail: "Keep the platform free for every student.",
    href: "/donate",
    label: "Donate",
  },
];

export default function Contact() {
  return (
    <main className="flex w-full flex-col items-center gap-14 pb-24">
      <PageHeader
        arabic="تَوَاصَلْ مَعَنَا"
        title="Write to us"
        lede="A small volunteer team runs Maymanah, and a person — not a ticket system — reads every message."
      />

      <Reveal className="w-full">
        <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 px-4 sm:px-6 md:grid-cols-2 md:px-8">
          <div className="glass-still flex flex-col gap-5 rounded-2xl p-6 md:p-8">
            <Mail className="size-5 text-brass" />
            <div className="flex flex-col gap-2">
              <h2
                className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
              >
                Email
              </h2>
              <p className="text-[15px] leading-relaxed text-sage">
                For questions about learning, teaching, donations, or anything
                else — one address reaches us all.
              </p>
            </div>
            <a
              href="mailto:support@maymanah.com"
              className={buttonClasses("primary", "md", "w-fit")}
            >
              <ButtonSheen />
              support@maymanah.com
            </a>
          </div>

          <div className="glass-still flex flex-col gap-5 rounded-2xl p-6 md:p-8">
            <Clock className="size-5 text-brass" />
            <div className="flex flex-col gap-2">
              <h2
                className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
              >
                When we reply
              </h2>
              <p className="text-[15px] leading-relaxed text-sage">
                We answer within two days, in shaa Allah. Session-related
                questions from enrolled students get priority through the
                portal&apos;s messaging instead.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-lapis transition-colors hover:text-ivory"
            >
              Already enrolled? Message your teacher
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal className="w-full">
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 md:px-8">
          <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-brass">
            Or go straight there
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {quickPaths.map((path) => (
              <div
                key={path.title}
                className="glass-still flex flex-col gap-2.5 rounded-2xl p-6 transition-colors duration-300 hover:border-brass/30"
              >
                <h3
                  className={`${elMessiri.className} text-lg font-semibold text-ivory`}
                >
                  {path.title}
                </h3>
                <p className="grow text-[13px] leading-relaxed text-sage">
                  {path.detail}
                </p>
                <Link
                  href={path.href}
                  className="flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brass transition-all hover:gap-3.5 hover:text-ivory"
                >
                  {path.label}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  );
}
