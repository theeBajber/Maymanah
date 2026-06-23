import { auth } from "@/lib/auth";
import { CourseCard } from "@/components/ui/cards";
import { amiri } from "@/components/ui/fonts";
import {
  faBookOpen,
  faGraduationCap,
  faBookQuran,
  faHistory,
  faScaleBalanced,
  faLanguage,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { getCoursesData } from "@/lib/courses";
import { redirect } from "next/navigation";
import { CourseCategory } from "@prisma/client";

const categoryMeta: Record<
  CourseCategory,
  { icon: typeof faBookOpen; label: string; className: string }
> = {
  Quran: {
    icon: faBookQuran,
    label: "Quran",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  Fiqh: {
    icon: faScaleBalanced,
    label: "Fiqh",
    className: "bg-secondary/10 text-secondary border-secondary/20",
  },
  History: {
    icon: faHistory,
    label: "History",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  Arabic: {
    icon: faLanguage,
    label: "Arabic",
    className: "bg-info/10 text-info border-info/20",
  },
  Aqeedah: {
    icon: faGraduationCap,
    label: "Aqeedah",
    className: "bg-success/10 text-success border-success/20",
  },
};

export default async function Courses() {
  const session = await auth();
  if (session?.user?.role === "TEACHER") redirect("/dashboard");

  const data = await getCoursesData();
  if (!data) redirect("/login");
  const { enrolledCourses, availableCourses } = data;
  const completedCount = enrolledCourses.filter((c) => (c.progress ?? 0) >= 100).length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Courses</h1>
          <p className="text-sm text-text-secondary mt-1">
            {enrolledCourses.length > 0
              ? `${enrolledCourses.length} course${enrolledCourses.length > 1 ? "s" : ""} in progress`
              : "Continue your learning journey"}
          </p>
        </div>
        {enrolledCourses.length > 0 && (
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="text-primary size-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary leading-none">{completedCount}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.08em] font-semibold">Completed</p>
            </div>
          </div>
        )}
      </section>

      {enrolledCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-text-primary">Currently Enrolled</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                image={course.image ?? undefined}
                title={course.title}
                progress={course.progress ?? undefined}
                lessons={course.lessons}
                href={`/courses/${course.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      {enrolledCourses.length === 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-text-primary">Currently Enrolled</h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="rounded-2xl border border-dashed border-border/60 bg-bg-elevated/50 p-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBookOpen} className="text-primary text-xl" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg mb-1">No enrolled courses yet</h3>
            <p className="text-sm text-text-secondary mb-0 max-w-sm mx-auto">
              Browse available courses below to find the perfect subject and start your learning journey
            </p>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-text-primary">Available Courses</h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course) => {
              const catMeta = categoryMeta[course.category as CourseCategory];
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-bg-elevated border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={course.image || "/calligraphy.png"}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/10 to-transparent" />
                    {catMeta && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold backdrop-blur-sm ${catMeta.className}`}
                        >
                          <FontAwesomeIcon icon={catMeta.icon} className="size-3" />
                          {catMeta.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="w-8 h-0.5 rounded-full bg-primary/40" />
                    <h4 className={`${amiri.className} text-lg font-bold text-text-primary leading-snug line-clamp-1`}>
                      {course.title}
                    </h4>
                    <div className="flex items-center text-xs text-text-secondary">
                      <FontAwesomeIcon icon={faClock} className="size-3 text-primary/60 mr-2" />
                      <span className="font-medium">{course.lessons} lessons</span>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 bg-primary text-text-inverse font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.97] shadow-sm shadow-primary/20 mt-1">
                      Enroll Now
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-bg-elevated/50 p-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faGraduationCap} className="text-primary text-xl" />
            </div>
            <h3 className="font-semibold text-text-primary text-lg mb-1">All enrolled</h3>
            <p className="text-sm text-text-secondary">
              You have enrolled in all available courses. Check back for new offerings.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
