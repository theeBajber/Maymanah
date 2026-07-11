"use client";
import {
  BookOpen,
  Bell,
  Calendar,
  Compass,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { elMessiri } from "@/components/ui/fonts";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  metadata: { link?: string } | null;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, mutate } = useSWR<{ notifications: NotificationItem[]; unreadCount: number }>(
    "/api/user/notifications",
    fetcher,
    { refreshInterval: 60000 },
  );

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function markAllRead() {
    await fetch("/api/user/notifications", { method: "PATCH" });
    mutate();
  }

  async function handleNotificationClick(item: NotificationItem) {
    if (!item.isRead) {
      await fetch(`/api/user/notifications/${item.id}`, { method: "PATCH" });
      mutate();
    }
    setOpen(false);
    if (item.metadata?.link) {
      router.push(item.metadata.link);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative flex size-9 items-center justify-center rounded-[10px] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-2.5 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-text-inverse" />
        )}
        <Bell className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="glass-pane animate-slide-in absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl"
        >
          <div className="flex items-center justify-between border-b border-ivory/8 px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-light"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-text-secondary">
                No notifications yet.
              </p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex w-full flex-col gap-0.5 border-b border-ivory/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-bg-hover ${
                    item.isRead ? "" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.isRead && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className={`flex-1 text-sm ${item.isRead ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                      {item.title}
                    </span>
                  </div>
                  {item.body && (
                    <p className="pl-3.5 text-xs text-text-secondary line-clamp-2">{item.body}</p>
                  )}
                  <p className="pl-3.5 text-[11px] text-text-muted">{timeAgo(item.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
    <header className="glass-veil fixed left-0 right-0 top-0 z-50 h-16">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Maymanah"
            className="h-9 w-auto"
            width={439}
            height={339}
          />
          <span
            className={`${elMessiri.className} hidden text-lg font-semibold text-text-primary sm:inline`}
          >
            Maymanah
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <button
            className="flex items-center gap-2 rounded-[10px] py-1.5 pl-2 pr-3 transition-colors hover:bg-bg-hover"
            onClick={() => setPopUp(!popUp)}
            aria-label="Profile menu"
            aria-haspopup="menu"
            aria-expanded={popUp}
          >
            <Image
              width={404}
              height={398}
              src={session?.user?.image || "/portraits/pattern-6.png"}
              alt=""
              className="size-8 rounded-full ring-2 ring-border"
            />
          </button>
        </div>

        {popUp && (
          <div
            ref={popUpRef}
            role="menu"
            className="glass-pane animate-slide-in absolute right-4 top-16 w-56 overflow-hidden rounded-xl"
          >
            <div className="border-b border-ivory/8 px-4 py-3">
              <p className="truncate text-sm font-semibold text-text-primary">
                {session?.user?.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {session?.user?.email}
              </p>
            </div>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setPopUp(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <Settings className="size-4" />
              Settings
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                setPopUp(false);
                signOut({ redirect: true, redirectTo: "/login" });
              }}
              className="flex w-full items-center gap-2.5 border-t border-ivory/8 px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <LogOut className="size-4" />
              Log out
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
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Sessions", href: "/sessions", icon: Video },
        { name: "My Students", href: "/students", icon: Users },
        { name: "Availability", href: "/availability", icon: Calendar },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Courses", href: "/courses", icon: Compass },
        { name: "Mushaf", href: "/mushaf", icon: BookOpen },
        { name: "AI Revision", href: "/revision", icon: Sparkles },
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
