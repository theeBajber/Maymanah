import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Plus, BookOpen, Pencil, Eye, EyeOff, FileText } from "lucide-react";
import { PortalHeader } from "@/components/ui/portal";
import { DeleteCourseButton } from "./DeleteCourseButton";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await safeQuery(() =>
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
    }),
  );

  return (
    <div className="stagger-fade">
      <PortalHeader
        title="Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""} total`}
        action={
          <Link
            href="/admin/courses/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-inverse rounded-[10px] text-sm font-medium transition-all hover:shadow-glow-brass"
          >
            <Plus className="size-4" />
            New Course
          </Link>
        }
      />

      <div className="mt-8 bg-bg-card border border-border rounded-xl shadow-raise overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-bg-secondary/50">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Course
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Category
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Lessons
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Students
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-text-muted px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-bg-hover/50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {course.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        /{course.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-muted text-primary-dark dark:text-primary-light">
                    {course.category}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                  {course._count.lessons}
                </td>
                <td className="px-4 py-3.5 text-center text-sm text-text-secondary">
                  {course._count.enrollments}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      course.isPublished
                        ? "bg-success-muted text-success"
                        : "bg-warning-muted text-warning"
                    }`}
                  >
                    {course.isPublished ? (
                      <Eye className="size-3" />
                    ) : (
                      <EyeOff className="size-3" />
                    )}
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                  {!course.isActive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-danger-muted text-danger ml-1.5">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/lessons`}
                      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                      title="Manage Lessons"
                    >
                      <FileText className="size-4" />
                    </Link>
                    <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-text-secondary"
                >
                  <BookOpen className="size-8 mx-auto mb-3 text-text-muted" />
                  <p className="font-medium">No courses yet</p>
                  <p className="text-sm text-text-muted mt-1">
                    Create your first course to get started
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
