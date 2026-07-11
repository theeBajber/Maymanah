import { auth } from "@/lib/auth";
import { CourseCard } from "@/components/ui/cards";
import { amiri, elMessiri } from "@/components/ui/fonts";
import { PortalHeader, EmptyState } from "@/components/ui/portal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBookOpen,
  faBookQuran,
  faClock,
  faGraduationCap,
  faHistory,
  faLanguage,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
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
    <div className="stagger-fade p-6 space-y-8 max-w-7xl mx-auto">
      <PortalHeader
        title="My Courses"
        subtitle={
          enrolledCourses.length > 0
            ? `${enrolledCourses.length} course${enrolledCourses.length > 1 ? "s" : ""} in progress`
            : "Continue your learning journey"
        }
        action={
          enrolledCourses.length > 0 ? (
            <div className="hidden items-center gap-2.5 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 shadow-raise sm:flex">
              <span className="flex size-9 items-center justify-center rounded-[10px] border border-primary/25 text-primary">
                <FontAwesomeIcon icon={faGraduationCap} className="size-4" />
              </span>
              <div>
                <p className="text-xl font-bold leading-none text-text-primary">{completedCount}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Completed</p>
              </div>
            </div>
          ) : undefined
        }
      />

      {enrolledCourses.length > 0 ? (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2
              className={`${elMessiri.className} text-lg font-semibold text-text-primary`}
            >
              Currently Enrolled
            </h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                index={index}
                image={course.image ?? undefined}
                title={course.title}
                progress={course.progress ?? undefined}
                lessons={course.lessons}
                href={`/courses/${course.slug}`}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2
              className={`${elMessiri.className} text-lg font-semibold text-text-primary`}
            >
              Currently Enrolled
            </h2>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <EmptyState title="Browse available courses below to find the perfect subject and start your learning journey" />
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2
            className={`${elMessiri.className} text-lg font-semibold text-text-primary`}
          >
            Available Courses
          </h2>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course, index) => {
              const catMeta = categoryMeta[course.category as CourseCategory];
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  style={{ "--i": index } as React.CSSProperties}
                  className="hover-lift stagger-item group relative flex flex-col rounded-2xl overflow-hidden bg-bg-elevated border border-border shadow-raise hover:border-primary/30"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={course.image || "/calligraphy.png"}
                      alt={course.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated via-bg-elevated/10 to-transparent" />
                    {catMeta && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${catMeta.className}`}
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
                    <span className="inline-flex items-center justify-center gap-2 rounded-[10px] py-2.5 px-4 bg-primary text-text-inverse font-semibold text-sm transition-all active:scale-[0.97] hover:shadow-glow-brass mt-1">
                      Enroll Now
                      <FontAwesomeIcon icon={faArrowRight} className="size-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="You have enrolled in all available courses. Check back for new offerings." />
        )}
      </section>
    </div>
  );
}
