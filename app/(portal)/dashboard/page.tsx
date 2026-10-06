import Link from "next/link";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/session";
import { auth } from "@/lib/auth";
import { isLoginSessionActive } from "@/lib/session";
import { currentLoginSessionId } from "@/lib/session";
import { amiri } from "@/app/ui/fonts";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();

  // The cookie can outlive a device that has been signed out, so the record is
  // consulted before the page renders anything.
  const active = await isLoginSessionActive(currentLoginSessionId(session));
  if (!active) {
    return <SessionEnded />;
  }

  const user = await getCurrentUser(session);
  if (!user) return <SessionEnded />;

  return (
    <div className="w-full flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-text-tertiary">Dashboard</p>
        <h1 className={`text-4xl font-extrabold tracking-tight ${amiri.className}`}>
          As-salamu alaykum, {user.name.split(" ")[0]}
        </h1>
      </header>

      {!user.emailVerified ? (
        <div
          role="status"
          className="rounded-2xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm"
        >
          Your email address is not confirmed yet.{" "}
          <Link href="/settings" className="font-semibold underline underline-offset-4">
            Confirm it in settings
          </Link>{" "}
          so nothing you rely on is lost.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Role" value={user.role === "TEACHER" ? "Teacher" : user.role === "ADMIN" ? "Administrator" : "Student"} />
        <Stat label="Two-factor" value={user.twoFactorEnabled ? "On" : "Off"} />
        <Stat label="Points" value={String(user.xp)} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Coming next</h2>
        <p className="text-sm text-text-secondary">
          Your lessons, sessions and messages will appear here as they are built. Nothing to set up yet.
        </p>
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="text-sm font-semibold text-text-secondary hover:text-text-primary underline underline-offset-4"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl border border-border bg-bg-card p-5">
      <span className="text-xs font-semibold uppercase text-text-tertiary">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

/**
 * Shown when the cookie is valid but its device has been signed out.
 *
 * Offers a sign-out so the stale cookie is cleared, rather than leaving the
 * person on a page they can no longer use.
 */
function SessionEnded() {
  return (
    <div className="w-full max-w-md flex flex-col gap-6 text-center">
      <h1 className="text-2xl font-bold">This device has been signed out</h1>
      <p className="text-sm text-text-secondary">
        You can sign in again, or sign out first to clear this browser.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary font-bold text-text-inverse"
        >
          Sign in
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="text-sm font-semibold underline underline-offset-4">
            Clear this session
          </button>
        </form>
      </div>
    </div>
  );
}