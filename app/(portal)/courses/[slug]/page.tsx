import { getCourseBySlug } from "@/lib/courses";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { amiri, elMessiri } from "@/components/ui/fonts";
import { EmptyState } from "@/components/ui/portal";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bolt,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Download,
  GraduationCap,
  Lock,
  Play,
  Star,
  Sun,
  Video,
} from "lucide-react";
import EnrollButton from "./EnrollButton";
import { DailySessionButton } from "./DailySessionButton";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";

export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  return course;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "TEACHER") redirect("/dashboard");
  const { slug } = await params;
  const course = await getCourse(slug);
  const isEnrolled = course.enrollmentStatus === "ACTIVE" || course.enrollmentStatus === "COMPLETED";
  const userId = session?.user?.id;

  const lessonProgress: Record<string, { completed: boolean; score: number | null }> = {};
  const lessonExams: Record<string, { id: string }> = {};

  if (isEnrolled && userId && course.slug !== "hifdh-ul-quran") {
    const [progress, exams] = await Promise.all([
      safeQuery(() =>
        prisma.lessonProgress.findMany({
          where: { studentId: userId, lesson: { courseId: course.id } },
          select: { lessonId: true, completed: true, score: true },
        }),
      ).catch(() => [] as Array<{ lessonId: string; completed: boolean; score: number | null }>),
      safeQuery(() =>
        prisma.exam.findMany({
          where: { courseId: course.id, isPublished: true, lessonId: { not: null } },
          select: { id: true, lessonId: true },
        }),
      ).catch(() => [] as Array<{ id: string; lessonId: string | null }>),
    ]);

    for (const p of progress) {
      lessonProgress[p.lessonId] = { completed: p.completed, score: p.score };
    }
    for (const e of exams) {
      if (e.lessonId) lessonExams[e.lessonId] = { id: e.id };
    }
  }

  let firstUnlocked = 0;
  if (isEnrolled && course.slug !== "hifdh-ul-quran") {
    for (let i = 0; i < course.lessons.length; i++) {
      if (i > 0 && !lessonProgress[course.lessons[i - 1].id]?.completed) break;
      firstUnlocked = i;
    }
  }

  const completedCount = Object.values(lessonProgress).filter((p) => p.completed).length;

  let dailySlot: { startTime: Date; endTime: Date; duration: number } | null = null;
  let allAppointments: {
    id: string;
    title: string | null;
    startTime: Date;
    endTime: Date | null;
    status: string;
    sessionType: string;
    teacher: { id: string; name: string | null; image: string | null } | null;
  }[] = [];
  let upcomingMuraja: typeof allAppointments = [];
  let pastSessions: typeof allAppointments = [];

  let recurringSlots: { type: string; dayOfWeek: number; startTime: string; duration: number }[] = [];
  let teacherName: string | null = null;

  if (course.slug === "hifdh-ul-quran" && userId) {
    const mentorship = await safeQuery(() =>
      prisma.mentorship.findFirst({
        where: { studentId: userId, status: "ACTIVE" },
        include: {
          teacher: { select: { name: true } },
          recurringSlots: {
            select: { type: true, dayOfWeek: true, startTime: true, duration: true },
          },
        },
      }),
    );

    if (mentorship) {
      teacherName = mentorship.teacher.name;
      recurringSlots = mentorship.recurringSlots;

      const today = new Date();
      const dayOfWeek = today.getDay();
      const daily = recurringSlots.find((s) => s.type === "DAILY_HIFDH" && s.dayOfWeek === dayOfWeek);

      if (daily) {
        const [h, m] = daily.startTime.split(":").map(Number);
        const start = new Date(today);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + daily.duration * 60000);
        dailySlot = { startTime: start, endTime: end, duration: daily.duration };
      }

      allAppointments = (await safeQuery(() =>
        prisma.appointment.findMany({
          where: { mentorshipId: mentorship.id },
          include: { teacher: { select: { id: true, name: true, image: true } } },
          orderBy: { startTime: "desc" },
        }),
      ).catch(() => [])) ?? [];

      upcomingMuraja = allAppointments.filter(
        (a) =>
          a.sessionType !== "DAILY_HIFDH" &&
          a.status === "SCHEDULED" &&
          new Date(a.startTime) > new Date(),
      );
      pastSessions = allAppointments.filter(
        (a) => a.status === "COMPLETED" || new Date(a.startTime) <= new Date(),
      );
    }
  }

  function formatSessionDate(startTime: Date) {
    const date = new Date(startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  }

  return (
    <div className="stagger-fade p-6 max-w-7xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-secondary border border-border shadow-raise">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-[380px] lg:w-[420px] h-56 md:h-auto shrink-0 overflow-hidden">
            <Image
              src={course.image || "/calligraphy.png"}
              alt={course.title}
              fill
              sizes="(min-width: 768px) 420px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-elevated/60 via-bg-elevated/20 to-transparent md:bg-gradient-to-r from-bg-elevated/80 to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold">
                {course.category}
              </span>
              {course.slug === "hifdh-ul-quran" ? (
                allAppointments.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-hover text-text-secondary border border-border text-[11px] font-semibold">
                    <Video className="size-3" />
                    {allAppointments.length} sessions
                  </span>
                )
              ) : (
                course.lessons.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-hover text-text-secondary border border-border text-[11px] font-semibold">
                    <Clock className="size-3" />
                    {course.lessons.length} modules
                  </span>
                )
              )}
            </div>
            <h1 className={`${amiri.className} text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-snug`}>
              {course.title}
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
              {course.description || "No description available for this course."}
            </p>
              <div className="flex flex-wrap items-center gap-4 mt-6" id="enroll">
              <EnrollButton courseSlug={course.slug} isEnrolled={isEnrolled} />
              {isEnrolled && course.progress !== null && (
                <div className="flex items-center gap-3">
                  <div className="relative size-10">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-bg-hover" strokeWidth="2.5" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        className="stroke-primary" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={`${course.progress}, ${100 - course.progress}`}
                        pathLength="100"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-primary">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="text-xs">
                    {course.slug === "hifdh-ul-quran" ? (
                      <p className="font-semibold text-text-primary">{allAppointments.length} sessions</p>
                    ) : (
                      <p className="font-semibold text-text-primary">{completedCount}/{course.lessons.length} modules</p>
                    )}
                    <p className="text-text-muted">completed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {course.slug === "hifdh-ul-quran" ? (
        <section className="space-y-6">
          {isEnrolled && recurringSlots.length === 0 && (
            <SetAvailabilityForPairing />
          )}
          {dailySlot && (
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-bg-elevated p-6 shadow-raise">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-1">
                    <Sun className="size-4" />
                    Today&apos;s Daily Session
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    {dailySlot.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {dailySlot.duration} min session
                  </p>
                </div>
                <DailySessionButton
                  startTime={dailySlot.startTime.toISOString()}
                  endTime={dailySlot.endTime.toISOString()}
                />
              </div>
            </div>
          )}

          {recurringSlots.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-raise">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Your Schedule
              </h3>
              <div className="space-y-3">
                {recurringSlots.map((s) => {
                  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][s.dayOfWeek];
                  const time = new Date(`2000-01-01T${s.startTime}`).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const SlotIcon = s.type === "DAILY_HIFDH" ? Sun : Bolt;
                  return (
                    <div key={s.type}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-[10px] border border-primary/25 text-primary">
                            <SlotIcon className="size-4" />
                          </span>
                          <div>
                            <p className="font-medium text-sm text-text-primary">
                              {s.type === "DAILY_HIFDH" ? "Daily Hifdh" : "Muraja'ah"}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {dayName}s at {time} &middot; {s.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {teacherName && (
                <p className="text-xs text-text-muted mt-3 border-t border-border pt-3">
                  Teacher: {teacherName}
                </p>
              )}
            </div>
          )}

          {upcomingMuraja.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <Star className="size-3.5 text-primary" />
                Upcoming Sessions
              </h3>
              <div className="space-y-2.5">
                {upcomingMuraja.map((a, index) => (
                  <Link
                    key={a.id}
                    href={isEnrolled ? `/session/${a.id}` : "#enroll"}
                    style={{ "--i": index } as React.CSSProperties}
                    className="hover-lift stagger-item group flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-elevated hover:border-primary/30 hover:bg-bg-hover"
                  >
                    <span className="relative shrink-0 flex size-11 items-center justify-center rounded-[10px] border border-primary/25 text-primary group-hover:bg-primary/5 transition-colors">
                      {a.sessionType === "MURAJA" ? <Bolt className="size-4" /> : <Video className="size-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-text-primary">
                        {a.title || (a.sessionType === "MURAJA" ? "Muraja'ah Session" : "Extra Session")}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatSessionDate(a.startTime)}
                        </span>
                        {a.teacher && (
                          <span>with {a.teacher.name || "Teacher"}</span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider font-medium text-primary/70">
                          {a.sessionType === "MURAJA" ? "Muraja'ah" : "Extra"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-primary text-text-inverse font-semibold text-sm transition-all shrink-0 active:scale-[0.97] group-hover:shadow-glow-brass">
                      Join
                      <ArrowRight className="size-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="size-2 rounded-full bg-text-muted" />
                Past Sessions
              </h3>
              <div className="space-y-2">
                {pastSessions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-elevated/50 opacity-70"
                  >
                    <span className="relative shrink-0 flex size-11 items-center justify-center rounded-[10px] bg-bg-hover text-text-muted">
                      <Video className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-text-primary text-sm">
                        {a.title || "Session"}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">
                        {formatSessionDate(a.startTime)}
                        {a.teacher && ` — with ${a.teacher.name || "Teacher"}`}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted shrink-0">
                      {a.status === "COMPLETED" ? "Completed" : "Missed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!dailySlot && upcomingMuraja.length === 0 && pastSessions.length === 0 && !(isEnrolled && recurringSlots.length === 0) && (
            <EmptyState title="Sessions will appear here once your teacher schedules them." />
          )}
        </section>
      ) : (
        <>
        {isEnrolled && course.lessons.length > 0 &&
          (course.enrollmentStatus === "COMPLETED" || completedCount >= course.lessons.length) && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-bg-elevated p-6 text-center shadow-raise sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <Award className="size-6" />
                </span>
                <div>
                  <h3 className={`${elMessiri.className} text-lg font-semibold text-text-primary`}>
                    Course complete — well done!
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Your certificate of completion is ready to download.
                  </p>
                </div>
              </div>
              <a
                href={`/api/courses/${slug}/certificate`}
                className="flex shrink-0 items-center justify-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-text-inverse transition-all hover:shadow-glow-brass active:scale-[0.97]"
              >
                <Download className="size-4" />
                Download Certificate
              </a>
            </div>
        )}

        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="flex size-8 items-center justify-center rounded-[8px] border border-primary/25 text-primary">
              <GraduationCap className="size-4" />
            </span>
            <div>
              <h2
                className={`${elMessiri.className} text-lg font-semibold text-text-primary`}
              >
                Modules
              </h2>
              {isEnrolled && (
                <p className="text-xs text-text-secondary">{completedCount} of {course.lessons.length} completed</p>
              )}
            </div>
            {isEnrolled && (
              <div className="flex-1" />
            )}
          </div>

          {course.lessons.length > 0 ? (
            <div className="space-y-2.5">
              {course.lessons.map((lesson, index) => {
                const prog = lessonProgress[lesson.id];
                const isCompleted = prog?.completed;
                const isLocked = index > firstUnlocked;
                const hasQuiz = !!lessonExams[lesson.id];

                return (
                  <Link
                    key={lesson.id}
                    href={isEnrolled && !isLocked ? `/courses/${slug}/lessons/${lesson.id}` : isEnrolled ? "#" : "#enroll"}
                    style={{ "--i": index } as React.CSSProperties}
                    className={`stagger-item group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isCompleted
                        ? "bg-success/5 border-success/20 hover:border-success/40"
                        : isLocked
                          ? "bg-bg-elevated/50 border-border/60 opacity-50 cursor-default"
                          : isEnrolled
                            ? "bg-bg-elevated border-border hover:border-primary/30 hover:shadow-raise hover:bg-bg-hover"
                            : "bg-bg-elevated border-border/60 hover:border-primary/20 hover:bg-bg-hover"
                    }`}
                  >
                    <div
                      className={`relative shrink-0 size-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted
                          ? "bg-success text-text-inverse"
                          : isLocked
                            ? "bg-bg-hover text-text-muted"
                            : isEnrolled
                              ? "bg-primary/10 text-primary group-hover:bg-primary/15"
                              : "bg-primary/5 text-primary/60"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="size-5" />
                      ) : isLocked ? (
                        <Lock className="size-4" />
                      ) : (
                        <span className="text-base">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${
                        isCompleted ? "text-text-primary" : isLocked ? "text-text-muted" : "text-text-primary"
                      }`}>
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {lesson.duration} min
                          </span>
                        )}
                        {hasQuiz && (
                          <span className="flex items-center gap-1">
                            <ClipboardList className="size-3" />
                            Quiz
                          </span>
                        )}
                        {isCompleted && prog?.score != null && (
                          <span className="text-success font-medium">
                            Score: {prog.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success font-semibold text-sm">
                          <CheckCircle className="size-3.5" />
                          Done
                        </span>
                      ) : isLocked ? (
                        <span className="text-text-muted/50">
                          <Lock className="size-4" />
                        </span>
                      ) : (
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-[0.97] ${
                          isEnrolled
                            ? "bg-primary text-text-inverse group-hover:shadow-glow-brass"
                            : "bg-primary/10 text-primary group-hover:bg-primary/15"
                        }`}>
                          {isEnrolled ? (
                            <>
                              Start
                              <ArrowRight className="size-3" />
                            </>
                          ) : (
                            <>
                              <Play className="size-3" />
                              Enroll to access
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Content for this course is being prepared." />
          )}
        </section>
        </>
      )}
    </div>
  );
}
