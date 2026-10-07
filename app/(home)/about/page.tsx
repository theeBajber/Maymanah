import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Callout, MarketingPage, Section, Steps } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "About Maymanah",
  description:
    "Maymanah connects volunteer Quran teachers with students worldwide so that structured Hifdh and Tajweed instruction is available regardless of location or income.",
  alternates: { canonical: "/about" },
};

/** Illustrative only. These are not accounts of real people. */
const COMMUNITY = [
  { name: "Anwar Balushi", src: "/portraits/balushi.jpg" },
  { name: "Yasser Al-Din", src: "/portraits/yasser.jpg" },
  { name: "Sudais", src: "/portraits/sudais.png" },
  { name: "Maher", src: "/portraits/maher.jpg" },
  { name: "Abkar", src: "/portraits/abkar.jpg" },
];

export default function AboutPage() {
  return (
    <MarketingPage
      title="The Quran without borders"
      lede="Maymanah exists so that where someone lives, and what they can afford, does not decide whether they can learn the Quran properly."
    >
      <Section heading="The problem">
        <p>
          Learning the Quran properly needs a qualified teacher. In most places there is no local teacher available at
          an accessible price, which leaves people with unverified material online or no instruction at all.
        </p>
        <p>
          Self-study is also hard to sustain. There is no curriculum, no accountability, and no honest way to tell
          whether progress is real. Meanwhile the teachers who are willing to teach end up spending their time on
          scheduling, payments, and progress tracking rather than on teaching.
        </p>
      </Section>

      <Section heading="What we do about it">
        <Steps
          items={[
            {
              title: "A vetted teacher",
              body: "Teachers are reviewed before they are paired with a student, so instruction comes from someone qualified rather than from whoever happened to be online.",
            },
            {
              title: "A structured curriculum",
              body: "Sessions follow a shared order instead of being improvised week to week. That is what makes progress something you can see rather than something you hope for.",
            },
            {
              title: "Scheduling and payments handled",
              body: "Availability, bookings, and fees are managed by the platform. Teachers teach; students learn; neither has to run the admin.",
            },
          ]}
        />
      </Section>

      <Section heading="Who it is for">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              role: "Students",
              body: "Anywhere in the world, any financial background. The goal is that Quranic education is free to access.",
            },
            {
              role: "Teachers",
              body: "Qualified teachers who want students without having to run their own scheduling and administration.",
            },
            {
              role: "Donors",
              body: "People and organisations funding the platform so that students pay nothing.",
            },
          ].map((item) => (
            <article key={item.role} className="flex flex-col gap-2 rounded-3xl border border-border bg-bg-card p-6">
              <h3 className="font-bold">{item.role}</h3>
              <p className="text-sm">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section heading="A community of teachers">
        <p>Placeholder portraits, standing in for the teachers who will make up the community.</p>
        <ul className="flex flex-wrap gap-4 pt-2">
          {COMMUNITY.map((person) => (
            <li key={person.name} className="flex flex-col items-center gap-2 w-28">
              <Image
                src={person.src}
                alt=""
                width={112}
                height={112}
                className="size-24 rounded-full object-cover border border-border"
              />
              <span className="text-xs text-text-tertiary text-center">{person.name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Callout>
        <p>
          Maymanah is a non-profit. Nothing on this site costs a student anything.
        </p>
        <p className="mt-3">
          <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
            Create an account
          </Link>{" "}
          to be matched with a teacher, or{" "}
          <Link href="/donate" className="font-semibold text-primary underline underline-offset-4">
            donate
          </Link>{" "}
          to cover the cost for someone else.
        </p>
      </Callout>
    </MarketingPage>
  );
}