"use client";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBookOpen,
  faChalkboardUser,
  faCircleInfo,
  faHandHoldingHeart,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const links = [
  { name: "Home", path: "/", icon: faChalkboardUser },
  { name: "Curriculum", path: "/curriculum", icon: faBookOpen },
  { name: "About", path: "/about", icon: faCircleInfo },
  { name: "Donate", path: "/donate", icon: faHandHoldingHeart },
];
export function TopNav({ className }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  return (
    <header
      className={`${className} w-full h-16 border-b sticky top-0 z-20 bg-bg-primary border-bg-elevated lg:px-16 px-4 flex justify-between items-center`}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Maymanah"
          className="h-10 w-auto"
          width={439}
          height={339}
        />
        <h1 className={`font-extrabold text-2xl`}>Maymanah</h1>
      </div>
      <nav className="md:flex items-center hidden gap-6">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.path}
            className="hover:text-primary font-semibold text-text-primary/80"
          >
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="md:flex hidden items-center gap-4">
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="w-24 h-9 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-2xl text-text-inverse font-semibold gap-2"
            >
              Portal
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-24 h-9 flex items-center justify-center hover:bg-secondary-subtle/20 border border-primary-dark/70 rounded-2xl font-semibold gap-2"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/register"
              className="w-23 h-9 flex items-center justify-center bg-primary hover:bg-primary-dark rounded-2xl text-text-inverse font-semibold"
            >
              Enroll
            </Link>
            <Link
              href="/login"
              className="w-23 h-9 flex items-center justify-center hover:bg-secondary-subtle/20 border border-primary-dark/70 rounded-2xl font-semibold"
            >
              Log In
            </Link>
          </>
        )}
      </div>
      <button
        className="md:hidden p-1"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <FontAwesomeIcon
          icon={faBars}
          style={{ width: "24px", height: "24px" }}
        />
      </button>
      {isMobileMenuOpen && (
        <MobileNav
          onCloseAction={() => setIsMobileMenuOpen(false)}
          isLoggedIn={isLoggedIn}
        />
      )}
    </header>
  );
}

export function MobileNav({
  onCloseAction,
  isLoggedIn,
}: {
  onCloseAction: () => void;
  isLoggedIn: boolean;
}) {
  const handleAsideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 md:hidden"
      onClick={onCloseAction}
      aria-hidden="true"
    >
      <aside
        onClick={handleAsideClick}
        className="h-dvh w-[85%] p-6 bg-bg-primary border-l border-border md:hidden flex flex-col gap-6 fixed bottom-0 right-0 max-w-100 z-40 animate-slide-in"
      >
        <div className="w-full flex justify-between items-center">
          <div className={`flex items-center gap-2 text-2xl font-extrabold`}>
            <Image
              src="/logo.png"
              alt="Maymanah"
              className="h-10 w-auto"
              width={439}
              height={339}
            />
            Maymanah
          </div>
          <button onClick={onCloseAction} className="p-1">
            <FontAwesomeIcon
              icon={faXmark}
              style={{ width: "24px", height: "24px" }}
            />
          </button>
        </div>
        <nav className="w-full flex flex-col gap-2 p-2">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.path}
              onClick={onCloseAction}
              className="w-full h-14 rounded-4xl text-sm px-6 bg-bg-card text-text-secondary flex items-center gap-4 font-bold uppercase tracking-widest hover:text-primary hover:translate-x-1.5 transition-all"
            >
              <FontAwesomeIcon icon={link.icon} className="size-5" />
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={onCloseAction}
                className="w-full h-12 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light transition-colors rounded-full text-text-inverse font-bold"
              >
                Portal
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full h-12 flex items-center justify-center gap-2 hover:bg-bg-hover transition-colors border border-primary-dark/70 rounded-full font-bold text-text-primary"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                onClick={onCloseAction}
                className="w-full h-12 flex items-center justify-center bg-primary hover:bg-primary-light transition-colors rounded-full text-text-inverse font-bold"
              >
                Enroll Now
              </Link>
              <Link
                href="/login"
                onClick={onCloseAction}
                className="w-full h-12 flex items-center justify-center hover:bg-bg-hover transition-colors border border-primary-dark/70 rounded-full font-bold text-text-primary"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
