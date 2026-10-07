import type { Metadata } from "next";
import Link from "next/link";

import { Callout, MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Find a teacher",
  description: "How teachers on Maymanah are vetted, and how a student is matched with the right one.",
  alternates: { canonical: "/teachers" },
};

export default function TeachersPage() {
  return (
    <MarketingPage
      arabic="ابحث عن معلم"
      title="Find a teacher"
      lede="Every teacher is reviewed before they are paired with a student. Here is what that involves and how a match is made."
    >
      <Section heading="How teachers are vetted">
        <ul className="flex flex-col gap-4">
          <li className="flex gap-3">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
            <p>
              <strong className="text-text-primary">Qualification checked.</strong> A person reads the application and
              confirms the claimed qualification.
            </p>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
            <p>
              <strong className="text-text-primary">Recitation assessed.</strong> Not only credentials: the
              teacher&rsquo;s
              own recitation is heard and assessed.
            </p>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
            <p>
              <strong className="text-text-primary">Outcome either way.</strong> An applicant is told whether they were
              approved, and why, rather than being left waiting.
            </p>
          </li>
        </ul>
      </Section>

      <Section heading="How a match is made">
        <p>
          Matching accounts for three things: the level a student is actually at, the goal they are working towards,
          and a time zone where both can attend. A teacher who is right on recitation but three time zones away is a
          worse match than one who is slightly further along.
        </p>
        <p>
          If a pairing is not working, it is changed. That is a normal outcome rather than a failure, and it can be
          arranged without either person having to explain themselves.
        </p>
      </Section>

      <Callout>
        <p>
          <strong>Browsing teachers is not available yet.</strong> Teacher profiles and review are still being built.
        </p>
        <p className="mt-3">
          <Link href="/register" className="font-semibold text-primary underline underline-offset-4">
            Create an account
          </Link>{" "}
          to be matched when teacher reviews open, or{" "}
          <Link href="/teach" className="font-semibold text-primary underline underline-offset-4">
            apply to teach
          </Link>
          .
        </p>
      </Callout>
    </MarketingPage>
  );
}
