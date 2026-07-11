import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Maymanah collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
};

/* Legal pages: the quiet version of the theme — one readable column,
   no glass, no icons, generous leading. */

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
      >
        {title}
      </h2>
      <span
        aria-hidden
        className="h-px w-12 bg-linear-to-r from-brass/50 to-transparent"
      />
      {children}
    </section>
  );
}

function LegalItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-2 size-1.5 shrink-0 rotate-45 bg-brass/60"
      />
      <span>{children}</span>
    </li>
  );
}

export default function Privacy() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 pb-24 pt-16 md:pt-20">
      <header className="flex flex-col gap-3">
        <h1
          className={`${elMessiri.className} text-4xl font-semibold text-ivory md:text-5xl`}
        >
          Privacy Policy
        </h1>
        <p className="text-sage">
          Last updated: October 24, 2024. Your privacy is treated with the
          utmost reverence in our digital sanctuary.
        </p>
      </header>

      <article className="flex flex-col gap-12 text-[15px] leading-relaxed text-sage md:text-base">
        <LegalSection title="1. Information we collect">
          <p>
            We collect information to provide better services to all our
            users. We may collect the following types of information:
          </p>
          <ul className="flex flex-col gap-3">
            <LegalItem>
              <strong className="font-semibold text-ivory">
                Personal information:
              </strong>{" "}
              Name, email address, phone number, and demographic data.
            </LegalItem>
            <LegalItem>
              <strong className="font-semibold text-ivory">Usage data:</strong>{" "}
              Information on how you interact with our Services, including IP
              address, browser type, pages visited, and time spent on pages.
            </LegalItem>
            <LegalItem>
              <strong className="font-semibold text-ivory">
                Cookies and tracking:
              </strong>{" "}
              We use cookies to enhance your experience. You can instruct your
              browser to refuse all cookies.
            </LegalItem>
          </ul>
        </LegalSection>

        <LegalSection title="2. How we use information">
          <p>
            The information we collect is used in the following ways to
            enhance your experience within the sanctuary:
          </p>
          <ul className="flex flex-col gap-3">
            <LegalItem>To provide, maintain, and improve our Services.</LegalItem>
            <LegalItem>
              To personalize content and deliver targeted information relevant
              to your journey.
            </LegalItem>
            <LegalItem>
              To communicate with you, including responding to inquiries and
              providing updates.
            </LegalItem>
            <LegalItem>
              To monitor and analyze trends, usage, and activities.
            </LegalItem>
            <LegalItem>
              To detect, investigate, and prevent fraudulent transactions and
              other illegal activities to maintain the integrity of our
              platform.
            </LegalItem>
          </ul>
        </LegalSection>

        <LegalSection title="3. Sharing of information">
          <p>
            We do not sell, trade, or rent your personal identification
            information to others. We may share generic aggregated demographic
            information not linked to any personal identification information.
            We may share information with:
          </p>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-ivory">Service providers</h3>
              <p>
                Third-party vendors who assist us in operating our Service,
                conducting our business, or serving our users, so long as those
                parties agree to keep this information confidential.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-ivory">Legal requirements</h3>
              <p>
                We may disclose your information where required to do so by law
                or subpoena or if we believe that such action is necessary to
                comply with the law and the reasonable requests of law
                enforcement.
              </p>
            </div>
          </div>
        </LegalSection>

        <LegalSection title="4. Your rights">
          <p>
            You have certain rights regarding your personal data. Depending on
            your location, you may have the right to:
          </p>
          <ul className="flex flex-col gap-3">
            <LegalItem>
              Access the personal information we hold about you.
            </LegalItem>
            <LegalItem>
              Request correction of any inaccurate or incomplete data.
            </LegalItem>
            <LegalItem>
              Request deletion of your personal data under certain
              circumstances.
            </LegalItem>
            <LegalItem>
              Object to or restrict the processing of your personal data.
            </LegalItem>
          </ul>
          <p className="border-t border-ivory/8 pt-4">
            To exercise these rights, please contact us using the information
            provided in the{" "}
            <Link
              href="/contact"
              className="text-lapis transition-colors hover:text-ivory"
            >
              Contact Us
            </Link>{" "}
            section.
          </p>
        </LegalSection>
      </article>

      <Link
        href="/"
        className="flex w-fit items-center gap-2 text-sm text-lapis transition-colors hover:text-ivory"
      >
        <ArrowLeft className="size-4" />
        Return to home
      </Link>
    </main>
  );
}
