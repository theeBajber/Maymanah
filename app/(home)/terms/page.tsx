import type { Metadata } from "next";

import { MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for using Maymanah, as a student and as a teacher.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <MarketingPage
      title="Terms of service"
      lede="The agreement between you and Maymanah, on both sides of a session."
    >
      <Section heading="As a student">
        <ul className="flex flex-col gap-4">
          <li>Instruction is free. Donations cover it, and no student is charged.</li>
          <li>
            You are responsible for your own progress. The platform gives you a teacher and a plan; the practice is
            yours.
          </li>
          <li>
            Sessions you have booked are yours to keep or rearrange. Give notice where you can, so the teacher is not
            left waiting.
          </li>
        </ul>
      </Section>

      <Section heading="As a teacher">
        <ul className="flex flex-col gap-4">
          <li>
            You must hold a qualification we recognise. Approval is reviewed, and can be withdrawn if a concern is
            raised.
          </li>
          <li>
            You agree to teach in good faith, to keep records of what you cover, and to report a student&rsquo;s progress
            honestly, including when a student is not ready to move on.
          </li>
          <li>You are paid for sessions you deliver. Undelivered sessions are not.</li>
        </ul>
      </Section>

      <Section heading="Either side">
        <ul className="flex flex-col gap-4">
          <li>
            <strong className="text-text-primary">Respect.</strong> Harassment or abuse of any kind ends the
            relationship immediately and may end the account.
          </li>
          <li>
            <strong className="text-text-primary">Your data.</strong> Handled as described in the privacy policy.
          </li>
          <li>
            <strong className="text-text-primary">Changes.</strong> If these terms change in a way that affects you,
            we will tell you before it takes effect.
          </li>
        </ul>
      </Section>

      <Section heading="A note on this draft">
        <p>
          This is a working summary rather than a legal document. It describes how the platform is intended to work so
          that students and teachers know what they are agreeing to. It has not been reviewed by a lawyer and should
          not be relied on as one.
        </p>
      </Section>
    </MarketingPage>
  );
}
