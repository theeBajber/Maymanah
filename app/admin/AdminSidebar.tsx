"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-16 bottom-0 w-60 border-r border-border bg-bg-primary/80 backdrop-blur-md hidden md:flex flex-col py-4 px-3 gap-1 z-40">
        <div className="px-3 pb-3 mb-2 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Management
          </p>
        </div>

        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <link.icon className="size-5 shrink-0" />
              {link.name}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <ArrowLeft className="size-5 shrink-0" />
            Back to Portal
          </Link>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-bg-primary/90 backdrop-blur-md border-t border-border md:hidden z-40 flex items-center justify-around px-2 safe-area-bottom">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              href={link.href}
              key={link.name}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <link.icon className="size-5" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="size-5" />
          <span className="text-[10px] font-medium">Portal</span>
        </Link>
      </nav>
    </>
  );
}
