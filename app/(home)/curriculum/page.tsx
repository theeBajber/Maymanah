import type { Metadata } from "next";
import Link from "next/link";

import { Callout, DetailList, MarketingPage, Section, Steps } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Learning path",
  description:
    "How Maymanah teaches Hifdh and Tajweed: one-to-one sessions with a qualified teacher, a structured order, and tracked progress.",
  alternates: { canonical: "/curriculum" },
};

/**
 * The order students move through.
 *
 * Kept as data rather than written into the markup so the same list can describe
 * a course later without being restated. A stage that is not yet available says
 * so explicitly rather than being quietly omitted, since a person planning their
 * studies needs to know what is coming.
 */
const STAGES = [
  {
    name: "Foundations",
    status: "available",
    body: "Tajweed fundamentals and the mechanics of recitation, so later work rests on a correct foundation rather than on habits picked up from imitation.",
  },
  {
    name: "Hifdh memorisation",
    status: "available",
    body: "Memorisation with weekly review built in. Retention is checked by recitation, not by marking pages as read.",
  },
  {
    name: "Mudaalliq (connected recitation)",
    status: "planned",
    body: "Linking what has been memorised into continuous recitation, with attention to the pauses and transitions that hold meaning.",
  },
  {
    name: "Advanced Tajweed",
    status: "planned",
    body: "The subtler rules, applied to real recitation with a teacher who can hear and correct what a recording cannot.",
  },
] as const;

export default function CurriculumPage() {
  return (
    <MarketingPage
      title="The learning path"
      lede="A structured order for Hifdh and Tajweed, taught one to one by a qualified teacher and tracked so progress is real rather than assumed."
    >
      <Section heading="How a student is taught">
        <Steps
          items={[
            {
              title: "You tell us where you are",
              body: "What you have already memorised, how you read, and what you want to reach. This sets the starting point, because two people at the same level often need different work.",
            },
            {
              title: "You are matched with a teacher",
              body: "Matching accounts for current level, target, and time zone, so sessions land at an hour you are awake for. Video sessions run on the platform, so nothing needs installing.",
            },
            {
              title: "You follow a plan",
              body: "Each session has an agreed focus. Your teacher prepares against a shared curriculum rather than improvising each week, which is what makes progress traceable.",
            },
            {
              title: "Progress is checked by recitation",
              body: "Completion is established by reciting correctly under instruction, not by ticking off material. If something is not yet secure, it stays on the list.",
            },
          ]}
        />
      </Section>

      <Section heading="The stages">
        <div className="flex flex-col gap-6">
          {STAGES.map((stage) => (
            <article
              key={stage.name}
              className="flex flex-col gap-2 rounded-3xl border border-border bg-bg-card p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold">{stage.name}</h3>
                {stage.status === "available" ? (
                  <span className="rounded-full bg-success-muted px-3 py-1 text-xs font-semibold text-text-secondary">
                    Available now
                  </span>
                ) : (
                  <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-semibold text-text-tertiary">
                    In development
                  </span>
                )}
              </div>
              <p>{stage.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section heading="What you need">
        <DetailList
          items={[
            { term: "Cost", detail: "Nothing. Tuition is paid for by donors, so no student is charged." },
            { term: "Time", detail: "One to two sessions a week is enough to make steady progress. Your plan is yours to set." },
            { term: "Equipment", detail: "A phone, tablet, or computer with a camera and a browser. Sessions run in the platform." },
            { term: "Language", detail: "Teachers teach in English and Arabic. Your preference is recorded when you register." },
            { term: "Commitment", detail: "Showing up. A missed session is rearranged, not lost." },
          ]}
        />
      </Section>

      <Callout>
        <p className="mb-3">
          <strong>Still in development.</strong> Stages marked as in development are described so you can see where
          the path is heading, but the sessions and assessments behind them are not built yet.
        </p>
        <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
          Create a free account
        </Link>{" "}
        and you will be told as each stage opens.
      </Callout>
    </MarketingPage>
  );
}