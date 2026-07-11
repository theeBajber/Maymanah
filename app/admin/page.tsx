import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { PortalHeader, StatTile } from "@/components/ui/portal";
import { BookOpen, Users, GraduationCap, FileText } from "lucide-react";

async function getStats() {
  await requireAdmin();
  const [courses, lessons, enrollments, students] = await Promise.all([
    safeQuery(() => prisma.course.count()),
    safeQuery(() => prisma.lesson.count()),
    safeQuery(() => prisma.enrollment.count()),
    safeQuery(() => prisma.user.count({ where: { role: "STUDENT" } })),
  ]);
  return { courses, lessons, enrollments, students };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Courses", value: stats.courses, icon: BookOpen, tone: "brass" as const },
    { label: "Lessons", value: stats.lessons, icon: FileText, tone: "brass" as const },
    { label: "Enrollments", value: stats.enrollments, icon: Users, tone: "info" as const },
    { label: "Students", value: stats.students, icon: GraduationCap, tone: "success" as const },
  ];

  return (
    <div className="stagger-fade space-y-8">
      <PortalHeader title="Admin Dashboard" subtitle="Overview of your platform" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatTile
            key={card.label}
            icon={card.icon}
            value={card.value}
            label={card.label}
            tone={card.tone}
          />
        ))}
      </div>
    </div>
  );
}
