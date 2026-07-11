"use client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";
const PIE_COLORS = ["#16a34a", "#dc2626"];

type AnalyticsData = {
  overview: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalAdmins: number;
    totalCourses: number;
    totalLessons: number;
    totalEnrollments: number;
    activeMentorships: number;
    completedMentorships: number;
    totalDonations: number;
    donationRevenue: number;
    pendingTeachers: number;
    newUsers30d: number;
    newEnrollments30d: number;
  };
  trends: {
    enrollmentTrendByMonth: { month: string; count: number }[];
    userSignupsByMonth: { month: string; total: number; students: number; teachers: number }[];
  };
  courses: {
    id: string;
    title: string;
    slug: string;
    category: string;
    lessons: number;
    enrollments: number;
    exams: number;
  }[];
  exams: {
    total: number;
    passed: number;
    failed: number;
  };
  recentAuditLog: {
    id: string;
    action: string;
    userId: string | null;
    email: string | null;
    metadata: unknown;
    createdAt: Date;
  }[];
};

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { overview, trends, courses, exams, recentAuditLog } = data;

  const overviewCards = [
    { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-primary" },
    { label: "Students", value: overview.totalStudents, icon: GraduationCap, color: "text-success" },
    { label: "Teachers", value: overview.totalTeachers, icon: UserCheck, color: "text-secondary" },
    { label: "Courses", value: overview.totalCourses, icon: BookOpen, color: "text-info" },
    { label: "Enrollments", value: overview.totalEnrollments, icon: TrendingUp, color: "text-primary" },
    { label: "Active Mentorships", value: overview.activeMentorships, icon: Activity, color: "text-success" },
    { label: "Pending Teachers", value: overview.pendingTeachers, icon: Clock, color: "text-warning" },
    {
      label: "Revenue",
      value: `$${overview.donationRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "text-success",
    },
  ];

  const examPieData = [
    { name: "Passed", value: exams.passed },
    { name: "Failed", value: exams.failed },
  ];

  const courseBarData = courses
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 10)
    .map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "..." : c.title,
      enrollments: c.enrollments,
      lessons: c.lessons,
    }));

  const logPreview = recentAuditLog.slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-1">Platform metrics and insights</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="bg-bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment trend */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Enrollment Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.enrollmentTrendByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#16a34a" }}
                  name="Enrollments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User sign-ups */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            User Sign-ups
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.userSignupsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" fill="#8b5cf6" name="Teachers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam pass/fail */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Exam Pass Rate
          </h2>
          <div className="h-64 flex items-center justify-center">
            {exams.total === 0 ? (
              <p className="text-text-muted text-sm">No graded exams yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={examPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {examPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top courses */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Top Courses by Enrollment
          </h2>
          <div className="h-64">
            {courseBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-text-muted text-sm">No courses yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="enrollments" fill="#16a34a" name="Enrollments" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section: course table + audit log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course stats table */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Course Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-text-secondary">Course</th>
                  <th className="text-right px-2 py-2 font-medium text-text-secondary">Lessons</th>
                  <th className="text-right px-2 py-2 font-medium text-text-secondary">Enrollments</th>
                  <th className="text-right pl-2 py-2 font-medium text-text-secondary">Exams</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-text-primary truncate max-w-40">{c.title}</td>
                    <td className="py-2 px-2 text-right text-text-secondary">{c.lessons}</td>
                    <td className="py-2 px-2 text-right text-text-secondary">{c.enrollments}</td>
                    <td className="py-2 pl-2 text-right text-text-secondary">{c.exams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent audit log */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Recent Activity
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logPreview.length === 0 ? (
              <p className="text-sm text-text-muted">No recent activity</p>
            ) : (
              logPreview.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <Activity className="size-4 text-text-muted shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate">
                      {entry.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {entry.email || entry.userId || "System"}
                      {" · "}
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
