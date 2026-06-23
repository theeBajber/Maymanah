import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
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
    { label: "Courses", value: stats.courses, icon: BookOpen, color: "text-primary" },
    { label: "Lessons", value: stats.lessons, icon: FileText, color: "text-secondary" },
    { label: "Enrollments", value: stats.enrollments, icon: Users, color: "text-info" },
    { label: "Students", value: stats.students, icon: GraduationCap, color: "text-success" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`size-6 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-text-primary">{card.value}</p>
            <p className="text-sm text-text-secondary mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
