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
import Link from "next/link";

const QANDEEL = {
  brass: "#C6A15B",
  lapis: "#8FA9D0",
  sage: "#93A5A8",
  nightSuccess: "#8FBF9A",
  nightWarning: "#D9A441",
  nightDanger: "#E08A7E",
  layl: "#0B151B",
  ivory: "#EAE6DA",
} as const;

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

const tooltipStyle = {
  background: "var(--color-bg-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xl, 12px)",
  padding: "12px 16px",
  fontSize: 13,
  boxShadow: "var(--shadow-raise, 0 8px 24px -8px rgba(6, 13, 17, 0.55))",
};

function QandeelAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text x={x} y={y} dy={12} textAnchor="middle" fill="var(--color-text-muted)" fontSize={11}>
      {payload?.value ?? ""}
    </text>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { overview, trends, courses, exams, recentAuditLog } = data;

  const overviewCards = [
    { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-lapis", href: "/admin/users" },
    { label: "Students", value: overview.totalStudents, icon: GraduationCap, color: "text-night-success", href: "/admin/users" },
    { label: "Teachers", value: overview.totalTeachers, icon: UserCheck, color: "text-lapis", href: "/admin/teachers" },
    { label: "Courses", value: overview.totalCourses, icon: BookOpen, color: "text-brass", href: "/admin/courses" },
    { label: "Enrollments", value: overview.totalEnrollments, icon: TrendingUp, color: "text-brass" },
    { label: "Active Mentorships", value: overview.activeMentorships, icon: Activity, color: "text-night-success", href: "/admin/teachers" },
    { label: "Pending Teachers", value: overview.pendingTeachers, icon: Clock, color: "text-night-warning", href: "/admin/teachers" },
    {
      label: "Revenue",
      value: `$${overview.donationRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: "text-night-success",
    },
  ];

  const examPieData = [
    { name: "Passed", value: exams.passed },
    { name: "Failed", value: exams.failed },
  ];

  const PIE_FILLS = [QANDEEL.nightSuccess, QANDEEL.nightDanger];

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
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)]">
          Analytics
        </h1>
        <p className="text-text-secondary mt-1">Platform metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {overviewCards.map((card) => {
          const content = (
            <div className="bg-bg-card border border-border rounded-xl p-4 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <card.icon className={`size-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{card.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{card.label}</p>
            </div>
          );
          if (card.href) {
            return <Link key={card.label} href={card.href}>{content}</Link>;
          }
          return <div key={card.label}>{content}</div>;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-1 font-[family-name:var(--font-heading)] tracking-wider">
            Enrollment Trend
          </h2>
          <p className="text-xs text-text-muted mb-4">Monthly enrollment count over the last 12 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.enrollmentTrendByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={<QandeelAxisTick />} axisLine={false} tickLine={false} />
                <YAxis tick={<QandeelAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={QANDEEL.brass}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: QANDEEL.brass, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: QANDEEL.brass, stroke: "var(--color-bg-card)", strokeWidth: 2 }}
                  name="Enrollments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-1 font-[family-name:var(--font-heading)] tracking-wider">
            User Sign-ups
          </h2>
          <p className="text-xs text-text-muted mb-4">Monthly new user registrations</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends.userSignupsByMonth} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={<QandeelAxisTick />} axisLine={false} tickLine={false} />
                <YAxis tick={<QandeelAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="students" fill={QANDEEL.lapis} name="Students" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="teachers" fill={QANDEEL.brass} name="Teachers" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-1 font-[family-name:var(--font-heading)] tracking-wider">
            Exam Pass Rate
          </h2>
          <p className="text-xs text-text-muted mb-4">
            {exams.total} graded submission{exams.total !== 1 ? "s" : ""}
          </p>
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
                    strokeWidth={0}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {examPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_FILLS[index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-1 font-[family-name:var(--font-heading)] tracking-wider">
            Top Courses by Enrollment
          </h2>
          <p className="text-xs text-text-muted mb-4">Top 10 courses ranked by enrollment count</p>
          <div className="h-64">
            {courseBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-text-muted text-sm">No courses yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseBarData} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={<QandeelAxisTick />} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="enrollments" fill={QANDEEL.brass} name="Enrollments" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 font-[family-name:var(--font-heading)] tracking-wider">
            Course Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-text-secondary text-xs uppercase tracking-wider">Course</th>
                  <th className="text-right px-2 py-2 font-medium text-text-secondary text-xs uppercase tracking-wider">Lessons</th>
                  <th className="text-right px-2 py-2 font-medium text-text-secondary text-xs uppercase tracking-wider">Enrollments</th>
                  <th className="text-right pl-2 py-2 font-medium text-text-secondary text-xs uppercase tracking-wider">Exams</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors">
                    <td className="py-2.5 pr-4 text-text-primary truncate max-w-40">{c.title}</td>
                    <td className="py-2.5 px-2 text-right text-text-secondary">{c.lessons}</td>
                    <td className="py-2.5 px-2 text-right text-text-secondary">{c.enrollments}</td>
                    <td className="py-2.5 pl-2 text-right text-text-secondary">{c.exams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-bold text-text-primary mb-4 font-[family-name:var(--font-heading)] tracking-wider">
            Recent Activity
          </h2>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {logPreview.length === 0 ? (
              <p className="text-sm text-text-muted">No recent activity</p>
            ) : (
              logPreview.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-bg-hover transition-colors"
                >
                  <Activity className="size-4 text-lapis shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate">
                      {entry.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {entry.email || entry.userId || "System"}
                      <span className="mx-1">·</span>
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
