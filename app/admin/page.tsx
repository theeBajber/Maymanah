import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { BookOpen, Users, GraduationCap, FileText, UserCheck, DollarSign, Activity, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  await requireAdmin();
  const [
    courses,
    lessons,
    enrollments,
    students,
    teachers,
    approvedTeachers,
    pendingTeachers,
    activeMentorships,
    donationRevenue,
  ] = await Promise.all([
    safeQuery(() => prisma.course.count()),
    safeQuery(() => prisma.lesson.count()),
    safeQuery(() => prisma.enrollment.count()),
    safeQuery(() => prisma.user.count({ where: { role: "STUDENT" } })),
    safeQuery(() => prisma.user.count({ where: { role: "TEACHER" } })),
    safeQuery(() => prisma.ustadhProfile.count({ where: { isApproved: true } })),
    safeQuery(() => prisma.ustadhProfile.count({ where: { isApproved: false } })),
    safeQuery(() => prisma.mentorship.count({ where: { status: "ACTIVE" } })),
    safeQuery(() =>
      prisma.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    ),
  ]);
  return {
    courses,
    lessons,
    enrollments,
    students,
    teachers,
    approvedTeachers,
    pendingTeachers,
    activeMentorships,
    donationRevenue: donationRevenue._sum.amount ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-primary" },
    { label: "Lessons", value: stats.lessons, icon: FileText, color: "text-secondary" },
    { label: "Enrollments", value: stats.enrollments, icon: Users, color: "text-info" },
    { label: "Students", value: stats.students, icon: GraduationCap, color: "text-success" },
    {
      label: "Teachers",
      value: `${stats.approvedTeachers}/${stats.teachers}`,
      sub: `${stats.pendingTeachers} pending`,
      icon: UserCheck,
      color: "text-secondary",
      href: "/admin/teachers",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingTeachers,
      icon: Clock,
      color: "text-warning",
      href: "/admin/teachers",
    },
    {
      label: "Active Mentorships",
      value: stats.activeMentorships,
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Revenue",
      value: `$${stats.donationRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "text-success",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const content = (
            <div
              className={`bg-bg-card border border-border rounded-xl p-5 ${card.href ? "hover:border-primary/30 transition-colors cursor-pointer" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon className={`size-6 ${card.color}`} />
              </div>
              <p className="text-3xl font-bold text-text-primary">{card.value}</p>
              <p className="text-sm text-text-secondary mt-1">{card.label}</p>
              {card.sub && (
                <p className="text-xs text-text-muted mt-0.5">{card.sub}</p>
              )}
            </div>
          );

          if (card.href) {
            return (
              <Link key={card.label} href={card.href}>
                {content}
              </Link>
            );
          }
          return <div key={card.label}>{content}</div>;
        })}
      </div>
    </div>
  );
}
