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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function TopNav({ children }: { children?: React.ReactNode }) {
  const [popUp, setPopUp] = useState(false);
  const { data: session } = useSession();
  const popUpRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
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
    <header className="w-full h-16 fixed top-0 left-0 bg-bg-primary px-4 flex items-center justify-between border-b border-border-strong gap-4">
      <Link
        href={"/"}
        className="text-xl text-primary font-extrabold uppercase flex items-center gap-2 w-40"
      >
        <Image
          src="/logo.png"
          alt="Maymanah"
          className="h-10 w-auto"
          width={439}
          height={339}
        />
        Maymanah
      </Link>
      <div
        className={`w-full flex items-center ${children ? "justify-between" : "justify-end"}`}
      >
        {children}
        <div className="flex items-center w-fit gap-4">
          <ThemeToggle />
          <button
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Notifications"
          >
            <FontAwesomeIcon icon={faBell} className="size-5" />
          </button>
          <button
            className="relative"
            onClick={() => setPopUp(!popUp)}
            aria-label="Profile menu"
          >
            <Image
              width={404}
              height={398}
              src={"/portraits/pattern-6.png"}
              alt="Profile"
              className="size-10 rounded-full hover:opacity-80 transition-opacity"
            />
          </button>
        </div>
      </div>
      {popUp && (
        <div
          ref={popUpRef}
          className="border border-border-strong rounded-xl absolute top-18 right-2 w-56 flex flex-col bg-bg-primary shadow-lg"
        >
          <div className="w-full py-3 px-4 border-b border-border flex flex-col gap-1">
            <p className="font-semibold text-text-primary">
              {session?.user?.name}
            </p>
            <p className="text-xs tracking-wider text-text-secondary">
              {session?.user?.email}
            </p>
          </div>
          <Link
            href={"/settings"}
            className="w-full py-2 px-4 hover:bg-bg-card transition-colors flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
          >
            <FontAwesomeIcon icon={faGear} className="size-4" />
            Settings
          </Link>
          <button
            onClick={() => {
              setPopUp(false);
              signOut({ redirect: true, redirectTo: "/login" });
            }}
            className="w-full py-2 px-4 hover:bg-bg-card transition-colors rounded-b-xl flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary text-left"
          >
            <FontAwesomeIcon icon={faSignOut} className="size-4" />
            Log Out
          </button>
        </div>
      )}
    </header>
  );
}

export function SideNav() {
  const { data: session } = useSession();
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
        { name: "Courses", href: "/courses", icon: faChalkboardUser },
        { name: "Mushaf", href: "/mushaf", icon: faBookOpen },
        { name: "AI Revision", href: "/revision", icon: faArrowsToDot },
      ];
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="h-[calc(100vh-64px)] w-16 border-r border-border bottom-0 fixed left-0 group hover:w-52 transition-[width] duration-300 ease-in-out hidden md:flex flex-col p-2 py-4 *:w-full overflow-hidden gap-2 z-20 bg-bg-primary">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.name}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:text-text-primary text-text-secondary relative"
          >
            <FontAwesomeIcon icon={link.icon} className="size-5 shrink-0" />
            <span className="text-sm uppercase tracking-widest font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              {link.name}
            </span>
          </Link>
        ))}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-primary border-t border-border-strong md:hidden z-30 flex items-center justify-around px-2">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.name}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors hover:text-text-primary text-text-secondary"
          >
            <FontAwesomeIcon icon={link.icon} className="size-5" />
            <span className="text-[10px] uppercase tracking-wider font-medium">
              {link.name}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
