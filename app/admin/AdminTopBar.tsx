"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { elMessiri } from "@/components/ui/fonts";
import { LogOut, Bell } from "lucide-react";

export function AdminTopBar({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user,
  pendingApprovals,
}: {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  pendingApprovals?: number;
}) {
  return (
    <header className="glass-veil fixed top-0 left-0 right-0 h-16 z-50">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-4">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Maymanah"
            className="h-9 w-auto"
            width={439}
            height={339}
          />
          <span
            className={`hidden sm:inline text-lg font-semibold text-primary tracking-tight ${elMessiri.className}`}
          >
            Maymanah
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-semibold text-text-muted bg-bg-hover px-2 py-0.5 rounded-md">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {pendingApprovals !== undefined && pendingApprovals > 0 && (
            <Link
              href="/admin/teachers"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-warning hover:bg-warning/5 transition-colors"
              title={`${pendingApprovals} pending teacher approval${pendingApprovals !== 1 ? "s" : ""}`}
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline text-xs font-medium">
                {pendingApprovals} pending
              </span>
              <span className="absolute -top-1 -right-1 size-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center sm:hidden">
                {pendingApprovals}
              </span>
            </Link>
          )}

          <button
            onClick={() => signOut({ redirect: true, redirectTo: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
