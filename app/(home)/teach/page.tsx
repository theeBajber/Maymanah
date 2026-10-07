import type { Metadata } from "next";
import Link from "next/link";

import { Callout, DetailList, MarketingPage, Section, Steps } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Teach with us",
  description:
    "Apply to teach Hifdh or Tajweed with Maymanah. Qualified volunteer teachers are vetted and matched with students worldwide.",
  alternates: { canonical: "/teach" },
};

export default function TeachPage() {
  return (
    <MarketingPage
      title="Teach with us"
      lede="If you are qualified to teach Hifdh or Tajweed, Maymanah brings you students who are ready to learn, and handles everything around the teaching."
    >
      <Section heading="What we ask">
        <Steps
          items={[
            {
              title: "You apply",
              body: "Tell us what you teach, to what level, and what you can commit. No account needed to apply.",
            },
            {
              title: "We review",
              body: "A person reads your application and checks your qualification and recitation. You are told either way, rather than left waiting.",
            },
            {
              title: "You are matched",
              body: "We pair you with a student at a level that suits you, in a time zone that suits you both.",
            },
            {
              title: "You teach",
              body: "You prepare against a shared curriculum and teach. Scheduling, payments, and tracking are ours.",
            },
          ]}
        />
      </Section>

      <Section heading="What you get">
        <DetailList
          items={[
            { term: "Students", detail: "People who have been assessed and are ready to learn, not first-time visitors." },
            { term: "Admin", detail: "Scheduling, payments, reminders, and progress records are handled by the platform." },
            { term: "Curriculum", detail: "A structured order to teach against, so you are not planning a syllabus from scratch." },
            { term: "Time", detail: "You choose your availability and how much you take on." },
            { term: "Payment", detail: "Teachers are paid for their time. This is not unpaid volunteering." },
          ]}
        />
      </Section>

      <Callout>
        <p>
          <strong>Applications are not open yet.</strong> This page describes how the process works. Teacher review and
          approval are still being built, so an application cannot be submitted today.
        </p>
        <p className="mt-3">
          Create a free account as a student in the meantime, or{" "}
          <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
            get in touch
          </Link>{" "}
          if you want to register interest in teaching.
        </p>
      </Callout>
    </MarketingPage>
  );
}
