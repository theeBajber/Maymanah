"use client";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faBell,
  faBookOpen,
  faBrain,
  faChalkboardUser,
  faCommentDots,
  faGear,
  faHome,
  faSignOut,
  faUsers,
  faCalendarDays,
  faVideo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { elMessiri } from "@/components/ui/fonts";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTopNavContent } from "@/lib/TopNavContext";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
  metadata: { link?: string } | null;
};

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
            src={session?.user?.image || "/portraits/pattern-6.png"}
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
            <FontAwesomeIcon icon={faGear} className="size-4" />
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
            <FontAwesomeIcon icon={faSignOut} className="size-4" />
          </span>
          Log Out
        </button>
      </div>
    </div>
  );
}

function NotificationDropdown({
  open,
  onClose,
  menuRef,
}: {
  open: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(
    null,
  );

  const typeIcons: Record<string, IconProp> = {
    session_reminder: faVideo,
    message: faBell,
    note_added: faChalkboardUser,
  };

  useEffect(() => {
    if (!open) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
      })
      .catch(() => setNotifications([]));
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) =>
      (prev ?? []).map((n) => ({ ...n, isRead: true })),
    );
  }

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-border bg-bg-elevated/95 backdrop-blur-xl shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications?.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="size-6 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
          >
            <FontAwesomeIcon icon={faXmark} className="size-4" />
          </button>
        </div>
      </div>
      {notifications === null ? (
        <div className="p-8 text-center text-sm text-text-muted">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="size-12 rounded-full bg-bg-hover flex items-center justify-center">
            <FontAwesomeIcon icon={faBell} className="size-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            No notifications yet
          </p>
          <p className="text-xs text-text-muted max-w-50">
            We&apos;ll let you know when something new arrives.
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => {
            const href =
              n.type === "message"
                ? session?.user?.role === "TEACHER"
                  ? "/messages"
                  : "/courses/hifdh-ul-quran"
                : "/courses/hifdh-ul-quran";

            return (
              <Link
                key={n.id}
                href={href}
                onClick={async () => {
                  if (!n.isRead) {
                    await fetch("/api/notifications/read", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids: [n.id] }),
                    });
                    setNotifications((prev) =>
                      (prev ?? []).map((x) =>
                        x.id === n.id ? { ...x, isRead: true } : x,
                      ),
                    );
                  }
                  onClose();
                }}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-bg-hover transition-colors ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FontAwesomeIcon
                    icon={typeIcons[n.type] ?? faBell}
                    className="size-3.5 text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${n.isRead ? "text-text-primary" : "font-semibold text-text-primary"}`}
                  >
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-text-muted mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const { content } = useTopNavContent();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = () =>
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.count ?? 0))
        .catch(() => {});
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);
  const { data: session } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notifOpen &&
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    if (profileOpen || notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [profileOpen, notifOpen]);

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
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
                if (!notifOpen) setUnreadCount(0);
              }}
              className="relative size-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all active:scale-95"
              aria-label="Notifications"
            >
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-warning ring-1 ring-bg-primary" />
              )}
              <FontAwesomeIcon icon={faBell} className="size-4" />
            </button>
            <NotificationDropdown
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              menuRef={notifRef}
            />
          </div>
          <div className="relative">
            <button
              className={`flex items-center p-1 rounded-xl transition-all duration-200 ${
                profileOpen
                  ? "bg-bg-hover ring-1 ring-border"
                  : "hover:bg-bg-hover"
              }`}
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              aria-label="Profile menu"
            >
              <Image
                width={80}
                height={80}
                src={session?.user?.image || "/portraits/pattern-6.png"}
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

  const links = isUstadh
    ? [
        { name: "Dashboard", href: "/dashboard", icon: faHome },
        { name: "Sessions", href: "/sessions", icon: faVideo },
        { name: "My Students", href: "/students", icon: faUsers },
        { name: "Messages", href: "/messages", icon: faCommentDots },
        { name: "Availability", href: "/availability", icon: faCalendarDays },
        { name: "Settings", href: "/settings", icon: faGear },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: faHome },
        { name: "Courses", href: "/courses", icon: faChalkboardUser },
        { name: "Mushaf", href: "/mushaf", icon: faBookOpen },
        { name: "AI Revision", href: "/revision", icon: faBrain },
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
                <FontAwesomeIcon icon={link.icon} className="size-4.5" />
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
              <FontAwesomeIcon icon={link.icon} className="size-4.5" />
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
