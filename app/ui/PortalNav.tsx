"use client";
import {
  BookOpen,
  Brain,
  GraduationCap,
  MessageCircle,
  Settings,
  Home,
  LogOut,
  Users,
  CalendarDays,
  Video,
  type LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { elMessiri } from "@/app/ui/fonts";
import { ThemeToggle } from "@/app/ui/theme-toggle";
import { useTopNavContent } from "@/lib/TopNavContext";
import { defaultAvatar } from "@/lib/avatar";


function ProfileDropdown({
  open,
  onClose,
  menuRef,
}: {
  open: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { data: session } = useSession();

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-2 mt-2 w-64 rounded-2xl border border-border bg-bg-elevated/95 backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            width={80}
            height={80}
            src={session?.user?.image || defaultAvatar(session?.user?.id)}
            alt="Profile"
            className="size-10 rounded-full ring-2 ring-border shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-text-primary truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-text-muted truncate mt-0.5">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
      <div className="p-1.5">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all"
        >
          <span className="flex items-center justify-center size-8 rounded-lg bg-bg-hover">
            <Settings className="size-4" />
          </span>
          Settings
        </Link>
        <button
          onClick={() => {
            onClose();
            signOut({ redirect: true, redirectTo: "/login" });
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/5 transition-all text-left"
        >
          <span className="flex items-center justify-center size-8 rounded-lg bg-bg-hover">
            <LogOut className="size-4" />
          </span>
          Log Out
        </button>
      </div>
    </div>
  );
}

export function TopNav() {
  const { content } = useTopNavContent();
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: session } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [profileOpen]);

  return (
    <header className="glass-veil fixed left-0 right-0 top-0 z-50 h-16">
      <div className="flex h-full items-center justify-between gap-4 px-6 border-b border-border">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            className="h-8 md:h-9 w-auto"
            width={413}
            height={279}
          />
          <span
            className={`${elMessiri.className} hidden text-lg font-semibold text-text-primary sm:inline leading-none !pt-1`}
          >
            Maymanah
          </span>
        </Link>

        {content && (
          <div className="flex-1 flex justify-center px-4">{content}</div>
        )}

        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              className={`flex items-center p-1 rounded-xl transition-all duration-200 ${
                profileOpen
                  ? "bg-bg-hover ring-1 ring-border"
                  : "hover:bg-bg-hover"
              }`}
              onClick={() => {
                setProfileOpen((prev) => !prev);
              }}
              aria-label="Profile menu"
            >
              <Image
                width={80}
                height={80}
                src={session?.user?.image || defaultAvatar(session?.user?.id)}
                alt="Profile"
                className="size-8 rounded-full ring-2 ring-border"
              />
            </button>
            <ProfileDropdown
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              menuRef={profileRef}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SideNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isUstadh = session?.user?.role === "TEACHER";

  const links: { name: string; href: string; icon: LucideIcon }[] = isUstadh
    ? [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Sessions", href: "/sessions", icon: Video },
        { name: "My Students", href: "/students", icon: Users },
        { name: "Messages", href: "/messages", icon: MessageCircle },
        { name: "Availability", href: "/availability", icon: CalendarDays },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Courses", href: "/courses", icon: GraduationCap },
        { name: "Mushaf", href: "/mushaf", icon: BookOpen },
        { name: "AI Revision", href: "/revision", icon: Brain },
      ];

  return (
    <>
      <aside className="group fixed bottom-0 left-0 top-16 z-40 hidden w-16 flex-col gap-1 border-r border-border bg-bg-primary/95 px-2 py-3 transition-[width] duration-200 ease-out hover:w-52 md:flex">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`relative flex h-11 items-center gap-3 overflow-hidden whitespace-nowrap rounded-[10px] ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
              title={link.name}
            >
              <span className="flex size-11 shrink-0 items-center justify-center">
                <link.icon className="size-4.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-0 transition-opacity delay-100 duration-150 group-hover:opacity-100">
                {link.name}
              </span>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </aside>

      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-bg-primary/95 px-2 md:hidden">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[10px] px-2 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <link.icon className="size-4.5" />
              <span className="max-w-full truncate text-[10px] font-medium leading-tight">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
