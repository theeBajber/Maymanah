import type { Metadata } from "next";
import { Award, BookOpen, Settings, ShieldCheck, Sparkles, Video } from "lucide-react";
import Link from "next/link";

import { EmptyState, Panel, PortalHeader, StatTile } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const user = await getCurrentUser(session);

  if (!user) {
    return <EmptyState title="Your account could not be loaded." />;
  }

  const isTeacher = user.role === "TEACHER";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <PortalHeader
        title={`As-salamu alaykum, ${user.name.split(" ")[0]}`}
        subtitle={isTeacher ? "Your teaching overview" : "Your learning overview"}
        action={
          <Link
            href="/settings"
            className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <Settings className="size-4" />
            Settings
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={isTeacher ? BookOpen : BookOpen} value={0} label="Lessons" tone="brass" />
        <StatTile icon={Video} value={0} label="Sessions" tone="info" />
        <StatTile icon={Award} value={user.xp} label="Points" tone="success" />
        <StatTile
          icon={ShieldCheck}
          value={user.twoFactorEnabled ? "On" : "Off"}
          label="Two-factor"
          tone={user.twoFactorEnabled ? "success" : "danger"}
        />
      </div>

      {!user.emailVerified ? (
        <Panel className="p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-text-primary">Confirm your email address</h2>
            <p className="text-sm text-text-secondary">
              Confirming proves the address belongs to you, which is what lets you reset your password if you lose it.
              Sign-in works either way, so nothing is blocked in the meantime.
            </p>
            <Link
              href="/settings"
              className="mt-2 inline-flex h-10 w-fit items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Confirm in settings
            </Link>
          </div>
        </Panel>
      ) : null}

      {!user.twoFactorEnabled ? (
        <Panel className="p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-text-primary">Turn on two-factor authentication</h2>
            <p className="text-sm text-text-secondary">
              A six digit code is emailed to you each time you sign in, so a stolen password on its own is not enough
              to reach your account.
            </p>
            <Link
              href="/settings"
              className="mt-2 inline-flex h-10 w-fit items-center gap-2 rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Turn it on
            </Link>
          </div>
        </Panel>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {isTeacher ? "Your students" : "Your learning"}
        </h2>
        <EmptyState
          title={
            isTeacher
              ? "No students are assigned to you yet. An administrator approves and pairs teachers with students."
              : "You have not started a lesson yet. Your curriculum and schedule appear here once you are matched with a teacher."
          }
          action={
            isTeacher ? null : (
              <Link
                href="/curriculum"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <Sparkles className="size-4" />
                See the learning path
              </Link>
            )
          }
        />
      </section>
    </div>
  );
}