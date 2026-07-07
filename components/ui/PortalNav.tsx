"use client";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsToDot,
  faBell,
  faBookOpen,
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTopNavContent } from "@/lib/TopNavContext";

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

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const typeIcons: Record<string, IconProp> = {
    session_reminder: faVideo,
    message: faBell,
    note_added: faChalkboardUser,
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
          {notifications.some((n) => !n.isRead) && (
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
      {loading ? (
        <div className="p-8 text-center text-sm text-text-muted">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="size-12 rounded-full bg-bg-hover flex items-center justify-center">
            <FontAwesomeIcon icon={faBell} className="size-5 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            No notifications yet
          </p>
          <p className="text-xs text-text-muted max-w-[200px]">
            We&apos;ll let you know when something new arrives.
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
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
                <p className={`text-sm ${n.isRead ? "text-text-primary" : "font-semibold text-text-primary"}`}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>
                )}
                <p className="text-[10px] text-text-muted mt-1">
                  {new Date(n.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.isRead && (
                <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          ))}
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

  const closeAll = () => {
    setProfileOpen(false);
    setNotifOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        <Link href={"/"} className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/logo.png"
            alt="Maymanah"
            className="h-8 md:h-9 w-auto"
            width={439}
            height={339}
          />
          <span className="hidden sm:inline text-2xl font-extrabold tracking-tight">
            Maymanah
          </span>
        </Link>

        {content && (
          <div className="flex-1 flex justify-center px-4">
            {content}
          </div>
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
              <span className="text-xs tracking-widest font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100">
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
