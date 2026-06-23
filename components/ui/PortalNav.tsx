"use client";
import {
  faArrowsToDot,
  faBell,
  faBookOpen,
  faChalkboardUser,
  faGear,
  faHome,
  faSignOut,
  faUsers,
  faCalendarDays,
  faChevronDown,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TopNav() {
  const [popUp, setPopUp] = useState(false);
  const { data: session } = useSession();
  const popUpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popUpRef.current &&
        !popUpRef.current.contains(event.target as Node)
      ) {
        setPopUp(false);
      }
    };
    if (popUp) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [popUp]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <Link href={"/dashboard"} className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Maymanah"
            className="h-9 w-auto"
            width={439}
            height={339}
          />
          <span className="hidden sm:inline text-lg font-bold text-primary tracking-tight">
            Maymanah
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="relative size-9 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Notifications"
          >
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-danger" />
            <FontAwesomeIcon icon={faBell} className="size-4" />
          </button>
          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-bg-hover transition-colors"
            onClick={() => setPopUp(!popUp)}
            aria-label="Profile menu"
          >
            <Image
              width={404}
              height={398}
              src={session?.user?.image || "/portraits/pattern-6.png"}
              alt="Profile"
              className="size-8 rounded-full ring-2 ring-border"
            />
            <span className="hidden sm:inline text-sm font-medium text-text-primary max-w-24 truncate">
              {session?.user?.name}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`size-3 text-text-muted transition-transform ${popUp ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {popUp && (
          <div
            ref={popUpRef}
            className="absolute top-16 right-4 w-56 rounded-xl border border-border bg-bg-elevated shadow-lg shadow-black/5 animate-slide-in overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-sm text-text-primary truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-text-secondary truncate mt-0.5">
                {session?.user?.email}
              </p>
            </div>
            <Link
              href={"/settings"}
              onClick={() => setPopUp(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <FontAwesomeIcon icon={faGear} className="size-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                setPopUp(false);
                signOut({ redirect: true, redirectTo: "/login" });
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors text-left border-t border-border"
            >
              <FontAwesomeIcon icon={faSignOut} className="size-4" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function SideNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isUstadh = session?.user?.role === "TEACHER";

  const links = isUstadh
    ? [
        { name: "Dashboard", href: "/dashboard", icon: faHome },
        { name: "My Students", href: "/students", icon: faUsers },
        { name: "Availability", href: "/availability", icon: faCalendarDays },
        { name: "Settings", href: "/settings", icon: faGear },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: faHome },
        { name: "Sessions", href: "/sessions", icon: faVideo },
        { name: "Courses", href: "/courses", icon: faChalkboardUser },
        { name: "Mushaf", href: "/mushaf", icon: faBookOpen },
        { name: "AI Revision", href: "/revision", icon: faArrowsToDot },
      ];

  return (
    <>
      <aside className="fixed left-0 top-16 bottom-0 w-16 border-r border-border bg-bg-primary/80 backdrop-blur-md hidden md:flex flex-col py-3 px-2 gap-1 z-40 group hover:w-52 transition-[width] duration-200 ease-out">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`relative flex items-center gap-3 h-11 rounded-lg overflow-hidden whitespace-nowrap ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
              title={link.name}
            >
              <span className="flex items-center justify-center size-11 shrink-0">
                <FontAwesomeIcon icon={link.icon} className="size-5" />
              </span>
              <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100">
                {link.name}
              </span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-primary/90 backdrop-blur-md border-t border-border md:hidden z-40 flex items-center justify-around px-2 safe-area-bottom">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <FontAwesomeIcon icon={link.icon} className="size-5" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
