import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Plus, BookOpen, Pencil, Eye, EyeOff } from "lucide-react";
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Courses</h1>
          <p className="text-text-secondary mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-inverse rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="size-4" />
          New Course
        </Link>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
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
                      <FileTextIcon />
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
  );
}

function FileTextIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
