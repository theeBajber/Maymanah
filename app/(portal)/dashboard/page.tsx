import { CourseCard, LeaderBoardCard } from "@/components/ui/cards";
import { amiri, inter } from "@/components/ui/fonts";
import { TopNav } from "@/components/ui/PortalNav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

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
        className: "bg-secondary text-text-inverse border-secondary",
      };
    case "assessment":
      return {
        icon: faMedal,
        className: "bg-bg-primary text-tertiary border-bg-primary",
      };
    case "bookmark":
      return {
        icon: faBookOpen,
        className: "bg-primary-subtle text-primary border-primary-subtle",
      };
    case "session":
      return {
        icon: faCheckSquare,
        className: "bg-secondary text-text-inverse border-secondary",
      };
    case "course":
    default:
      return {
        icon: faSun,
        className: "bg-primary text-text-inverse border-primary",
      };
  }
}

export default async function Dash() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  if (session.user.role === "TEACHER") {
    return <UstadhDashboard session={session} />;
  }

  const dashboardData = await getDashboardData(session.user.email);
  if (!dashboardData) redirect("/login");

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = new Date().getDay(); // 0=Sun → shift to Mon=0
  const monBasedIdx = todayIdx === 0 ? 6 : todayIdx - 1;
  const userName = dashboardData.user.name?.split(" ")[0] ?? "Student";
  const enrollments = dashboardData.activeEnrollments;
  const nextCourse = enrollments[0];
  const resumeHref = nextCourse ? `/courses/${nextCourse.slug}` : "/courses";
  const heroCopy = nextCourse
    ? `Continue ${nextCourse.title}: ${nextCourse.progress}% complete.`
    : "No active courses yet. Start learning today.";

  return (
    <div className="flex flex-col max-w-7xl w-full h-full pt-16">
      <TopNav />
      <div className="flex-1 p-6 flex flex-col gap-6">
        <section className="w-full bg-bg-card rounded-xl p-8 flex items-center gap-4 justify-between *:h-full">
          <div className="flex flex-col max-w-2xl gap-2 p-2">
            <h1 className={`text-primary ${inter.className} text-3xl`}>
              Hey, {userName}
            </h1>
            <p className="text-text-secondary">{heroCopy}</p>
            <div className="flex items-center gap-4 my-4">
              <Link
                href={resumeHref}
                className="rounded-xl py-1.5 px-4 flex items-center gap-2 bg-primary text-text-inverse"
              >
                <FontAwesomeIcon icon={faPlay} className="text-xs" />
                {nextCourse ? "Resume Learning" : "Browse Courses"}
              </Link>
              <Link
                href="/courses"
                className="rounded-xl border border-primary py-1.5 px-4"
              >
                View Study Plan
              </Link>
            </div>
          </div>
          <div className="h-full flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-primary-subtle">
            <div className="relative size-24">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-bg-primary"
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
              <div className="absolute inset-0 flex items-center justify-center z-5">
                <span className="text-2xl font-bold text-text-primary">
                  {dashboardData.weeklyProgress}%
                </span>
              </div>
            </div>
            <div className="text-text-primary/70 text-xs tracking-widest">
              WEEKLY PROGRESS
            </div>
          </div>
        </section>
        <section className="w-full flex gap-6 h-162">
          <div className="w-full flex flex-col py-4">
            <div className="flex w-full justify-between items-center">
              <div className=" flex flex-col">
                <h2 className="text-2xl">Active Courses</h2>
                <p className="text-sm text-text-secondary">
                  Pick up where you left off
                </p>
              </div>
              <Link
                href="/courses"
                className="text-primary hover:text-primary-dark transition-colors flex gap-2 items-center"
              >
                View All <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4">
              {enrollments.length > 0 ? (
                enrollments.map((course) => (
                  <CourseCard
                    key={course.id}
                    image={course.image}
                    title={course.title}
                    progress={course.progress}
                    lessons={course.lessons}
                    href={`/courses/${course.slug}`}
                  />
                ))
              ) : (
                <div className="col-span-2 h-64 rounded-xl flex flex-col gap-2 p-6 bg-bg-card items-center justify-center text-text-secondary">
                  <FontAwesomeIcon
                    icon={faBookOpen}
                    className="text-3xl mb-2"
                  />
                  <p>
                    No active courses yet. Browse our catalog to get started.
                  </p>
                </div>
              )}
              <div className="bg-bg-card col-span-2 h-64 rounded-xl flex flex-col gap-2 p-6">
                <h4 className="uppercase text-text-secondary mb-2 tracking-wider">
                  Leaderboard
                </h4>
                <div className="flex flex-col gap-2">
                  {dashboardData.leaderboard.length > 0 ? (
                    dashboardData.leaderboard.map((user, idx) => (
                      <LeaderBoardCard
                        key={user.id}
                        currentUser={user.id === dashboardData.user.id}
                        rank={idx + 1}
                        name={user.name}
                        xp={user.xp}
                        image={user.image}
                      />
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">
                      No leaderboard data yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-lg md:h-full overflow-x-hidden overflow-y-scroll flex flex-col gap-4">
            <div className="bg-bg-card border-border border h-40 rounded-xl shadow-sm flex flex-col p-6 relative">
              <h4 className="uppercase tracking-wider text-sm text-text-secondary">
                Learning Streak
              </h4>
              <div className="text-xl font-bold mb-2">
                {dashboardData.streak} Day Streak{" "}
                <FontAwesomeIcon
                  icon={faFireAlt}
                  className={
                    dashboardData.streak >= 7
                      ? "text-orange-500 animate-bounce duration-700"
                      : dashboardData.streak > 0
                        ? "text-primary animate-pulse duration-700"
                        : "text-text-muted"
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                {weekDays.map((day, idx) => {
                  const isStreakDay = idx < dashboardData.streak;
                  const isFuture = idx > monBasedIdx;
                  const isToday = idx === monBasedIdx;
                  return (
                    <div
                      key={`${day}-${idx}`}
                      className={`rounded-full flex items-center justify-center size-8 uppercase font-bold text-sm transition-colors ${
                        isToday
                          ? "bg-success text-text-inverse ring-2 ring-success ring-offset-2 ring-offset-bg-card"
                          : isFuture
                            ? "bg-bg-hover text-text-muted"
                            : isStreakDay
                              ? "bg-primary text-text-inverse"
                              : "bg-primary-subtle text-text-primary/80"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <FontAwesomeIcon
                icon={faFireAlt}
                className="absolute -right-2 bottom-0 text-5xl opacity-10"
              />
            </div>
            {dashboardData.upcomingAppointment ? (
              <div className="bg-bg-card w-full h-120 rounded-xl p-6 border border-border shadow-xl shadow-primary/5 overflow-hidden">
                <h3 className="text-sm text-text-secondary uppercase mb-4">
                  Upcoming Session
                </h3>
                <div className="flex items-start gap-4 mb-6">
                  {dashboardData.upcomingAppointment.teacherImage ? (
                    <Image
                      alt={
                        dashboardData.upcomingAppointment.teacherName ??
                        "Teacher"
                      }
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                      src={dashboardData.upcomingAppointment.teacherImage}
                      width={56}
                      height={56}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-subtle border-2 border-primary flex items-center justify-center text-primary font-bold">
                      {(
                        dashboardData.upcomingAppointment.teacherName ??
                        "Teacher"
                      )
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold">
                      {dashboardData.upcomingAppointment.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {dashboardData.upcomingAppointment.teacherName ??
                        "Teacher"}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-semibold mt-1">
                      <FontAwesomeIcon
                        icon={faAlarmClock}
                        className="text-sm"
                      />
                      <span>
                        {getAppointmentTimeLabel(
                          dashboardData.upcomingAppointment.startTime,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {dashboardData.upcomingAppointment.meetingUrl ? (
                  <a
                    href={dashboardData.upcomingAppointment.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center bg-primary text-text-inverse py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Join Session
                  </a>
                ) : (
                  <div className="w-full text-center bg-primary-subtle text-text-secondary py-4 rounded-2xl font-bold">
                    Meeting link pending
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-bg-card w-full h-120 rounded-xl p-6 border border-border shadow-xl shadow-primary/5 overflow-hidden">
                <h3 className="text-sm text-text-secondary uppercase mb-4">
                  Upcoming Session
                </h3>
                <p className="text-text-secondary">No upcoming sessions.</p>
              </div>
            )}
            <div className="bg-bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-sm text-text-secondary uppercase mb-4">
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
                        className="flex flex-col items-center text-center gap-1 group"
                      >
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-inner transition-transform group-hover:scale-110 ${presentation.className}`}
                        >
                          <FontAwesomeIcon icon={presentation.icon} />
                        </div>
                        <p className="text-[10px] font-bold leading-tight">
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
            <div className="rounded-xl w-full bg-bg-card shadow-sm border border-border flex flex-col gap-2 p-6">
              <h3 className="text-sm text-text-secondary uppercase mb-4">
                Quick Resources
              </h3>
              <Link
                href="/revision"
                className="rounded-lg bg-primary-subtle w-full px-4 py-1.5 flex gap-4 items-center"
              >
                <FontAwesomeIcon icon={faMusic} />
                <div className="flex flex-col">
                  Revision
                  <p className="text-text-secondary text-xs">
                    Review your memorization plan
                  </p>
                </div>
              </Link>
              <Link
                href="/mushaf"
                className="rounded-lg bg-primary-subtle w-full px-4 py-1.5 flex gap-4 items-center"
              >
                <FontAwesomeIcon icon={faBookOpen} />
                <div className="flex flex-col">
                  Mushaf
                  <p className="text-text-secondary text-xs">
                    Read from the holy Quran
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
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

  const [todaySessions, weekSessions, activeMatches, completedThisMonth] =
    await Promise.all([
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
    ]);

  const title = session.user.gender === "female" ? "Ustadha" : "Ustadh";
  const firstName = session.user.name?.split(" ")[0] ?? "";

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
    <div className="flex flex-col max-w-6xl w-full h-full pt-16 mx-auto">
      <TopNav />
      <div className="flex-1 p-6 space-y-8 overflow-auto">
        <section>
          <h1 className={`text-3xl text-primary ${amiri.className}`}>
            Hello, {title} {firstName}
          </h1>
          <p className="text-text-secondary mt-1">
            Here&apos;s your overview for today.
          </p>
        </section>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary-muted flex items-center justify-center">
                <FontAwesomeIcon icon={faUserGroup} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMatches.length}</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">
                  Active Students
                </p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success-muted flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-success"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedThisMonth}</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">
                  Sessions This Month
                </p>
              </div>
            </div>
          </div>
          <div className="bg-bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info-muted flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarDay} className="text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">
                  Today&apos;s Sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Today&apos;s Sessions</h2>
          {todaySessions.length === 0 ? (
            <p className="text-text-secondary">
              No sessions scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-bg-card rounded-xl p-4 border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {s.mentorship.student.name?.split(" ")[0] ?? "Student"}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {formatTime(s.startTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        s.status === "SCHEDULED"
                          ? "bg-info-muted text-info"
                          : s.status === "ONGOING"
                            ? "bg-warning-muted text-warning"
                            : s.status === "COMPLETED"
                              ? "bg-success-muted text-success"
                              : "bg-danger-muted text-danger"
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.status === "SCHEDULED" && (
                      <>
                        {canJoin(s.startTime, now.getTime()) && (
                          <Link
                            href={`/session/${s.id}`}
                            className="text-sm bg-secondary text-text-inverse px-3 py-1.5 rounded-lg hover:bg-secondary-dark transition-colors"
                          >
                            Join
                          </Link>
                        )}
                        {canCancel(s.startTime, now.getTime()) && (
                          <button className="text-sm border border-danger text-danger px-3 py-1.5 rounded-lg hover:bg-danger-muted transition-colors">
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            This Week&apos;s Sessions
          </h2>
          {weekSessions.length === 0 ? (
            <p className="text-text-secondary">No sessions this week.</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="bg-bg-card rounded-xl border border-border p-3"
                >
                  <p className="text-xs font-semibold text-text-secondary uppercase mb-2">
                    {getDayName(i)}
                  </p>
                  <div className="space-y-1.5">
                    {(weekGrouped[i] ?? []).map((s) => (
                      <div
                        key={s.id}
                        className="text-xs bg-primary-muted rounded px-2 py-1"
                      >
                        <p className="font-medium">
                          {s.mentorship.student.name?.split(" ")[0] ?? "S"}
                        </p>
                        <p className="text-text-muted">
                          {formatTime(s.startTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Students</h2>
            <Link
              href="/students"
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
            >
              View All{" "}
              <FontAwesomeIcon icon={faArrowRight} className="size-3" />
            </Link>
          </div>
          {activeMatches.length === 0 ? (
            <p className="text-text-secondary">No active students assigned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMatches.map((m) => {
                const progress = m.student.quranProgress?.[0];
                return (
                  <Link
                    key={m.student.id}
                    href={`/students/${m.student.id}`}
                    className="bg-bg-card rounded-xl p-4 border border-border hover:border-primary hover:shadow-sm transition-all"
                  >
                    <p className="font-medium">
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
    </div>
  );
}
