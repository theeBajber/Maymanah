import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
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
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 4,
        },
        learnings: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            teacherId: true,
            teacher: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        appointments: {
          where: { status: "SCHEDULED" },
          orderBy: { startTime: "asc" },
          take: 1,
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            type: true,
            score: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeEnrollments = user.enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      slug: e.course.slug,
      image: e.course.image,
      category: e.course.category,
      progress: e.progress,
    }));

    const weeklyProgress =
      activeEnrollments.length > 0
        ? Math.round(
            activeEnrollments.reduce((sum, c) => sum + c.progress, 0) /
              activeEnrollments.length
          )
        : 0;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyActivity = await prisma.loginSession.findMany({
      where: {
        userId: user.id,
        lastActivity: { gte: weekAgo },
      },
      select: {
        lastActivity: true,
      },
      orderBy: { lastActivity: "desc" },
    });

    const uniqueDays = new Set(
      weeklyActivity.map((s) =>
        new Date(s.lastActivity).toDateString()
      )
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (uniqueDays.has(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    const leaderboard = await prisma.user.findMany({
      where: {
        assessments: {
          some: { score: { not: null } },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        assessments: {
          where: { score: { not: null } },
          select: { score: true },
        },
      },
      take: 10,
    });

    const rankedLeaderboard = leaderboard
      .map((u) => ({
        id: u.id,
        name: u.name,
        image: u.image,
        xp: u.assessments.reduce((sum, a) => sum + (a.score || 0), 0),
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);

    const currentUserRank = rankedLeaderboard.findIndex(
      (u) => u.id === user.id
    );

    const upcomingAppointment = user.appointments[0]
      ? {
          id: user.appointments[0].id,
          title: user.appointments[0].title || "Upcoming Session",
          startTime: user.appointments[0].startTime,
          teacherName:
            user.appointments[0].teacher?.name || "Your Teacher",
          teacherImage: user.appointments[0].teacher?.image || null,
          meetingUrl: user.appointments[0].meetingUrl,
        }
      : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
      weeklyProgress,
      streak,
      leaderboard: rankedLeaderboard,
      currentUserRank:
        currentUserRank >= 0 ? currentUserRank + 1 : rankedLeaderboard.length + 1,
      activeEnrollments,
      upcomingAppointment,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
