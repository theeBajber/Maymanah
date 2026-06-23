"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut, User } from "lucide-react";
import type { UserRole } from "@prisma/client";

type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
};

export function AdminTopBar({ user }: { user: AdminUser }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-4">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
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
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-semibold text-text-muted bg-bg-hover px-2 py-0.5 rounded-md">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-secondary">
            <User className="size-4" />
            <span className="hidden sm:inline max-w-24 truncate">
              {user.name || user.email}
            </span>
          </div>
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
