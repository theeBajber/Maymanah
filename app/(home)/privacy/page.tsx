import {
  faArrowLeft,
  faClockRotateLeft,
  faCookieBite,
  faKey,
  faShare,
  faShieldHalved,
  faUserAlt,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Privacy() {
  return (
    <main className="w-full flex flex-col items-center pb-16 p-6 sm:p-8 gap-16 *:sm:px-8 *:px-4">
      <section className="space-y-6 text-center md:text-left w-full max-w-7xl">
        <h1 className="text-5xl md:text-7xl font-black text-tertiary leading-[0.95] tracking-tighter text-glow">
          Privacy Policy
        </h1>
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl font-light">
          Last updated: October 24, 2024. Your privacy is treated with the
          utmost reverence in our digital sanctuary.
        </p>
      </section>
      <article className="max-w-7xl space-y-16">
        <section className="space-y-6 p-10 bg-bg-card rounded-xl border border-primary/10 shadow-2xl shadow-black/50">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4">
            <FontAwesomeIcon
              icon={faShieldHalved}
              className="text-primary size-6!"
            />
            1. Information We Collect
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              We collect information to provide better services to all our
              users. We may collect the following types of information:
            </p>
            <ul className="list-none space-y-3 pl-2">
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faUserAlt}
                  className="text-primary size-4!"
                />
                <span>
                  <strong>Personal Information:</strong> Name, email address,
                  phone number, and demographic data.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="text-primary size-4!"
                />
                <span>
                  <strong>Usage Data:</strong> Information on how you interact
                  with our Services, including IP address, browser type, pages
                  visited, and time spent on pages.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faCookieBite}
                  className="text-primary size-4!"
                />
                <span>
                  <strong>Cookies and Tracking:</strong> We use cookies to
                  enhance your experience. You can instruct your browser to
                  refuse all cookies.
                </span>
              </li>
            </ul>
          </div>
        </section>
        <section className="space-y-6 p-10 bg-bg-card rounded-xl border border-primary/10 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-bold text-text-secondary tracking-tight flex items-center gap-4 relative z-10">
            <FontAwesomeIcon
              icon={faUserShield}
              className="text-primary size-6!"
            />
            2. How We Use Information
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed relative z-10">
            <p>
              The information we collect is used in the following ways to
              enhance your experience within the sanctuary:
            </p>
            <ul className="list-disc list-outside pl-6 space-y-2 marker:text-primary">
              <li>To provide, maintain, and improve our Services.</li>
              <li>
                To personalize content and deliver targeted information relevant
                to your journey.
              </li>
              <li>
                To communicate with you, including responding to inquiries and
                providing updates.
              </li>
              <li>To monitor and analyze trends, usage, and activities.</li>
              <li>
                To detect, investigate, and prevent fraudulent transactions and
                other illegal activities to maintain the integrity of our
                platform.
              </li>
            </ul>
          </div>
        </section>
        <section className="space-y-6 p-10 bg-bg-card rounded-xl border border-primary/10 shadow-2xl shadow-black/50">
          <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight flex items-center gap-4">
            <FontAwesomeIcon icon={faShare} className="text-primary size-6!" />
            3. Sharing of Information
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              We do not sell, trade, or rent your personal identification
              information to others. We may share generic aggregated demographic
              information not linked to any personal identification information.
              We may share information with:
            </p>
            <ul className="list-none space-y-4 mt-6">
              <li className="bg-bg-secondary p-6 rounded-lg border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                <h3 className="font-semibold mb-2">Service Providers</h3>
                <p className="text-sm">
                  Third-party vendors who assist us in operating our Service,
                  conducting our business, or serving our users, so long as
                  those parties agree to keep this information confidential.
                </p>
              </li>
              <li className="bg-bg-secondary p-6 rounded-lg border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                <h3 className="font-semibold mb-2">Legal Requirements</h3>
                <p className="text-sm">
                  We may disclose your information where required to do so by
                  law or subpoena or if we believe that such action is necessary
                  to comply with the law and the reasonable requests of law
                  enforcement.
                </p>
              </li>
            </ul>
          </div>
        </section>
        <section className="space-y-6 p-10 bg-bg-card rounded-xl border border-primary/10 shadow-2xl shadow-black/50">
          <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight flex items-center gap-4">
            <FontAwesomeIcon icon={faKey} className="text-primary size-6!" />
            4. Your Rights
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              You have certain rights regarding your personal data. Depending on
              your location, you may have the right to:
            </p>
            <ul className="list-disc list-outside pl-6 space-y-2 marker:text-primary">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of any inaccurate or incomplete data.</li>
              <li>
                Request deletion of your personal data under certain
                circumstances.
              </li>
              <li>
                Object to or restrict the processing of your personal data.
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t border-primary/10">
              To exercise these rights, please contact us using the information
              provided in the Contact Us section below.
            </p>
          </div>
        </section>
        <div className="text-center pt-12 pb-8">
          <Link
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-text-inverse font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform duration-300"
            href="/"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-4!" />
            Return to Home
          </Link>
        </div>
      </article>
    </main>
  );
}
