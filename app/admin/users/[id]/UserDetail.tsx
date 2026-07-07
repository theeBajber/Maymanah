"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Mail,
  Calendar,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  Shield,
  Trash2,
} from "lucide-react";
import { UserIcon } from "lucide-react";
import type { User as PrismaUser, Profile, UstadhProfile, Enrollment, Submission, Mentorship } from "@prisma/client";

type UserDetailData = PrismaUser & {
  profile: Profile | null;
  ustadhProfile: UstadhProfile | null;
  enrollments: (Enrollment & {
    course: { id: string; title: string; slug: string };
  })[];
  submissions: (Submission & {
    exam: { id: string; title: string; courseId: string };
  })[];
  teachings: (Mentorship & {
    student: { id: string; name: string | null; email: string | null };
  })[];
  learnings: (Mentorship & {
    teacher: { id: string; name: string | null; email: string | null };
  })[];
  _count: {
    enrollments: number;
    submissions: number;
    teachings: number;
    learnings: number;
    appointments: number;
    donations: number;
    lessonProgress: number;
  };
};

const roleLabels: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
};

export function UserDetail({ user }: { user: UserDetailData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [updating, setUpdating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function handleRoleChange(newRole: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeRole", role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      toast({ title: "Role updated successfully", variant: "success" });
      setSelectedRole(newRole as typeof selectedRole);
      router.refresh();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to update role", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast({ title: "User deleted", variant: "success" });
      router.push("/admin/users");
    } catch {
      toast({ title: "Failed to delete user", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserIcon className="size-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-text-primary truncate">
                  {user.name || "Unnamed User"}
                </h1>
                <p className="text-text-secondary flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-4" />
                  {user.email || "No email"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Shield className="size-3" />
                    {roleLabels[user.role] || user.role}
                  </span>
                  {user.emailVerified && (
                    <span className="text-xs text-success font-medium">Email Verified</span>
                  )}
                </div>
              </div>

              {/* Role changer */}
              <div className="shrink-0">
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-1">
                  Change Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={updating}
                  className="px-3 py-1.5 rounded-lg border border-border bg-bg-primary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-bg-primary rounded-lg p-3">
                <BookOpen className="size-4 text-primary mb-1" />
                <p className="text-lg font-bold text-text-primary">{user._count.enrollments}</p>
                <p className="text-xs text-text-secondary">Enrollments</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3">
                <FileText className="size-4 text-info mb-1" />
                <p className="text-lg font-bold text-text-primary">{user._count.submissions}</p>
                <p className="text-xs text-text-secondary">Submissions</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3">
                <Users className="size-4 text-secondary mb-1" />
                <p className="text-lg font-bold text-text-primary">
                  {user._count.teachings + user._count.learnings}
                </p>
                <p className="text-xs text-text-secondary">Mentorships</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-3">
                <GraduationCap className="size-4 text-success mb-1" />
                <p className="text-lg font-bold text-text-primary">{user._count.lessonProgress}</p>
                <p className="text-xs text-text-secondary">Lessons Done</p>
              </div>
            </div>
          </div>

          {/* Enrollments */}
          {user.enrollments.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Enrollments ({user.enrollments.length})
              </h2>
              <div className="space-y-2">
                {user.enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-bg-primary"
                  >
                    <Link
                      href={`/admin/courses/${e.courseId}`}
                      className="text-sm font-medium text-text-primary hover:text-primary"
                    >
                      {e.course.title}
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.status === "ACTIVE"
                          ? "bg-success/10 text-success"
                          : e.status === "COMPLETED"
                            ? "bg-info/10 text-info"
                            : "bg-danger/10 text-danger"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions */}
          {user.submissions.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Recent Submissions ({user.submissions.length})
              </h2>
              <div className="space-y-2">
                {user.submissions.slice(0, 10).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-bg-primary"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{s.exam.title}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(s.submittedAt || s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "GRADED"
                            ? "bg-success/10 text-success"
                            : s.status === "SUBMITTED"
                              ? "bg-warning/10 text-warning"
                              : "bg-bg-hover text-text-muted"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.totalScore !== null && (
                        <p className="text-xs text-text-secondary mt-0.5">{s.totalScore} pts</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile info */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wider">Gender</dt>
                <dd className="text-text-primary">{user.gender || "—"}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wider">Joined</dt>
                <dd className="text-text-primary flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-text-muted" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wider">2FA</dt>
                <dd className="text-text-primary">{user.twoFactorEnabled ? "Enabled" : "Disabled"}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wider">XP</dt>
                <dd className="text-text-primary">{user.xp}</dd>
              </div>
            </dl>
          </div>

          {/* Teacher profile (if applicable) */}
          {user.ustadhProfile && (
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Teacher Info</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-text-muted text-xs uppercase tracking-wider">Status</dt>
                  <dd>
                    {user.ustadhProfile.isApproved ? (
                      <span className="text-success font-medium">Approved</span>
                    ) : (
                      <span className="text-warning font-medium">Pending</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs uppercase tracking-wider">Qiraah</dt>
                  <dd className="text-text-primary">{user.ustadhProfile.qiraah || "—"}</dd>
                </div>
                <div>
                  <dt className="text-text-muted text-xs uppercase tracking-wider">Reliability</dt>
                  <dd className="text-text-primary">
                    {user.ustadhProfile.reliabilityScore ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Mentorships */}
          {user.teachings.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Teaching ({user.teachings.length})
              </h2>
              <ul className="space-y-2">
                {user.teachings.map((m) => (
                  <li key={m.id} className="text-sm text-text-primary">
                    {m.student.name || m.student.email || "Unknown"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Danger zone */}
          <div className="bg-bg-card border border-danger/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-danger mb-2">Danger Zone</h2>
            <p className="text-sm text-text-secondary mb-4">
              Permanently delete this user and all associated data.
            </p>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
            >
              <Trash2 className="size-4" />
              Delete User
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete User</h3>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete <strong>{user.name || user.email || "this user"}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {updating ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
