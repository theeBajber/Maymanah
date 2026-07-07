import { prisma } from "@/lib/prisma";

export type DashboardCourse = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  category: string;
  progress: number;
  lessons: number;
};

export type DashboardLeaderboardUser = {
  id: string;
  name: string | null;
  image: string | null;
  xp: number;
  rank: number;
};

export type DashboardAchievement = {
  id: string;
  title: string;
  kind: "course" | "streak" | "assessment" | "bookmark" | "session";
};

export type DashboardData = {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  weeklyProgress: number;
  streak: number;
  leaderboard: DashboardLeaderboardUser[];
  currentUserRank: number | null;
  activeEnrollments: DashboardCourse[];
  upcomingAppointment: {
    id: string;
    title: string;
    startTime: Date;
    teacherName: string | null;
    teacherImage: string | null;
    meetingUrl: string | null;
  } | null;
  weeklySchedule: {
    dayOfWeek: number;
    type: string;
    startTime: string;
    duration: number;
  }[];
  achievements: DashboardAchievement[];
};

function calculateStreak(activityDates: Date[]) {
  const uniqueDays = new Set(activityDates.map((date) => date.toDateString()));
  const sortedDays = Array.from(uniqueDays).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  if (sortedDays.length === 0) return 0;

  const mostRecent = new Date(sortedDays[0]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  mostRecent.setHours(0, 0, 0, 0);

  const dayMs = 86400000;
  const diffDays = Math.round((today.getTime() - mostRecent.getTime()) / dayMs);
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const current = new Date(sortedDays[i - 1]).getTime();
    const previous = new Date(sortedDays[i]).getTime();
    if (current - previous === dayMs) streak++;
    else break;
  }

  return streak;
}

function buildAchievements({
  courses,
  streak,
  bestAssessmentScore,
  bookmarkCount,
  hasUpcomingAppointment,
}: {
  courses: DashboardCourse[];
  streak: number;
  bestAssessmentScore: number | null;
  bookmarkCount: number;
  hasUpcomingAppointment: boolean;
}) {
  const achievements: DashboardAchievement[] = [];

  if (courses.some((course) => course.progress >= 100)) {
    achievements.push({ id: "course-complete", title: "Course Finisher", kind: "course" });
  }

  if (streak >= 7) {
    achievements.push({ id: "streak-7", title: "7 Day Streak", kind: "streak" });
  } else if (streak > 0) {
    achievements.push({ id: "streak-started", title: "Streak Started", kind: "streak" });
  }

  if (bestAssessmentScore !== null && bestAssessmentScore >= 80) {
    achievements.push({ id: "strong-recitation", title: "Strong Recitation", kind: "assessment" });
  }

  if (bookmarkCount > 0) {
    achievements.push({ id: "quran-notes", title: "Quran Notes", kind: "bookmark" });
  }

  if (hasUpcomingAppointment) {
    achievements.push({ id: "session-ready", title: "Session Ready", kind: "session" });
  }

  if (achievements.length === 0 && courses.length > 0) {
    achievements.push({ id: "active-learner", title: "Active Learner", kind: "course" });
  }

  return achievements.slice(0, 3);
}

export async function getDashboardData(email: string): Promise<DashboardData | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
              category: true,
              _count: { select: { lessons: true } },
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
        take: 4,
      },
      appointments: {
        where: { status: "SCHEDULED", startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 1,
        include: {
          teacher: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, score: true, createdAt: true },
      },
      _count: { select: { bookmarks: true } },
    },
  });

  if (!user) return null;

  const mentorship = await prisma.mentorship.findFirst({
    where: { studentId: user.id, status: "ACTIVE" },
    include: { recurringSlots: { orderBy: { dayOfWeek: "asc" } } },
  });

  const weeklySchedule = (mentorship?.recurringSlots ?? []).map((s) => ({
    dayOfWeek: s.dayOfWeek,
    type: s.type,
    startTime: s.startTime,
    duration: s.duration,
  }));

  const activeEnrollments = user.enrollments.map((enrollment) => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    slug: enrollment.course.slug,
    image: enrollment.course.image,
    category: enrollment.course.category,
    progress: enrollment.progress,
    lessons: enrollment.course._count.lessons,
  }));

  const weeklyProgress = activeEnrollments.length > 0
    ? Math.round(
        activeEnrollments.reduce((sum, course) => sum + course.progress, 0) /
          activeEnrollments.length,
      )
    : 0;

  const [loginActivity, lessonActivity] = await Promise.all([
    prisma.loginSession.findMany({
      where: { userId: user.id },
      select: { lastActivity: true },
      orderBy: { lastActivity: "desc" },
    }),
    prisma.lessonProgress.findMany({
      where: { studentId: user.id, completed: true, completedAt: { not: null } },
      select: { completedAt: true },
    }),
  ]);

  const allActivityDates = [
    ...loginActivity.map((s) => s.lastActivity),
    ...lessonActivity.map((lp) => lp.completedAt!),
  ];

  const streak = calculateStreak(allActivityDates);

  const currentXp = user.xp ?? 0;

  const studentsAhead = await prisma.user.count({
    where: {
      role: "STUDENT",
      OR: [
        { xp: { gt: currentXp } },
        { xp: currentXp, createdAt: { lt: user.createdAt } },
      ],
    },
  });

  const currentUserRank = studentsAhead + 1;
  const startIndex = Math.max(0, currentUserRank - 3);

  const rankedUsers = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, image: true, xp: true },
    skip: startIndex,
    take: 5,
  });

  const leaderboard = rankedUsers.map((u, i) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    xp: u.xp,
    rank: startIndex + i + 1,
  }));

  const upcoming = user.appointments[0];
  const bestAssessmentScore = user.assessments.reduce<number | null>((best, assessment) => {
    if (assessment.score === null) return best;
    return best === null ? assessment.score : Math.max(best, assessment.score);
  }, null);

  const upcomingAppointment = upcoming
    ? {
        id: upcoming.id,
        title: upcoming.title || "Upcoming Session",
        startTime: upcoming.startTime,
        teacherName: upcoming.teacher?.name ?? null,
        teacherImage: upcoming.teacher?.image ?? null,
        meetingUrl: upcoming.meetingUrl,
      }
    : null;

  return {
    user: { id: user.id, name: user.name, image: user.image },
    weeklyProgress,
    streak,
    leaderboard,
    currentUserRank,
    activeEnrollments,
    upcomingAppointment,
    weeklySchedule,
    achievements: buildAchievements({
      courses: activeEnrollments,
      streak,
      bestAssessmentScore,
      bookmarkCount: user._count.bookmarks,
      hasUpcomingAppointment: Boolean(upcomingAppointment),
    }),
  };
}
