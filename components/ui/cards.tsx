import Image from "next/image";
import Link from "next/link";

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
  return (
    <Link
      href={href ?? ""}
      className={`h-72 rounded-xl overflow-hidden w-full bg-bg-card border border-border shadow-sm hover:shadow-md transition-all group flex flex-col justify-between ${className}`}
    >
      <div className="w-full h-40 relative overflow-hidden">
        {image ? (
          <Image
            src={image}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            alt={title ?? "Course"}
          />
        ) : (
          <Image
            src={"/calligraphy.png"}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            alt="Course"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-bg-card"></div>
      </div>
      <div className="p-8 flex flex-col gap-2">
        <h4 className="mb-2 font-bold text-xl">{title ?? "Untitled Course"}</h4>
        <div className="flex w-full items-center justify-between text-sm text-text-secondary">
          <span>{progress ?? 0}% Complete</span>
          <span>
            {completedLessons}/{totalLessons} Lessons
          </span>
        </div>
        <div className="rounded-full w-full h-2 bg-bg-primary relative">
          <div
            className="absolute left-0 h-full rounded-full bg-primary"
            style={{ width: `${progress ?? 0}%` }}
          ></div>
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
      className={`w-full flex items-center gap-4 justify-baseline rounded px-2 py-1 ${currentUser ? "bg-primary-subtle/50" : ""}`}
    >
      <span className="text-text-secondary">{rank ?? 11}</span>
      {image ? (
        <Image
          src={image}
          width={250}
          height={250}
          className="rounded-full size-10"
          alt={name ?? ""}
        />
      ) : (
        <Image
          src={"/portraits/pattern-1.png"}
          width={250}
          height={250}
          className="rounded-full size-10"
          alt=""
        />
      )}
      <div className="flex flex-col">
        <div className="font-semibold flex items-center gap-2">
          {name ?? "Student"}
          <span className={` font-normal ${currentUser ? "inline" : "hidden"}`}>
            (You)
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          {xp ?? 0} xp
        </div>
      </div>
    </div>
  );
}
