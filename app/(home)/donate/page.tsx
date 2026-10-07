import type { Metadata } from "next";
import Link from "next/link";

import { Callout, DetailList, MarketingPage, Section } from "@/app/ui/marketing";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Maymanah is funded by donations so that no student pays for Quranic instruction. Donate to cover the cost for someone else.",
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  return (
    <MarketingPage
      title="Fund the mission"
      lede="Maymanah is a non-profit. Donations cover the cost of running the platform, so no student is ever charged for instruction."
    >
      <Section heading="Where the money goes">
        <DetailList
          items={[
            { term: "Teacher time", detail: "The largest share. Teachers are paid for the sessions they give." },
            { term: "Platform costs", detail: "Hosting, video sessions, and storage for course material." },
            { term: "Review", detail: "Checking that a teacher is qualified before they are paired with a student." },
          ]}
        />
      </Section>

      <Section heading="How to give">
        <p>
          Card, M-Pesa, and bank transfer are all accepted. Recurring monthly donations are the most useful, because
          they let us plan a teacher&rsquo;s schedule a month ahead rather than week by week.
        </p>
      </Section>

      <Callout>
        <p>
          <strong>Payments are not connected yet.</strong> Card and M-Pesa checkout are still being built, so no money
          can be taken through this page today.
        </p>
        <p className="mt-3">
          If you would like to give now, email{" "}
          <span className="text-text-primary">contact@maymanah.org</span> or{" "}
          <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
            send us a message
          </Link>
          . Donations already received through other means fund current teaching.
        </p>
      </Callout>
    </MarketingPage>
  );
}
