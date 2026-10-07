import Image from "next/image";
import Link from "next/link";

import { amiri } from "./fonts";
import { defaultAvatar } from "@/lib/avatar";

/** Clamps a percentage to the range a width style can actually render. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function CourseCard({
  title,
  progress,
  lessons,
  href,
  image,
}: {
  title: string;
  progress: number;
  lessons: number;
  href: string;
  image?: string | null;
}) {
  const pct = clampPercent(progress);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-colors hover:border-primary/40"
    >
      <div className="relative h-28 w-full overflow-hidden bg-bg-hover">
        {image ? (
          <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div aria-hidden className="flex h-full w-full items-center justify-center">
            <span className={`${amiri.className} text-4xl text-primary/40`}>ٱقْرَأْ</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-hover">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-text-muted">{pct}%</span>
        </div>
        <p className="text-[11px] text-text-muted">
          {lessons} {lessons === 1 ? "lesson" : "lessons"}
        </p>
      </div>
    </Link>
  );
}

export function LeaderBoardCard({
  rank,
  userId,
  name,
  xp,
  image,
  currentUser,
}: {
  rank: number;
  userId: string;
  name: string | null;
  xp: number;
  image?: string | null;
  currentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        currentUser ? "bg-primary/10 ring-1 ring-primary/30" : ""
      }`}
    >
      <span
        className={`w-6 text-center text-sm font-bold tabular-nums ${
          rank <= 3 ? "text-primary" : "text-text-muted"
        }`}
      >
        {rank}
      </span>
      <Image
        width={64}
        height={64}
        src={image || defaultAvatar(userId)}
        alt=""
        className="size-8 rounded-full object-cover ring-1 ring-border"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
        {name ?? "Student"}
        {currentUser ? <span className="text-primary"> · you</span> : null}
      </span>
      <span className="text-sm font-bold tabular-nums text-primary">{xp}</span>
    </div>
  );
}
