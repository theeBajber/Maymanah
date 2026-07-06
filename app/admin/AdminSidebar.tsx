"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  faHome,
  faBookOpen,
  faChalkboardUser,
  faUsers,
  faChartBar,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const links = [
  { name: "Dashboard", href: "/admin", icon: faHome },
  { name: "Courses", href: "/admin/courses", icon: faBookOpen },
  { name: "Teachers", href: "/admin/teachers", icon: faChalkboardUser },
  { name: "Users", href: "/admin/users", icon: faUsers },
  { name: "Analytics", href: "/admin/analytics", icon: faChartBar },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed left-0 top-16 bottom-0 w-16 border-r border-border bg-bg-primary/80 backdrop-blur-md hidden md:flex flex-col py-3 px-2 gap-1 z-40 group hover:w-52 transition-[width] duration-200 ease-out overflow-hidden">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
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

        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/dashboard"
            className="relative flex items-center gap-3 h-11 rounded-lg overflow-hidden whitespace-nowrap text-text-secondary hover:text-text-primary hover:bg-bg-hover"
            title="Back to Portal"
          >
            <span className="flex items-center justify-center size-11 shrink-0">
              <FontAwesomeIcon icon={faArrowLeft} className="size-5" />
            </span>
            <span className="text-xs tracking-widest font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100">
              Portal
            </span>
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
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg text-text-secondary hover:text-text-primary transition-colors min-w-0"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="size-5" />
          <span className="text-[10px] font-medium leading-tight truncate max-w-full">
            Portal
          </span>
        </Link>
      </nav>
    </>
  );
}
