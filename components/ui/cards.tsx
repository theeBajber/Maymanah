import Image from "next/image";
import Link from "next/link";
import { amiri } from "@/components/ui/fonts";

export function CourseCard({
  className,
  image,
  title,
  progress,
  lessons,
  href,
}: {
  className?: string;
  image?: string | null;
  title?: string | null;
  progress?: number | null;
  lessons?: number | null;
  href?: string;
}) {
  const totalLessons = lessons ?? 0;
  const completedLessons = totalLessons > 0
    ? Math.round(((progress ?? 0) / 100) * totalLessons)
    : 0;
  const pct = progress ?? 0;

  return (
    <Link
      href={href ?? ""}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-bg-elevated border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 ${className}`}
    >
      <div className="relative h-40 overflow-hidden">
        {image ? (
          <Image
            src={image}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            alt={title ?? "Course"}
          />
        ) : (
          <Image
            src={"/calligraphy.png"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            alt="Course"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/20 to-transparent" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="w-8 h-0.5 rounded-full bg-primary/40" />
        <h4 className={`${amiri.className} text-lg font-bold text-text-primary leading-snug line-clamp-1`}>
          {title ?? "Untitled Course"}
        </h4>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-medium">{pct}% complete</span>
          <span>
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export function LeaderBoardCard({
  currentUser,
  rank,
  name,
  xp,
  image,
}: {
  currentUser?: boolean;
  rank?: number;
  name?: string | null;
  xp?: number;
  image?: string | null;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
        currentUser ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-bg-hover"
      }`}
    >
      <span className="w-5 text-center text-xs font-semibold text-text-muted">
        {rank ?? 11}
      </span>
      <div className="relative size-9 shrink-0 rounded-full overflow-hidden ring-2 ring-border">
        <Image
          src={image || "/portraits/pattern-1.png"}
          width={250}
          height={250}
          className="object-cover"
          alt={name ?? ""}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate flex items-center gap-1.5">
          {name ?? "Student"}
          {currentUser && (
            <span className="text-[10px] font-normal text-text-muted">
              (You)
            </span>
          )}
        </p>
        <p className="text-xs text-text-secondary">{xp ?? 0} xp</p>
      </div>
    </div>
  );
}
