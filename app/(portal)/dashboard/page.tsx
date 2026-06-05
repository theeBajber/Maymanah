import { CourseCard, LeaderBoardCard } from "@/app/ui/cards";
import { amiri } from "@/app/ui/fonts";
import { TopNav } from "@/app/ui/PortalNav";
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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  image?: string;
  progress?: number;
};

type LeaderboardUser = {
  id: string;
  name: string;
  image?: string;
  xp: number;
};

type Appointment = {
  id: string;
  title: string;
  startTime: string;
  teacherName: string;
  teacherImage?: string;
  meetingUrl?: string;
};

export default async function Dash() {
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  let dashboardData: {
    user?: { id: string; name: string; image: string };
    weeklyProgress?: number;
    streak?: number;
    leaderboard?: LeaderboardUser[];
    activeEnrollments?: Course[];
    upcomingAppointment?: Appointment;
  } | undefined;
  try {
    const res = await fetch(`/api/dashboard`, {
      cache: "no-store",
    });
    if (res.ok) {
      dashboardData = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch dashboard data", e);
  }

  const userName = dashboardData?.user?.name?.split(" ")[0] ?? "Ahmed";
  const weeklyProgress = dashboardData?.weeklyProgress ?? 0;
  const streak = dashboardData?.streak ?? 0;
  const leaderboardData = dashboardData?.leaderboard ?? [];
  const enrollments = dashboardData?.activeEnrollments ?? [];

  const upcomingAppointment = dashboardData?.upcomingAppointment ?? null;

  return (
    <div className="flex flex-col max-w-7xl w-full h-full pt-16">
      <TopNav />
      <div className="flex-1 p-6 flex flex-col gap-6">
        <section className="w-full bg-bg-card rounded-xl p-8 flex items-center gap-4 justify-between *:h-full">
          <div className="flex flex-col max-w-2xl gap-2 p-2">
            <h1 className={`text-primary ${amiri.className} text-3xl`}>
              Hey, {userName}
            </h1>
            <p className="text-text-secondary">
              {enrollments.length > 0
                ? `You're 3 lessons away from completing your weekly goal — ${enrollments[0].title} awaits.`
                : "No active courses yet. Start learning today!"}
            </p>
            <div className="flex items-center gap-4 my-4">
              <Link
                href="/learn"
                className="rounded-xl py-1.5 px-4 flex items-center gap-2 bg-primary text-text-inverse"
              >
                <FontAwesomeIcon icon={faPlay} className="text-xs" />
                Resume Learning
              </Link>
              <Link
                href="/Courses"
                className="rounded-xl border border-primary py-1.5 px-4"
              >
                View Study Plan
              </Link>
            </div>
          </div>
          <div className="h-full text-center p-6 rounded-2xl flex flex-col justify-center bg-primary-subtle items-center gap-2">
            <div className="text-3xl font-bold text-text-primary">
              {weeklyProgress}%
            </div>
            <div className="text-text-primary/70 text-sm">WEEKLY PROGRESS</div>
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
                href={"/Courses"}
                className="text-primary hover:text-primary-dark transition-colors flex gap-2 items-center"
              >
                View All <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4">
              {enrollments.length > 0 ? (
                enrollments.map((c) => (
                  <CourseCard
                    key={c.id}
                    image={c.image}
                    title={c.title}
                    progress={c.progress}
                    href={`/courses/${c.slug}`}
                  />
                ))
              ) : (
                <div className="col-span-2 h-64 rounded-xl flex flex-col gap-2 p-6 bg-bg-card items-center justify-center text-text-secondary">
                  <FontAwesomeIcon icon={faBookOpen} className="text-3xl mb-2" />
                  <p>No active courses yet. Browse our catalog to get started.</p>
                </div>
              )}
              <div className="bg-bg-card col-span-2 h-64 rounded-xl flex flex-col gap-2 p-6">
                <h4 className="uppercase text-text-secondary mb-2 tracking-wider">
                  Leaderboard
                </h4>
                <div className="flex flex-col gap-2">
                  {leaderboardData.length > 0 ? (
                    leaderboardData.map((u, idx) => (
                      <LeaderBoardCard
                        key={u.id}
                        currentUser={u.id === dashboardData?.user?.id}
                        rank={idx + 1}
                        name={u.name}
                        xp={u.xp}
                        image={u.image}
                      />
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No leaderboard data yet.</p>
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
                {streak} Day Streak!{" "}
                <FontAwesomeIcon
                  icon={faFireAlt}
                  className="text-primary animate-pulse duration-700"
                />
              </div>
              <div className="flex items-center gap-2">
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="rounded-full flex items-center justify-center size-8 bg-primary-subtle text-text-primary/80 uppercase font-bold text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <FontAwesomeIcon
                icon={faFireAlt}
                className="absolute -right-2 bottom-0 text-5xl opacity-10"
              />
            </div>
            {upcomingAppointment ? (
              <div className="bg-bg-card w-full h-120 rounded-xl p-6 border border-border shadow-xl shadow-primary/5 overflow-hidden">
                <h3 className="text-sm text-text-secondary uppercase mb-4">
                  Upcoming Session
                </h3>
                <div className="flex items-start gap-4 mb-6">
                  {upcomingAppointment.teacherImage ? (
                    <Image
                      alt={upcomingAppointment.teacherName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                      src={upcomingAppointment.teacherImage}
                      width={56}
                      height={56}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-subtle border-2 border-primary flex items-center justify-center text-primary font-bold">
                      {upcomingAppointment.teacherName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold">{upcomingAppointment.title}</h4>
                    <div className="flex items-center gap-2 text-primary font-semibold mt-1">
                      <FontAwesomeIcon
                        icon={faAlarmClock}
                        className="text-sm"
                      />
                      <span>
                        {new Date(
                          upcomingAppointment.startTime
                        ).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        (Today)
                      </span>
                    </div>
                  </div>
                </div>
                {upcomingAppointment.meetingUrl ? (
                  <a
                    href={upcomingAppointment.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block text-center bg-primary text-text-inverse py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Join Session
                  </a>
                ) : (
                  <button className="w-full bg-primary text-text-inverse py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98]">
                    Join Session
                  </button>
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
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center text-center gap-1 group">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary border-2 border-primary shadow-inner transition-transform group-hover:scale-110">
                    <FontAwesomeIcon
                      icon={faSun}
                      className="text-text-inverse"
                    />
                  </div>
                  <p className="text-[10px] font-bold leading-tight">
                    Early Bird
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-1 group">
                  <div className="w-14 h-14 rounded-full bg-bg-primary flex items-center justify-center text-tertiary border-2 border-bg-primary shadow-inner transition-transform group-hover:scale-110">
                    <FontAwesomeIcon icon={faMedal} />
                  </div>
                  <p className="text-[10px] font-bold leading-tight">
                    Juz Amma Master
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-1 group">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-secondary border-2 border-secondary shadow-inner transition-transform group-hover:scale-110">
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="text-text-inverse"
                    />
                  </div>
                  <p className="text-[10px] font-bold leading-tight">
                    Consistency King
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl w-full bg-bg-card shadow-sm border border-border flex flex-col gap-2 p-6">
              <h3 className="text-sm text-text-secondary uppercase mb-4">
                Quick Resources
              </h3>
              <Link
                href={""}
                className="rounded-lg bg-primary-subtle w-full px-4 py-1.5 flex gap-4 items-center"
              >
                <FontAwesomeIcon icon={faMusic} />
                <div className="flex flex-col">
                  Audio Library
                  <p className="text-text-secondary text-xs">
                    Listen to master reciters
                  </p>
                </div>
              </Link>
              <Link
                href={""}
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
