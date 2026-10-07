import type { Metadata } from "next";

import { MarketingPage, Section } from "@/app/ui/marketing";
import { AuthCard } from "@/app/ui/form";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Maymanah about teaching, donations, or anything else.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <MarketingPage
      title="Get in touch"
      lede="Questions about teaching, donations, or studying? Send a message and we will reply."
    >
      <div className="flex justify-center">
        <AuthCard title="Send a message">
          <ContactForm />
        </AuthCard>
      </div>

      <Section heading="Other ways to reach us">
        <p>
          Prefer email? Write to <span className="text-text-primary">contact@maymanah.org</span>. For anything
          involving a payment you have already made, include the reference from your receipt so we can find it.
        </p>
      </Section>
    </MarketingPage>
  );
}
