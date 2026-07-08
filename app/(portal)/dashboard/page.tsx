import { CourseCard, LeaderBoardCard } from "@/components/ui/cards";
import { amiri, inter } from "@/components/ui/fonts";
import { auth } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { DashboardAchievement, getDashboardData } from "@/lib/dashboard";
import type { Session } from "next-auth";
import {
  faAlarmClock,
  faArrowRight,
  faBookOpen,
  faCheckSquare,
  faFireAlt,
  faMedal,
  faMusic,
  faPlay,
  faSun,
  faUserGroup,
  faCheckCircle,
  faCalendarDay,
  faClipboardCheck,
  faAward,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UpcomingAppointmentCard } from "@/components/ui/AppointmentControls";

export const dynamic = "force-dynamic";

function getAppointmentTimeLabel(startTime: Date) {
  const date = new Date(startTime);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const dayLabel = isSameDay(date, today)
    ? "Today"
    : isSameDay(date, tomorrow)
      ? "Tomorrow"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${timeLabel} (${dayLabel})`;
}

function getAchievementPresentation(kind: DashboardAchievement["kind"]) {
  switch (kind) {
    case "streak":
      return {
        icon: faFireAlt,
        className: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "assessment":
      return {
        icon: faMedal,
        className: "bg-primary/10 text-primary border-primary/20",
      };
    case "bookmark":
      return {
        icon: faBookOpen,
        className: "bg-primary/10 text-primary border-primary/20",
      };
    case "session":
      return {
        icon: faCheckSquare,
        className: "bg-secondary/10 text-secondary border-secondary/20",
      };
    case "course":
    default:
      return {
        icon: faSun,
        className: "bg-primary/10 text-primary border-primary/20",
      };
  }
}

export default async function Dash(props: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab ?? "overview";

  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const userCheck = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { gender: true },
  });
  if (!userCheck?.gender) redirect("/onboarding");

  if (session.user.role === "TEACHER") {
    return <UstadhDashboard session={session} />;
  }

  const dashboardData = await getDashboardData(session.user.email);
  if (!dashboardData) redirect("/login");

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = new Date().getDay();
  const monBasedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
  const userName = dashboardData.user.name?.split(" ")[0] ?? "Student";
  const enrollments = dashboardData.activeEnrollments;
  const nextCourse = enrollments[0];
  const resumeHref = nextCourse ? `/courses/${nextCourse.slug}` : "/courses";
  const heroCopy = nextCourse
    ? `Continue ${nextCourse.title}: ${nextCourse.progress}% complete.`
    : "No active courses yet. Start learning today.";

  let analyticsData: {
    submissions: Awaited<ReturnType<typeof getStudentSubmissions>>;
    completedLessons: Awaited<ReturnType<typeof getCompletedLessons>>;
    enrollments: Awaited<ReturnType<typeof getActiveEnrollments>>;
  } | null = null;

  const certificates = await safeQuery(() =>
    prisma.ijazah.findMany({
      where: { userId: session.user.id },
      include: {
        course: { select: { title: true, slug: true, image: true, category: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
  ).catch(() => []);

  if (tab === "analytics") {
    const [submissions, completedLessons, enrollments] = await Promise.all([
      getStudentSubmissions(session.user.id),
      getCompletedLessons(session.user.id),
      getActiveEnrollments(session.user.id),
    ]);
    analyticsData = { submissions, completedLessons, enrollments };
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-elevated to-bg-secondary border border-border p-6 md:p-8 flex items-center gap-6 justify-between">
        <div className="flex flex-col max-w-2xl gap-2">
          <h1
            className={`text-text-primary text-3xl md:text-4xl font-bold tracking-tight`}
          >
            Hey, {userName}
          </h1>
          <p className="text-text-secondary text-sm md:text-base">{heroCopy}</p>
          <div className="flex items-center gap-3 mt-3">
            <Link
              href={resumeHref}
              className="inline-flex items-center gap-2 rounded-xl py-2 px-5 bg-primary text-text-inverse font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.97] shadow-sm shadow-primary/20"
            >
              <FontAwesomeIcon icon={faPlay} className="text-xs" />
              {nextCourse ? "Resume Learning" : "Browse Courses"}
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl py-2 px-5 border border-border text-text-secondary font-medium text-sm hover:bg-bg-hover hover:text-text-primary transition-all"
            >
              View Study Plan
            </Link>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-bg-elevated border border-border">
          <div className="relative size-24">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-bg-hover"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${dashboardData.weeklyProgress}, ${100 - dashboardData.weeklyProgress}`}
                pathLength="100"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-primary">
                {dashboardData.weeklyProgress}%
              </span>
            </div>
          </div>
          <div className="text-text-muted text-[10px] font-semibold tracking-[0.15em] uppercase">
            Weekly Progress
          </div>
        </div>
      </section>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-elevated border border-border w-fit">
        <Link
          href="/dashboard"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "overview"
              ? "bg-primary text-text-inverse shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Overview
        </Link>
        <Link
          href="/dashboard?tab=analytics"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "analytics"
              ? "bg-primary text-text-inverse shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Analytics
        </Link>
      </div>

      {tab === "analytics" && analyticsData ? (
        <AnalyticsContent data={analyticsData} />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Active Courses
                </h2>
                <p className="text-sm text-text-secondary">
                  Pick up where you left off
                </p>
              </div>
              <Link
                href="/courses"
                className="text-sm font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1.5"
              >
                View All{" "}
                <FontAwesomeIcon icon={faArrowRight} className="size-3" />
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.map((course) => (
                  <CourseCard
                    key={course.id}
                    image={course.image}
                    title={course.title}
                    progress={course.progress}
                    lessons={course.lessons}
                    href={`/courses/${course.slug}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-bg-elevated/50 p-10 text-center">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon
                    icon={faBookOpen}
                    className="text-primary text-lg"
                  />
                </div>
                <p className="text-text-secondary text-sm">
                  No active courses yet. Browse our catalog to get started.
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Browse courses{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="size-3" />
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-3">
                Leaderboard
              </h4>
              <div className="space-y-1">
                {dashboardData.leaderboard.length > 0 ? (
                  dashboardData.leaderboard.map((user, idx) => (
                    <LeaderBoardCard
                      key={user.id}
                      currentUser={user.id === dashboardData.user.id}
                      rank={user.rank}
                      name={user.name}
                      xp={user.xp}
                      image={user.image}
                    />
                  ))
                ) : (
                  <p className="text-sm text-text-secondary">
                    No leaderboard data yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-3">
                Learning Streak
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl font-bold text-text-primary">
                  {dashboardData.streak}
                </span>
                <span className="text-sm text-text-secondary">day streak</span>
                <FontAwesomeIcon
                  icon={faFireAlt}
                  className={
                    dashboardData.streak >= 7
                      ? "text-orange-500"
                      : dashboardData.streak > 0
                        ? "text-primary"
                        : "text-text-muted"
                  }
                />
              </div>
              <div className="flex items-center gap-1.5">
                {weekDays.map((day, idx) => {
                  const isStreakDay = idx < dashboardData.streak;
                  const isFuture = idx > monBasedIdx;
                  const isToday = idx === monBasedIdx;
                  return (
                    <div
                      key={`${day}-${idx}`}
                      className={`rounded-full flex items-center justify-center size-8 uppercase font-bold text-xs transition-colors ${
                        isToday
                          ? "bg-primary text-text-inverse ring-2 ring-primary/30"
                          : isFuture
                            ? "bg-bg-hover text-text-muted"
                            : isStreakDay
                              ? "bg-primary/10 text-primary"
                              : "bg-bg-hover text-text-muted/50"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {dashboardData.weeklySchedule.length > 0 ? (
              <div className="rounded-2xl border border-border bg-bg-elevated p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-4">
                  Weekly Schedule
                </h3>
                <div className="space-y-2">
                  {dashboardData.weeklySchedule.map((slot) => {
                    const dayName = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ][slot.dayOfWeek];
                    const isToday = slot.dayOfWeek === new Date().getDay();
                    return (
                      <div
                        key={`${slot.dayOfWeek}-${slot.type}`}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${
                          isToday
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "bg-bg-hover"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold w-8 ${isToday ? "text-primary" : "text-text-primary"}`}
                          >
                            {dayName}
                          </span>
                          <span className="text-text-secondary text-xs uppercase tracking-wider font-medium">
                            {slot.type === "DAILY_HIFDH"
                              ? "Hifdh"
                              : "Muraja'ah"}
                          </span>
                        </div>
                        <span className="text-text-primary font-medium">
                          {new Date(
                            "2000-01-01T" + slot.startTime,
                          ).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/courses/hifdh-ul-quran"
                  className="mt-4 block w-full text-center bg-primary text-text-inverse py-3 rounded-xl font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.97] shadow-sm shadow-primary/20"
                >
                  Go to Course
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-bg-elevated p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-4">
                  Weekly Schedule
                </h3>
                <p className="text-sm text-text-secondary">
                  No sessions scheduled yet.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-bg-elevated p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-4">
                Recent Achievements
              </h3>
              {dashboardData.achievements.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {dashboardData.achievements.map((achievement) => {
                    const presentation = getAchievementPresentation(
                      achievement.kind,
                    );
                    return (
                      <div
                        key={achievement.id}
                        className="flex flex-col items-center text-center gap-1.5 group"
                      >
                        <div
                          className={`size-12 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${presentation.className}`}
                        >
                          <FontAwesomeIcon
                            icon={presentation.icon}
                            className="size-4"
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-text-primary leading-tight">
                          {achievement.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Achievements will appear as you study.
                </p>
              )}
            </div>

            {certificates.length > 0 && (
              <div className="rounded-2xl border border-border bg-bg-elevated p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-4">
                  My Certificates
                </h3>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <Link
                      key={cert.id}
                      href={`/certificates/${cert.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-hover hover:bg-primary/5 transition-colors group"
                    >
                      <div className="size-10 rounded-lg bg-success-muted flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faAward} className="size-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {cert.course.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className="size-3 text-text-muted group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/courses"
                  className="block text-xs text-primary hover:text-primary-light font-medium mt-3"
                >
                  View all certificates
                </Link>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-bg-elevated p-5 space-y-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.12em] mb-3">
                Quick Resources
              </h3>
              <Link
                href="/revision"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-hover hover:bg-primary/5 hover:text-primary transition-colors text-sm text-text-secondary"
              >
                <FontAwesomeIcon
                  icon={faMusic}
                  className="size-4 text-primary/60"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    Revision
                  </span>
                  <span className="text-xs text-text-muted">
                    Review your memorization plan
                  </span>
                </div>
              </Link>
              <Link
                href="/mushaf"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-hover hover:bg-primary/5 hover:text-primary transition-colors text-sm text-text-secondary"
              >
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="size-4 text-primary/60"
                />
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">Mushaf</span>
                  <span className="text-xs text-text-muted">
                    Read from the holy Quran
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

async function getStudentSubmissions(studentId: string) {
  return safeQuery(() =>
    prisma.submission.findMany({
      where: { studentId, status: "GRADED" },
      include: {
        exam: {
          select: {
            title: true,
            totalMarks: true,
            passMark: true,
            courseId: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
  );
}

async function getCompletedLessons(studentId: string) {
  return safeQuery(() =>
    prisma.lessonProgress.findMany({
      where: { studentId, completed: true },
      include: {
        lesson: {
          select: {
            title: true,
            courseId: true,
            course: { select: { title: true, slug: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    }),
  );
}

async function getActiveEnrollments(studentId: string) {
  return safeQuery(() =>
    prisma.enrollment.findMany({
      where: { userId: studentId, status: "ACTIVE" },
      include: { course: { select: { title: true, slug: true } } },
    }),
  );
}

function AnalyticsContent({
  data,
}: {
  data: {
    submissions: Awaited<ReturnType<typeof getStudentSubmissions>>;
    completedLessons: Awaited<ReturnType<typeof getCompletedLessons>>;
    enrollments: Awaited<ReturnType<typeof getActiveEnrollments>>;
  };
}) {
  const { submissions, completedLessons, enrollments } = data;

  const avgScore =
    submissions.length > 0
      ? submissions.reduce(
          (sum, s) => sum + ((s.totalScore ?? 0) / s.exam.totalMarks) * 100,
          0,
        ) / submissions.length
      : 0;
  const passCount = submissions.filter(
    (s) =>
      s.exam.totalMarks > 0 &&
      ((s.totalScore ?? 0) / s.exam.totalMarks) * 100 >= 50,
  ).length;

  const courseModules: Record<
    string,
    { title: string; slug: string; done: number }
  > = {};
  for (const lp of completedLessons) {
    const cId = lp.lesson.courseId;
    if (!courseModules[cId]) {
      courseModules[cId] = {
        title: lp.lesson.course.title,
        slug: lp.lesson.course.slug,
        done: 0,
      };
    }
    courseModules[cId].done++;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className="text-primary size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {submissions.length}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Quizzes Taken
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
              <FontAwesomeIcon icon={faAward} className="text-success size-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {avgScore.toFixed(0)}%
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Avg Score
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-primary size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {completedLessons.length}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Modules Done
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="text-info size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {passCount}/{submissions.length}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Passed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <h2 className="font-bold text-text-primary mb-4">Quiz Results</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-text-secondary">No quizzes taken yet.</p>
          ) : (
            <div className="space-y-2">
              {submissions.slice(0, 5).map((s) => {
                const pct =
                  s.exam.totalMarks > 0
                    ? ((s.totalScore ?? 0) / s.exam.totalMarks) * 100
                    : 0;
                const passed = pct >= 50;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-hover"
                  >
                    <p className="text-sm font-medium text-text-primary">
                      {s.exam.title}
                    </p>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${passed ? "text-success" : "text-danger"}`}
                      >
                        {s.totalScore}/{s.exam.totalMarks}
                      </p>
                      <p
                        className={`text-[11px] ${passed ? "text-success" : "text-danger"}`}
                      >
                        {pct.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <h2 className="font-bold text-text-primary mb-4">
            Modules Completed
          </h2>
          {Object.keys(courseModules).length === 0 ? (
            <p className="text-sm text-text-secondary">
              No modules completed yet.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(courseModules).map(([cId, data]) => (
                <Link
                  key={cId}
                  href={`/courses/${data.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-hover hover:bg-primary/5 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-text-primary">
                      {data.title}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {data.done} modules completed
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="size-3 text-text-muted"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function UstadhDashboard({ session }: { session: Session }) {
  const ustadhId = session.user.id;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const [
    todaySessions,
    weekSessions,
    activeMatches,
    completedThisMonth,
    weeklySlots,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        teacherId: ustadhId,
        startTime: { gte: startOfDay, lt: endOfDay },
      },
      include: {
        mentorship: {
          include: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        teacherId: ustadhId,
        startTime: { gte: startOfWeek, lt: endOfWeek },
      },
      include: {
        mentorship: {
          include: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.mentorship.findMany({
      where: { teacherId: ustadhId, status: "ACTIVE" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            quranProgress: true,
            studentNotes: {
              where: { ustadhId, resolved: false },
              select: { id: true },
            },
          },
        },
      },
    }),
    prisma.appointment.count({
      where: {
        teacherId: ustadhId,
        status: "COMPLETED",
        startTime: { gte: startOfMonth, lt: endOfMonth },
      },
    }),
    prisma.recurringSlot.findMany({
      where: {
        mentorship: { teacherId: ustadhId, status: "ACTIVE" },
      },
      include: {
        mentorship: {
          select: { student: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const title = session.user.gender === "female" ? "Ustadha" : "Ustadh";
  const firstName = session.user.name?.split(" ")[0] ?? "";
  const todayRecurringCount = weeklySlots.filter(
    (s) => s.dayOfWeek === now.getDay(),
  ).length;

  const weekGrouped: Record<number, typeof weekSessions> = {};
  for (const s of weekSessions) {
    const day = s.startTime.getDay();
    if (!weekGrouped[day]) weekGrouped[day] = [];
    weekGrouped[day].push(s);
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getDayName(day: number) {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
  }

  function canJoin(scheduledAt: Date, now: number) {
    return (
      scheduledAt.getTime() - now <= 15 * 60 * 1000 &&
      scheduledAt.getTime() - now >= -60 * 60 * 1000
    );
  }

  function canCancel(scheduledAt: Date, now: number) {
    return scheduledAt.getTime() - now > 60 * 60 * 1000;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <section>
        <h1 className={`text-3xl font-bold text-text-primary tracking-tight`}>
          Hello, {title} {firstName}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here&apos;s your overview for today.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faUserGroup}
                className="text-primary size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {activeMatches.length}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Active Students
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-success size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {completedThisMonth}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Sessions This Month
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faCalendarDay}
                className="text-info size-4"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {todaySessions.length || todayRecurringCount}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-semibold">
                Today&apos;s Sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Today&apos;s Sessions
        </h2>
        {todaySessions.length === 0 && todayRecurringCount === 0 ? (
          <p className="text-sm text-text-secondary">
            No sessions scheduled for today.
          </p>
        ) : todaySessions.length === 0 ? (
          <div className="space-y-2">
            {weeklySlots
              .filter((s) => s.dayOfWeek === now.getDay())
              .map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {s.mentorship.student.name?.split(" ")[0] ?? "Student"}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {s.type === "DAILY_HIFDH" ? "Hifdh" : "Muraja'ah"} ·{" "}
                      {new Date(`2000-01-01T${s.startTime}`).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    Waiting for student to start
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((s) => (
              <UpcomingAppointmentCard
                key={s.id}
                id={s.id}
                studentName={
                  s.mentorship.student.name?.split(" ")[0] ?? "Student"
                }
                studentId={s.mentorship.student.id}
                teacherId={ustadhId}
                startTime={s.startTime}
                status={s.status}
                canJoin={canJoin(s.startTime, now.getTime())}
                canCancel={canCancel(s.startTime, now.getTime())}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          This Week&apos;s Sessions
        </h2>
        {weekSessions.length === 0 && weeklySlots.length === 0 ? (
          <p className="text-sm text-text-secondary">No sessions this week.</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const daySlots = weeklySlots.filter((s) => s.dayOfWeek === i);
              const dayAppointments = weekGrouped[i] ?? [];
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-bg-elevated p-3"
                >
                  <p className="text-[11px] font-semibold text-text-muted uppercase mb-2">
                    {getDayName(i)}
                  </p>
                  <div className="space-y-1.5">
                    {dayAppointments.map((s) => (
                      <div
                        key={s.id}
                        className="text-xs bg-primary/5 rounded-lg px-2.5 py-1.5"
                      >
                        <p className="font-medium text-text-primary">
                          {s.mentorship.student.name?.split(" ")[0] ?? "S"}
                        </p>
                        <p className="text-text-muted">
                          {formatTime(s.startTime)}
                        </p>
                      </div>
                    ))}
                    {dayAppointments.length === 0 &&
                      daySlots.map((s) => (
                        <div
                          key={s.id}
                          className="text-xs bg-bg-hover rounded-lg px-2.5 py-1.5 border border-dashed border-border"
                        >
                          <p className="font-medium text-text-primary">
                            {s.mentorship.student.name?.split(" ")[0] ?? "S"}
                          </p>
                          <p className="text-text-muted">{s.startTime}</p>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">My Students</h2>
          <Link
            href="/students"
            className="text-sm font-medium text-primary hover:text-primary-light flex items-center gap-1"
          >
            View All <FontAwesomeIcon icon={faArrowRight} className="size-3" />
          </Link>
        </div>
        {activeMatches.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No active students assigned.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMatches.map((m) => {
              const progress = m.student.quranProgress?.[0];
              return (
                <Link
                  key={m.student.id}
                  href={`/students/${m.student.id}`}
                  className="rounded-2xl border border-border bg-bg-elevated p-5 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-text-primary">
                    {m.student.name?.split(" ")[0] ?? "Student"}
                  </p>
                  <div className="mt-2 text-sm text-text-secondary space-y-1">
                    <p>
                      Current: Surah {progress?.lastSurah ?? "?"}:
                      {progress?.lastVerse ?? "?"}
                    </p>
                    <p>Open notes: {m.student.studentNotes.length}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
