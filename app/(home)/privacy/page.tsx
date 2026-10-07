import type { Metadata } from "next";

import { MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Maymanah collects, why, and what you can ask us to delete.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy policy"
      lede="What we hold, why we hold it, and what you can ask us to remove."
    >
      <Section heading="What we collect">
        <ul className="flex flex-col gap-4">
          <li>
            <strong className="text-text-primary">Account details.</strong> Your name, email address, and a hashed
            password. We never store your password itself.
          </li>
          <li>
            <strong className="text-text-primary">Study records.</strong> What you have covered and how you are
            progressing, so a teacher can pick up where the last one left off.
          </li>
          <li>
            <strong className="text-text-primary">Session records.</strong> Which devices are signed in, so you can
            sign one out and see what has been accessed.
          </li>
          <li>
            <strong className="text-text-primary">Donation records.</strong> Only if you donate, kept because a
            financial record has to be.
          </li>
        </ul>
      </Section>

      <Section heading="What we do not do">
        <ul className="flex flex-col gap-4">
          <li>We do not sell your data, and we do not share it for advertising.</li>
          <li>We do not require two-factor authentication, though we recommend it.</li>
          <li>
            We do not record video sessions. Sessions are live only, and nothing is kept afterwards.
          </li>
        </ul>
      </Section>

      <Section heading="How long we keep things">
        <p>
          Study and account records are kept until you ask us to remove them. Records that a law requires us to keep,
          such as donation receipts, are kept for as long as that law requires.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          You can ask what we hold about you, ask for a copy, or ask for everything to be deleted. Deleting your
          account removes your study records and signs out every device. Write to{" "}
          <span className="text-text-primary">contact@maymanah.org</span> and we will action it.
        </p>
      </Section>
    </MarketingPage>
  );
}
