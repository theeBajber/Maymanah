import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GlassCard } from "@/app/ui/glass";
import { auth } from "@/lib/auth";
import { currentLoginSessionId, getCurrentUser, isLoginSessionActive } from "@/lib/session";
import { standingLabel } from "@/lib/standing";

import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "Account status",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const EXPLANATIONS: Record<string, string> = {
  GOOD: "Your account is in good standing and nothing needs doing.",
  WARNED:
    "Some sessions you were expected at were missed. This is a warning: you can keep attending and booking as usual, but repeated absences may pause new bookings.",
  PAUSED:
    "New bookings are paused because of repeated missed sessions. Your existing lessons and course access continue, and you can still join sessions that are already scheduled.",
  DISABLED:
    "Your account has been disabled because of repeated missed sessions. You can sign in only to see this page, and you cannot book or join sessions.",
};

/**
 * Where a signed-in account reads its standing.
 *
 * This page sits outside the portal shell so a disabled account can reach it
 * without passing a navigation it is not allowed to use. Everyone else can
 * also open it from the banner that appears while their standing is not good.
 */
export default async function AccountStatusPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/account/status");

  if (!(await isLoginSessionActive(currentLoginSessionId(session)))) redirect("/login");

  const user = await getCurrentUser(session);
  if (!user) redirect("/login");

  const restricted = user.standing === "DISABLED";

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg-primary px-6 py-16">
      <GlassCard className="w-full max-w-lg p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Account status</p>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">{standingLabel(user.standing)}</h1>

        <p className="mt-4 text-sm text-text-secondary">{EXPLANATIONS[user.standing]}</p>

        {user.standingReason ? (
          <p className="mt-4 rounded-xl border border-border bg-bg-hover px-4 py-3 text-sm text-text-secondary">
            {user.standingReason}
          </p>
        ) : null}

        {restricted ? (
          <p className="mt-4 text-sm text-text-secondary">
            If you believe this is a mistake, reply to the notice email and an administrator will review it.
          </p>
        ) : (
          <p className="mt-4 text-sm text-text-secondary">
            Keep an eye on your sessions list and join on time. If something is making attendance difficult,
            speak to your teacher so the time can be rearranged.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {restricted ? null : (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center rounded-[10px] bg-accent px-5 text-sm font-semibold text-text-inverse transition-all hover:brightness-95"
              >
                Back to dashboard
              </Link>
              <Link
                href={user.role === "TEACHER" ? "/sessions" : "/courses/hifdh-ul-quran"}
                className="inline-flex h-11 items-center rounded-[10px] border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
              >
                {user.role === "TEACHER" ? "Your sessions" : "Your course"}
              </Link>
            </>
          )}
          <SignOutButton />
        </div>
      </GlassCard>
    </main>
  );
}
