import { getCourseBySlug } from "@/lib/courses";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { amiri } from "@/components/ui/fonts";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faLock,
  faCheckCircle,
  faClipboardList,
  faClock,
  faGraduationCap,
  faArrowRight,
  faVideo,
  faCalendar,
  faBolt,
  faStar,
  faSun,
  faCertificate,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import EnrollButton from "./EnrollButton";
import { DailySessionButton } from "./DailySessionButton";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";
import ReviewSection from "./ReviewSection";

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
  const isEnrolled =
    course.enrollmentStatus === "ACTIVE" ||
    course.enrollmentStatus === "COMPLETED";
  const userId = session?.user?.id;

  const lessonProgress: Record<
    string,
    { completed: boolean; score: number | null }
  > = {};
  const lessonExams: Record<string, { id: string; totalMarks: number }> = {};
  let finalExam: {
    id: string;
    title: string;
    totalMarks: number;
    passMark: number;
    _count: { questions: number };
  } | null = null;
  let finalExamSubmission: {
    status: string;
    totalScore: number | null;
    attemptNumber: number;
  } | null = null;
  let certificate: { id: string } | null = null;

  if (isEnrolled && userId && course.slug !== "hifdh-ul-quran") {
    const [progress, exams, fexam, ijazah] = await Promise.all([
      safeQuery(() =>
        prisma.lessonProgress.findMany({
          where: { studentId: userId, lesson: { courseId: course.id } },
          select: { lessonId: true, completed: true, score: true },
        }),
      ).catch(
        () =>
          [] as Array<{
            lessonId: string;
            completed: boolean;
            score: number | null;
          }>,
      ),
      safeQuery(() =>
        prisma.exam.findMany({
          where: {
            courseId: course.id,
            isPublished: true,
            lessonId: { not: null },
          },
          select: { id: true, lessonId: true, totalMarks: true },
        }),
      ).catch(() => [] as Array<{ id: string; lessonId: string | null; totalMarks: number }>),
      safeQuery(() =>
        prisma.exam.findFirst({
          where: { courseId: course.id, examType: "FINAL", isPublished: true },
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passMark: true,
            _count: { select: { questions: true } },
          },
        }),
      ).catch(() => null),
      safeQuery(() =>
        prisma.ijazah.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
          select: { id: true },
        }),
      ).catch(() => null),
    ]);

    for (const p of progress) {
      lessonProgress[p.lessonId] = { completed: p.completed, score: p.score };
    }
    for (const e of exams) {
      if (e.lessonId) lessonExams[e.lessonId] = { id: e.id, totalMarks: e.totalMarks };
    }
    finalExam = fexam;

    if (fexam) {
      const sub = await safeQuery(() =>
        prisma.submission.findFirst({
          where: { examId: fexam.id, studentId: userId },
          orderBy: { attemptNumber: "desc" },
          select: { status: true, totalScore: true, attemptNumber: true },
        }),
      ).catch(() => null);
      finalExamSubmission = sub;
    }

    certificate = ijazah;
  }

  let firstUnlocked = 0;
  if (isEnrolled && course.slug !== "hifdh-ul-quran") {
    for (let i = 0; i < course.lessons.length; i++) {
      if (i > 0 && !lessonProgress[course.lessons[i - 1].id]?.completed) break;
      firstUnlocked = i;
    }
  }

  const completedCount = Object.values(lessonProgress).filter(
    (p) => p.completed,
  ).length;

  let userReview: { rating: number; comment: string | null } | null = null;
  let allReviews: { id: string; rating: number; comment: string | null; user: { name: string | null; image: string | null }; createdAt: Date }[] = [];
  let averageRating: number | null = null;

  if (certificate && userId && course.slug !== "hifdh-ul-quran") {
    const [review, reviews] = await Promise.all([
      safeQuery(() =>
        prisma.courseReview.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
          select: { rating: true, comment: true },
        }),
      ).catch(() => null),
      safeQuery(() =>
        prisma.courseReview.findMany({
          where: { courseId: course.id },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ).catch(() => [] as typeof allReviews),
    ]);
    userReview = review;
    allReviews = reviews ?? [];
    averageRating = allReviews.length > 0
      ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
      : null;
  }

  let dailySlot: { startTime: Date; endTime: Date; duration: number } | null =
    null;
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

  let recurringSlots: {
    type: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
  }[] = [];
  let teacherName: string | null = null;

  if (course.slug === "hifdh-ul-quran" && userId) {
    const mentorship = await safeQuery(() =>
      prisma.mentorship.findFirst({
        where: { studentId: userId, status: "ACTIVE" },
        include: {
          teacher: { select: { name: true } },
          recurringSlots: {
            select: {
              type: true,
              dayOfWeek: true,
              startTime: true,
              duration: true,
            },
          },
        },
      }),
    );

    if (mentorship) {
      teacherName = mentorship.teacher.name;
      recurringSlots = mentorship.recurringSlots;

      const today = new Date();
      const dayOfWeek = today.getDay();
      const daily = recurringSlots.find(
        (s) => s.type === "DAILY_HIFDH" && s.dayOfWeek === dayOfWeek,
      );

      if (daily) {
        const [h, m] = daily.startTime.split(":").map(Number);
        const start = new Date(today);
        start.setHours(h, m, 0, 0);
        const end = new Date(start.getTime() + daily.duration * 60000);
        dailySlot = {
          startTime: start,
          endTime: end,
          duration: daily.duration,
        };
      }

      allAppointments =
        (await safeQuery(() =>
          prisma.appointment.findMany({
            where: { mentorshipId: mentorship.id },
            include: {
              teacher: { select: { id: true, name: true, image: true } },
            },
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

  const now = new Date();

  function formatSessionDate(startTime: Date) {
    const date = new Date(startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
  }

  function canJoinSession(startTime: Date, endTime: Date | null) {
    return now >= startTime && (!endTime || now <= endTime);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-secondary border border-border">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-[380px] lg:w-[420px] h-56 md:h-auto shrink-0 overflow-hidden">
            <Image
              src={course.image || "/calligraphy.png"}
              alt={course.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-elevated/60 via-bg-elevated/20 to-transparent md:bg-gradient-to-r from-bg-elevated/80 to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8 flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold">
                {course.category}
              </span>
              {course.slug === "hifdh-ul-quran"
                ? allAppointments.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-hover text-text-secondary border border-border text-[11px] font-semibold">
                      <FontAwesomeIcon icon={faVideo} className="size-3" />
                      {allAppointments.length} sessions
                    </span>
                  )
                : course.lessons.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-hover text-text-secondary border border-border text-[11px] font-semibold">
                      <FontAwesomeIcon icon={faClock} className="size-3" />
                      {course.lessons.length} modules
                    </span>
                  )}
            </div>
            <h1
              className={`${amiri.className} text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-snug`}
            >
              {course.title}
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
              {course.description ||
                "No description available for this course."}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6" id="enroll">
              <EnrollButton courseSlug={course.slug} isEnrolled={isEnrolled} />
              {isEnrolled && course.progress !== null && (
                <div className="flex items-center gap-3">
                  <div className="relative size-10">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-bg-hover"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="2.5"
                        strokeLinecap="round"
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
                      <p className="font-semibold text-text-primary">
                        {allAppointments.length} sessions
                      </p>
                    ) : (
                      <p className="font-semibold text-text-primary">
                        {completedCount}/{course.lessons.length} modules
                      </p>
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
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-bg-elevated p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-1">
                    <FontAwesomeIcon icon={faSun} className="size-4" />
                    Today&apos;s Daily Session
                  </div>
                  <p className="text-2xl font-bold text-text-primary">
                    {dailySlot.startTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Your Schedule
              </h3>
              <div className="space-y-3">
                {recurringSlots.map((s) => {
                  const dayName = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ][s.dayOfWeek];
                  const time = new Date(
                    `2000-01-01T${s.startTime}`,
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div key={s.type}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={s.type === "DAILY_HIFDH" ? faSun : faBolt}
                              className="text-primary size-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-text-primary">
                              {s.type === "DAILY_HIFDH"
                                ? "Daily Hifdh"
                                : "Muraja'ah"}
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
                <FontAwesomeIcon
                  icon={faStar}
                  className="size-3.5 text-primary"
                />
                Upcoming Sessions
              </h3>
              <div className="space-y-2.5">
                {upcomingMuraja.map((a) => {
                  const joinable = canJoinSession(a.startTime, a.endTime);
                  return (
                    <div
                      key={a.id}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-bg-elevated hover:border-primary/30 hover:shadow-sm hover:bg-bg-hover transition-all"
                    >
                      <div className="relative shrink-0 size-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <FontAwesomeIcon
                          icon={a.sessionType === "MURAJA" ? faBolt : faVideo}
                          className="text-primary size-4"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate text-text-primary">
                          {a.title ||
                            (a.sessionType === "MURAJA"
                              ? "Muraja'ah Session"
                              : "Extra Session")}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="size-3"
                            />
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
                      {joinable ? (
                        <Link
                          href={`/session/${a.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-text-inverse font-semibold text-sm hover:brightness-110 transition-all shrink-0 active:scale-[0.97] shadow-sm shadow-primary/20"
                        >
                          Join
                          <FontAwesomeIcon icon={faArrowRight} className="size-3" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-hover text-text-muted font-semibold text-sm shrink-0">
                          Upcoming
                        </span>
                      )}
                    </div>
                  );
                })}
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
                    <div className="relative shrink-0 size-11 rounded-xl bg-bg-hover flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faVideo}
                        className="text-text-muted size-4"
                      />
                    </div>
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

          {!dailySlot &&
            upcomingMuraja.length === 0 &&
            pastSessions.length === 0 &&
            !(isEnrolled && recurringSlots.length === 0) && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-bg-elevated/50 p-12 text-center">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="text-primary text-xl"
                  />
                </div>
                <h3 className="font-semibold text-text-primary text-lg mb-1">
                  No sessions yet
                </h3>
                <p className="text-sm text-text-secondary">
                  Sessions will appear here once your teacher schedules them.
                </p>
              </div>
            )}
        </section>
      ) : (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-primary size-4"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Modules</h2>
              {isEnrolled && (
                <p className="text-xs text-text-secondary">
                  {completedCount} of {course.lessons.length} completed
                </p>
              )}
            </div>
            {isEnrolled && <div className="flex-1" />}
          </div>

          {course.lessons.length > 0 ? (
            <div className="space-y-2.5">
              {course.lessons.map((lesson, index) => {
                const prog = lessonProgress[lesson.id];
                const isCompleted = prog?.completed;
                const isLocked = index > firstUnlocked;
                const hasQuiz = !!lessonExams[lesson.id];
                const isNext = isEnrolled && !isCompleted && !isLocked;

                return (
                  <Link
                    key={lesson.id}
                    href={
                      isEnrolled && !isLocked
                        ? `/courses/${slug}/lessons/${lesson.id}`
                        : isEnrolled
                          ? "#"
                          : "#enroll"
                    }
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isCompleted
                        ? "bg-success/5 border-success/20 hover:border-success/40"
                        : isLocked
                          ? "bg-bg-elevated/50 border-border/60 opacity-50 cursor-default"
                          : isEnrolled
                            ? "bg-bg-elevated border-border hover:border-primary/30 hover:shadow-sm hover:bg-bg-hover"
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
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="size-5"
                        />
                      ) : isLocked ? (
                        <FontAwesomeIcon icon={faLock} className="size-4" />
                      ) : (
                        <span className="text-base">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold truncate ${
                          isCompleted
                            ? "text-text-primary"
                            : isLocked
                              ? "text-text-muted"
                              : "text-text-primary"
                        }`}
                      >
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="size-3"
                            />
                            {lesson.duration} min
                          </span>
                        )}
                        {hasQuiz && (
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faClipboardList}
                              className="size-3"
                            />
                            Quiz
                          </span>
                        )}
                        {isCompleted && prog?.score != null && (
                          <span className="text-success font-medium">
                            {(() => {
                              const examData = lessonExams[lesson.id];
                              if (examData && examData.totalMarks > 0) {
                                const pct = Math.round((prog.score! / examData.totalMarks) * 100);
                                return `Score: ${pct}%`;
                              }
                              return `Score: ${prog.score}`;
                            })()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success font-semibold text-sm">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="size-3.5"
                          />
                          Done
                        </span>
                      ) : isLocked ? (
                        <span className="text-text-muted/50">
                          <FontAwesomeIcon icon={faLock} className="size-4" />
                        </span>
                      ) : (
                        <span
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-[0.97] ${
                            isEnrolled
                              ? "bg-primary text-text-inverse group-hover:brightness-110 shadow-sm shadow-primary/20"
                              : "bg-primary/10 text-primary group-hover:bg-primary/15"
                          }`}
                        >
                          {isEnrolled ? (
                            <>
                              Start
                              <FontAwesomeIcon
                                icon={faArrowRight}
                                className="size-3"
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faPlay}
                                className="size-3"
                              />
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
            <div className="rounded-2xl border border-dashed border-border/60 bg-bg-elevated/50 p-12 text-center">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-primary text-xl"
                />
              </div>
              <h3 className="font-semibold text-text-primary text-lg mb-1">
                No modules yet
              </h3>
              <p className="text-sm text-text-secondary">
                Content for this course is being prepared.
              </p>
            </div>
          )}

          {isEnrolled && finalExam && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCertificate}
                    className="text-amber-500 size-4"
                  />
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  Final Exam
                </h2>
              </div>

              {certificate ? (
                <Link
                  href={`/certificates/${certificate.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-success/30 bg-success/5 hover:border-success/50 hover:bg-success/10 transition-all"
                >
                  <div className="size-11 rounded-xl bg-success flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={faAward}
                      className="size-5 text-text-inverse"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary">
                      Certificate Earned
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      View and download your course certificate
                    </p>
                  </div>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-text-inverse font-semibold text-sm group-hover:brightness-110 transition-all">
                    View Certificate
                    <FontAwesomeIcon icon={faArrowRight} className="size-3" />
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/courses/${slug}/exam`}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    completedCount >= course.lessons.length
                      ? finalExamSubmission?.status === "GRADED"
                        ? "border-success/20 bg-success/5 hover:border-success/40"
                        : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 hover:bg-amber-500/10"
                      : "border-border/60 bg-bg-elevated/50 opacity-60 cursor-default"
                  }`}
                >
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                      completedCount >= course.lessons.length
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-bg-hover text-text-muted"
                    }`}
                  >
                    <FontAwesomeIcon icon={faCertificate} className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold truncate ${
                        completedCount >= course.lessons.length
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {finalExam.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      {completedCount < course.lessons.length ? (
                        <span className="text-text-muted">
                          Complete all modules first
                        </span>
                      ) : finalExamSubmission?.status === "GRADED" ? (
                        <span
                          className={`font-medium ${
                            ((finalExamSubmission.totalScore ?? 0) * 100 /
                              (finalExam.totalMarks || 1)) >=
                            finalExam.passMark
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          Score: {finalExamSubmission.totalScore}/
                          {finalExam.totalMarks}
                          {finalExamSubmission.attemptNumber < 2 &&
                            " — Retry available"}
                        </span>
                      ) : (
                        <span className="text-text-secondary">
                          {finalExam._count.questions} questions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {completedCount >= course.lessons.length && (
                      <span
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          finalExamSubmission?.status === "GRADED"
                            ? "bg-success/10 text-success"
                            : "bg-amber-500 text-text-inverse group-hover:brightness-110"
                        }`}
                      >
                        {finalExamSubmission?.status === "GRADED"
                          ? ((finalExamSubmission.totalScore ?? 0) * 100 /
                              (finalExam.totalMarks || 1)) >=
                            finalExam.passMark
                            ? "Passed"
                            : "Retake"
                          : "Start Exam"}
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="size-3"
                        />
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          )}

          {certificate && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FontAwesomeIcon icon={faStar} className="text-amber-500 size-4" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Rate This Course</h2>
              </div>
              <ReviewSection
                slug={course.slug}
                userReview={userReview}
                allReviews={allReviews}
                averageRating={averageRating}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
