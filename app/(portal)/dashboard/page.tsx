import { BookOpen, Flame, GraduationCap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { elMessiri } from "@/app/ui/fonts";
import { LeaderBoardCard } from "@/app/ui/cards";
import { EmptyState, Panel, PortalHeader, StatTile } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { leaderboardAround } from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/session";
import { Award, CheckSquare, ClipboardCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = typeof params?.tab === "string" ? params.tab : "overview";

  const session = await auth();
  const user = await getCurrentUser(session);
  if (!user) redirect("/login");

  if (user.role === "TEACHER") {
    return <TeacherDashboard name={user.name} gender={user.gender} />;
  }

  const firstName = user.name.split(" ")[0] ?? "Student";
  const { rows: leaders } = await leaderboardAround(user.id);

  if (tab === "analytics") {
    return <AnalyticsTab firstName={firstName} />;
  }

  return (
    <div className="stagger-fade mx-auto w-full max-w-7xl space-y-6 p-6">
      <TabBar active="overview" />
      <section className="relative flex items-center justify-between gap-6 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-bg-elevated to-bg-secondary p-6 shadow-raise md:p-8">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className={`${elMessiri.className} text-3xl font-semibold tracking-tight text-text-primary md:text-4xl`}>
            Hey, {firstName}
          </h1>
          <p className="text-sm text-text-secondary">No active courses yet. Start learning today.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary/90"
            >
              Browse Courses
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-[10px] border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              View Study Plan
            </Link>
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-center gap-2 md:flex">
          <ProgressRing percent={0} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Overall Progress
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Active Courses</h2>
                <p className="text-sm text-text-secondary">Pick up where you left off</p>
              </div>
              <Link href="/courses" className="text-sm font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>
            <EmptyState
              title="No active courses yet. Browse our catalog to get started."
              action={
                <Link
                  href="/courses"
                  className="mt-4 inline-flex h-10 items-center rounded-[10px] border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  Browse courses
                </Link>
              }
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">Leaderboard</h2>
            <Panel className="p-5">
              {leaders.length === 0 ? (
                <p className="text-sm text-text-secondary">No leaderboard data yet.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {leaders.map((row) => (
                    <LeaderBoardCard
                      key={row.userId}
                      rank={row.rank}
                      userId={row.userId}
                      name={row.name}
                      xp={row.xp}
                      image={row.image}
                      currentUser={row.currentUser}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Recent Achievements
            </h2>
            <Panel className="p-5">
              <p className="text-sm text-text-secondary">Achievements will appear as you study.</p>
            </Panel>
          </section>
        </div>

        <div className="space-y-4">
          <Panel className="p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Learning Streak
            </h2>
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-text-muted" />
              <p className="text-sm font-semibold text-text-primary">No streak yet</p>
            </div>
            <div className="mt-4 flex justify-between">
              {WEEK_DAYS.map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className="flex size-8 items-center justify-center rounded-full bg-bg-hover text-[11px] font-semibold text-text-muted"
                >
                  {day}
                </span>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Weekly Schedule
            </h2>
            <p className="text-sm text-text-secondary">No sessions scheduled yet.</p>
          </Panel>

          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Quick Resources
            </h2>
            <Link
              href="/revision"
              className="flex gap-3 rounded-xl bg-bg-hover px-4 py-2.5 transition-colors hover:bg-bg-hover/70"
            >
              <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">Revision</span>
                <span className="block text-xs text-text-secondary">Review your memorization plan</span>
              </span>
            </Link>
            <Link
              href="/mushaf"
              className="flex gap-3 rounded-xl bg-bg-hover px-4 py-2.5 transition-colors hover:bg-bg-hover/70"
            >
              <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">Mushaf</span>
                <span className="block text-xs text-text-secondary">Read from the holy Quran</span>
              </span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function TabBar({ active }: { active: "overview" | "analytics" }) {
  return (
    <nav aria-label="Dashboard views" className="flex w-fit gap-1 rounded-xl border border-border bg-bg-elevated p-1">
      {(
        [
          { name: "Overview", href: "/dashboard" },
          { name: "Analytics", href: "/dashboard?tab=analytics" },
        ] as const
      ).map((tab) => {
        const isActive =
          (tab.name === "Overview" && active === "overview") ||
          (tab.name === "Analytics" && active === "analytics");
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isActive ? "bg-primary text-text-inverse" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}

function ProgressRing({ percent }: { percent: number }) {  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative flex size-24 items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-bg-hover" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>
      <span className="text-lg font-bold tabular-nums text-text-primary">{percent}%</span>
    </div>
  );
}

function AnalyticsTab({ firstName }: { firstName: string }) {
  return (
    <div className="stagger-fade mx-auto w-full max-w-7xl space-y-6 p-6">
      <TabBar active="analytics" />
      <PortalHeader title={`${firstName}'s progress`} subtitle="Quiz results, completed modules, and active courses" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ClipboardCheck} value={0} label="Quizzes Taken" tone="brass" />
        <StatTile icon={Award} value="0%" label="Avg Score" tone="success" />
        <StatTile icon={BookOpen} value={0} label="Modules Done" tone="info" />
        <StatTile icon={GraduationCap} value="0/0" label="Passed" tone="brass" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">Quiz Results</h2>
        <Panel className="p-5">
          <p className="text-sm text-text-secondary">No quizzes taken yet.</p>
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">Modules Completed</h2>
        <Panel className="p-5">
          <p className="text-sm text-text-secondary">No modules completed yet.</p>
        </Panel>
      </section>
    </div>
  );
}

function TeacherDashboard({ name, gender }: { name: string; gender: string | null }) {
  const title = gender === "female" ? "Ustadha" : "Ustadh";
  const firstName = name.split(" ")[0] ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      <PortalHeader title={`Hello, ${title} ${firstName}`} subtitle="Here's your overview for today." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={BookOpen} value={0} label="Active Students" tone="brass" />
        <StatTile icon={CheckSquare} value={0} label="Sessions This Month" tone="success" />
        <StatTile icon={BookOpen} value={0} label="Today's Sessions" tone="info" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-text-primary">Today&apos;s Sessions</h2>
        <Panel className="p-5">
          <p className="text-sm text-text-secondary">No sessions scheduled for today.</p>
        </Panel>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-text-primary">My Students</h2>
          <Link href="/students" className="text-sm font-semibold text-primary hover:underline">
            View All →
          </Link>
        </div>
        <Panel className="p-5">
          <p className="text-sm text-text-secondary">No active students assigned.</p>
        </Panel>
      </section>
    </div>
  );
}
