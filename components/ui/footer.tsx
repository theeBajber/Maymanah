import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { elMessiri } from "./fonts";

const platformLinks = [
  { name: "Home", href: "/" },
  { name: "Apply to teach", href: "/teach" },
  { name: "Learning Path", href: "/curriculum" },
];

const communityLinks = [
  { name: "Donate", href: "/donate" },
  { name: "Success Stories", href: "/stories" },
  { name: "Contact Us", href: "/contact" },
];

const socials = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/maymanah.org_",
    icon: faInstagram,
  },
  { name: "WhatsApp", href: "https://wa.me/254743222383", icon: faWhatsapp },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-layl-deep">
      {/* brass light-leak divider */}
      <div
        aria-hidden
        className="h-px w-full bg-linear-to-r from-transparent via-brass/40 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col px-8 py-12 md:py-16">
        <div className="flex w-full flex-col justify-between gap-10 border-b border-ivory/8 pb-10 md:flex-row">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex w-fit items-center gap-2.5">
              <Image
                width={439}
                height={339}
                className="h-11 w-auto"
                src="/logo.png"
                alt=""
              />
              <span
                className={`${elMessiri.className} text-2xl font-semibold text-ivory`}
              >
                Maymanah
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-sage">
              A non-profit initiative dedicated to preserving the tradition of
              Quranic transmission through technology.
            </p>
            <div className="mt-1 flex items-center gap-5">
              {socials.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="text-sage/70 transition-colors hover:text-brass"
                >
                  <FontAwesomeIcon icon={social.icon} className="size-4.5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row md:gap-20">
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                Platform
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 sm:flex-col">
                {platformLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-sage transition-colors hover:text-ivory"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                Community
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 sm:flex-col">
                {communityLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-sage transition-colors hover:text-ivory"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-4 pt-6 md:flex-row">
          <span className="text-[13px] text-sage/70">
            &copy; 2026 Maymanah Global. Teaching the Quran to the world.
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[13px] text-sage/70 transition-colors hover:text-ivory"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[13px] text-sage/70 transition-colors hover:text-ivory"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
