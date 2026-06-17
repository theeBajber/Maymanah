import Image from "next/image";
import { inter } from "./fonts";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export function Footer() {
  return (
    <footer className="w-full border-t bg-bg-secondary/20 border-border p-8 md:p-16 flex flex-col">
      <div className="flex w-full justify-between flex-col md:flex-row gap-4 md:gap-0 border-b border-border pb-8">
        <div className="flex flex-col gap-4">
          <Link
            href={"/"}
            className={`text-2xl ${inter.className} font-black flex items-center gap-2 cursor-pointer`}
          >
            <Image
              width={439}
              height={339}
              className="h-12 w-auto"
              src={"/logo.png"}
              alt=""
            />
            Maymanah
          </Link>
          <p className="text-text-secondary md:max-w-sm ">
            A non-profit initiative dedicated to preserving the tradition of
            Quranic transmission through technology.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={""}
              className="size-8 flex rounded-full border border-primary items-center justify-center hover:bg-primary group transition-colors"
            >
              <FontAwesomeIcon
                icon={faYoutube}
                className="size-4 text-primary group-hover:text-text-inverse transition-colors"
              />
            </Link>
            <Link
              href={""}
              className="size-8 flex rounded-full border border-primary items-center justify-center hover:bg-primary group transition-colors"
            >
              <FontAwesomeIcon
                icon={faInstagram}
                className="size-4 text-primary group-hover:text-text-inverse transition-colors"
              />
            </Link>
            <Link
              href={""}
              className="size-8 flex rounded-full border border-primary transition-colors items-center justify-center hover:bg-primary group"
            >
              <FontAwesomeIcon
                icon={faWhatsapp}
                className="size-4 text-primary group-hover:text-text-inverse transition-colors"
              />
            </Link>
            <Link
              href={""}
              className="size-8 flex rounded-full border border-primary items-center justify-center hover:bg-primary group transition-colors"
            >
              <FontAwesomeIcon
                icon={faXTwitter}
                className="size-4 text-primary group-hover:text-text-inverse transition-colors"
              />
            </Link>
          </div>
        </div>
        <div className="flex md:gap-16 gap-4 flex-col md:flex-row">
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="font-extrabold uppercase text-xl">Platform</h2>
            <div className="flex md:flex-col flex-wrap gap-2">
              <Link
                href={"/"}
                className="text-text-secondary hover:text-primary"
              >
                Home
              </Link>
              <Link
                href={"/teachers"}
                className="text-text-secondary hover:text-primary"
              >
                Find a teacher
              </Link>
              <Link
                href={"/teach"}
                className="text-text-secondary hover:text-primary"
              >
                Apply to teach
              </Link>
              <Link
                href={"/curriculum"}
                className="text-text-secondary hover:text-primary"
              >
                Learning Path
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="font-extrabold uppercase text-xl">Community</h2>
            <div className="flex md:flex-col flex-wrap gap-2">
              <Link
                href={"/donate"}
                className="text-text-secondary hover:text-primary"
              >
                Donate
              </Link>
              <Link
                href={"/gallery"}
                className="text-text-secondary hover:text-primary"
              >
                Gallery
              </Link>
              <Link
                href={"/stories"}
                className="text-text-secondary hover:text-primary"
              >
                Success Stories
              </Link>
              <Link
                href={"/contact"}
                className="text-text-secondary hover:text-primary"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between py-4">
        <span className="text-sm text-text-secondary">
          &copy; 2026 Maymanah Global. Teaching the Quran to the world.
        </span>
        <div className="flex items-center gap-4">
          <Link
            href={"/privacy"}
            className="text-text-secondary text-sm hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href={"/terms"}
            className="text-text-secondary text-sm hover:text-primary"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
