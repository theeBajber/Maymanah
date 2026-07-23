"use client";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, HandHeart, Home, Info, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { elMessiri } from "@/components/ui/fonts";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";
import { GirihField } from "@/components/ui/girih";
import { useDrawerBehavior } from "@/lib/useDrawer";

const links = [
  { name: "Home", path: "/", icon: Home },
  { name: "Curriculum", path: "/curriculum", icon: BookOpen },
  { name: "About", path: "/about", icon: Info },
  { name: "Donate", path: "/donate", icon: HandHeart },
];

export function TopNav({ className = "" }: { className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`${className} sticky top-0 z-40 flex h-16 w-full items-center justify-between px-4 transition-[background-color,border-color,box-shadow] duration-300 lg:px-16 ${
        scrolled ? "glass-veil" : "border-b border-transparent bg-transparent"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt=""
          className="h-9 w-auto"
          width={439}
          height={339}
        />
        <span
          className={`${elMessiri.className} text-2xl font-semibold text-ivory leading-none !mt-2`}
        >
          Maymanah
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {links.map((link) => {
          const active = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative text-sm font-medium transition-colors ${
                active ? "text-brass" : "text-sage hover:text-ivory"
              }`}
            >
              {link.name}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-1/2 h-px w-4 -translate-x-1/2 bg-brass"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className={buttonClasses("primary", "sm")}>
              <ButtonSheen />
              Portal
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={buttonClasses("ghost", "sm")}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className={buttonClasses("primary", "sm")}>
              <ButtonSheen />
              Enroll
            </Link>
            <Link href="/login" className={buttonClasses("ghost", "sm")}>
              Log in
            </Link>
          </>
        )}
      </div>

      <button
        className="rounded p-1.5 text-ivory md:hidden"
        aria-label="Open menu"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="size-6" />
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
  useDrawerBehavior(true, onCloseAction);

  return (
    <div
      className="fixed inset-0 z-50 bg-layl-deep/70 md:hidden"
      onClick={onCloseAction}
      aria-hidden="true"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="glass-pane animate-slide-in fixed bottom-0 right-0 z-50 flex h-dvh w-[85%] max-w-100 flex-col gap-6 overflow-hidden rounded-l-2xl p-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20"
        >
          <GirihField
            className="absolute inset-0"
            opacity={0.08}
            tile={56}
            fade="bottom"
          />
        </div>
        <div className="relative flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              className="h-9 w-auto"
              width={439}
              height={339}
            />
            <span
              className={`${elMessiri.className} text-xl font-semibold text-ivory`}
            >
              Maymanah
            </span>
          </div>
          <button
            onClick={onCloseAction}
            aria-label="Close menu"
            className="rounded p-1.5 text-sage hover:text-ivory"
          >
            <X className="size-6" />
          </button>
        </div>
        <nav className="relative flex w-full flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={onCloseAction}
              className="flex h-13 w-full items-center gap-4 rounded-xl px-4 text-sm font-medium text-sage transition-colors hover:bg-ivory/5 hover:text-ivory"
            >
              <link.icon className="size-4.5 text-brass/70" />
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2.5">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={onCloseAction}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Portal
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={buttonClasses("ghost", "lg", "w-full")}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                onClick={onCloseAction}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Enroll now
              </Link>
              <Link
                href="/login"
                onClick={onCloseAction}
                className={buttonClasses("ghost", "lg", "w-full")}
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
