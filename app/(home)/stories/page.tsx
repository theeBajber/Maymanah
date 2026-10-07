import type { Metadata } from "next";
import Link from "next/link";

import { Callout, MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Success stories",
  description: "How students and teachers on Maymanah are progressing in Hifdh and Tajweed.",
  alternates: { canonical: "/stories" },
};

/**
 * Placeholder entries.
 *
 * Written as illustrative examples and labelled as such, because presenting
 * invented outcomes as though they were reported results would misrepresent who
 * the platform has actually served.
 */
const STORIES = [
  {
    name: "A student in Nairobi",
    detail: "Memorising since the age of seven, working through Hifdh with a teacher three time zones away.",
  },
  {
    name: "A teacher in Cairo",
    detail: "Qualified and willing, previously spending most of each week on scheduling rather than teaching.",
  },
  {
    name: "A family in Kuala Lumpur",
    detail: "Looking for Tajweed instruction within reach, and not finding any at an affordable price locally.",
  },
];

export default function StoriesPage() {
  return (
    <MarketingPage
      title="Success stories"
      lede="What progress looks like for students and teachers using the platform."
    >
      <Section heading="Illustrative examples">
        <div className="flex flex-col gap-6">
          {STORIES.map((story) => (
            <article key={story.name} className="flex flex-col gap-2 rounded-3xl border border-border bg-bg-card p-6">
              <h3 className="font-bold">{story.name}</h3>
              <p>{story.detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Callout>
        <p>
          These are placeholders, not reported outcomes. Real accounts will replace them once students and teachers
          have agreed to be named. Nothing here should be read as a claim about a specific person.
        </p>
        <p className="mt-3">
          <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
            Create a free account
          </Link>{" "}
          to begin.
        </p>
      </Callout>
    </MarketingPage>
  );
}
