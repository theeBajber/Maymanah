"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, UserCheck, UserX, BadgeCheck, GraduationCap, BookOpen, Calendar, Star } from "lucide-react";
import { useState } from "react";
import type { User, UstadhProfile, Profile, Mentorship, Appointment } from "@prisma/client";

type TeacherWithDetails = User & {
  ustadhProfile: UstadhProfile | null;
  profile: Profile | null;
  _count: { teachings: number; appointments: number; studentNotes: number };
};

export function TeacherDetail({
  teacher,
  students,
  recentSessions,
}: {
  teacher: TeacherWithDetails;
  students: (Mentorship & { student: { id: string; name: string | null; email: string | null } })[];
  recentSessions: (Appointment & {
    mentorship: { student: { id: string; name: string | null } };
  })[];
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [reliabilityScore, setReliabilityScore] = useState(
    teacher.ustadhProfile?.reliabilityScore ?? null,
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { toast } = useToast();
  const profile = teacher.ustadhProfile;
  const isApproved = profile?.isApproved ?? false;

  async function handleApprove() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reliabilityScore: reliabilityScore ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast({ title: "Teacher approved successfully", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Failed to approve teacher", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  async function handleReject() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectReason || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      toast({ title: "Teacher rejected", variant: "info" });
      setShowRejectDialog(false);
      setRejectReason("");
      router.refresh();
    } catch {
      toast({ title: "Failed to reject teacher", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveReliability() {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          reliabilityScore: reliabilityScore ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Reliability score saved", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Failed to save", variant: "error" });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/teachers"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Teachers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-text-primary">
                    {teacher.name || "Unnamed Teacher"}
                  </h1>
                  {isApproved ? (
                    <BadgeCheck className="size-6 text-success" />
                  ) : profile?.rejectedAt ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-danger/10 text-danger">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-text-secondary">{teacher.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                  >
                    <UserX className="size-4" />
                    Revoke Approval
                  </button>
                ) : profile?.rejectedAt ? (
                  <button
                    onClick={handleApprove}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-success text-white hover:bg-success/90 transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="size-4" />
                    Re-Approve
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={updating}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-success text-white hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="size-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectDialog(true)}
                      disabled={updating}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
                    >
                      <UserX className="size-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-bg-primary rounded-lg p-4">
                <GraduationCap className="size-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-text-primary">{teacher._count.teachings}</p>
                <p className="text-xs text-text-secondary">Mentorships</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4">
                <Calendar className="size-5 text-info mb-2" />
                <p className="text-2xl font-bold text-text-primary">{teacher._count.appointments}</p>
                <p className="text-xs text-text-secondary">Sessions</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4">
                <BookOpen className="size-5 text-secondary mb-2" />
                <p className="text-2xl font-bold text-text-primary">{teacher._count.studentNotes}</p>
                <p className="text-xs text-text-secondary">Notes</p>
              </div>
              <div className="bg-bg-primary rounded-lg p-4">
                <Star className="size-5 text-warning mb-2" />
                <p className="text-2xl font-bold text-text-primary">
                  {reliabilityScore !== null ? reliabilityScore : "—"}
                </p>
                <p className="text-xs text-text-secondary">Reliability</p>
              </div>
            </div>
          </div>

          {/* Ustadh Profile details */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Teacher Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Qiraah</p>
                <p className="text-text-primary">{profile?.qiraah || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Ijazah</p>
                <p className="text-text-primary">{profile?.ijazah || "Not specified"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Qualifications</p>
                <p className="text-text-primary whitespace-pre-wrap">{profile?.qualifications || "Not specified"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Bio</p>
                <p className="text-text-primary whitespace-pre-wrap">{profile?.bio || "No bio"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Available for Teaching</p>
                <p className="text-text-primary">{profile?.availableForTeaching ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Joined</p>
                <p className="text-text-primary">{new Date(teacher.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Reliability Score */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Reliability Score</h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={100}
                value={reliabilityScore ?? ""}
                onChange={(e) => setReliabilityScore(e.target.value ? Number(e.target.value) : null)}
                placeholder="0–100"
                className="w-24 px-3 py-2 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSaveReliability}
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Students */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Active Students ({students.length})
            </h2>
            {students.length === 0 ? (
              <p className="text-sm text-text-muted">No active students</p>
            ) : (
              <ul className="space-y-2">
                {students.map((m) => (
                  <li key={m.id} className="text-sm">
                    <Link
                      href={`/admin/users/${m.student.id}`}
                      className="text-text-primary hover:text-primary transition-colors"
                    >
                      {m.student.name || m.student.email || "Unknown"}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Sessions</h2>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-text-muted">No sessions yet</p>
            ) : (
              <ul className="space-y-3">
                {recentSessions.map((s) => (
                  <li key={s.id} className="text-sm">
                    <p className="text-text-primary font-medium">{s.mentorship.student.name || "Student"}</p>
                    <p className="text-text-muted text-xs">
                      {new Date(s.startTime).toLocaleDateString()} — {s.status.toLowerCase()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isApproved ? "Revoke Approval" : "Reject Teacher"}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {isApproved
                ? "This will revoke the teacher's approval status."
                : "This will reject the teacher's application."}
            </p>
            <textarea
              placeholder="Reason (sent via email, optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={updating}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {updating ? "Processing..." : isApproved ? "Revoke" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
