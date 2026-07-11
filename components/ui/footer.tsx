import Image from "next/image";
import Link from "next/link";
import { elMessiri } from "./fonts";

const platformLinks = [
  { name: "Home", href: "/" },
  { name: "Find a teacher", href: "/teachers" },
  { name: "Apply to teach", href: "/teach" },
  { name: "Learning Path", href: "/curriculum" },
];

const communityLinks = [
  { name: "Donate", href: "/donate" },
  { name: "Gallery", href: "/gallery" },
  { name: "Success Stories", href: "/stories" },
  { name: "Contact Us", href: "/contact" },
];

const socials = [
  {
    name: "YouTube",
    href: "",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z",
  },
  {
    name: "Instagram",
    href: "",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.89.07s-3.62-.01-4.89-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.62 2.2 15.24 2.2 12s0-3.62.07-4.89c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.38 2.2 8.76 2.2 12 2.2zm0 1.8c-3.16 0-3.53.01-4.77.07-1.08.05-1.66.23-2.05.38-.51.2-.88.44-1.26.82-.38.38-.62.75-.82 1.26-.15.39-.33.97-.38 2.05-.06 1.24-.07 1.61-.07 4.72s.01 3.48.07 4.72c.05 1.08.23 1.66.38 2.05.2.51.44.88.82 1.26.38.38.75.62 1.26.82.39.15.97.33 2.05.38 1.24.06 1.61.07 4.77.07s3.53-.01 4.77-.07c1.08-.05 1.66-.23 2.05-.38.51-.2.88-.44 1.26-.82.38-.38.62-.75.82-1.26.15-.39.33-.97.38-2.05.06-1.24.07-1.61.07-4.72s-.01-3.48-.07-4.72c-.05-1.08-.23-1.66-.38-2.05-.2-.51-.44-.88-.82-1.26a3.4 3.4 0 0 0-1.26-.82c-.39-.15-.97-.33-2.05-.38C15.53 4.01 15.16 4 12 4zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.95a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z",
  },
  {
    name: "WhatsApp",
    href: "",
    path: "M12 2a10 10 0 0 0-8.66 15L2 22l5.15-1.35A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.07-1.11l-.29-.17-3.06.8.82-2.98-.19-.31A8 8 0 1 1 12 20zm4.42-5.9c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28z",
  },
  {
    name: "X",
    href: "",
    path: "M18.24 2H21.5l-7.5 8.57L22.5 22h-6.98l-5.02-6.55L4.7 22H1.44l8.02-9.17L1.5 2h7.16l4.54 6.02L18.24 2z",
  },
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
              {socials.map((social) => {
                // No social accounts exist yet — render the mark without
                // a link rather than an href="" that silently reloads
                // the current page.
                if (!social.href) {
                  return (
                    <span
                      key={social.name}
                      aria-label={`${social.name} (coming soon)`}
                      className="cursor-default text-sage/30"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4.5"
                        aria-hidden
                      >
                        <path d={social.path} />
                      </svg>
                    </span>
                  );
                }
                return (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="text-sage/70 transition-colors hover:text-brass"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4.5"
                    aria-hidden
                  >
                    <path d={social.path} />
                  </svg>
                </Link>
                );
              })}
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
