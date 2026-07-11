"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { UserCheck, UserX, ExternalLink, Search } from "lucide-react";
import type { User, UstadhProfile } from "@prisma/client";

type TeacherWithProfile = User & {
  ustadhProfile: UstadhProfile | null;
  _count: { teachings: number; appointments: number };
};

type FilterTab = "all" | "pending" | "approved";

export function TeachersList({ teachers }: { teachers: TeacherWithProfile[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = teachers;
    if (filter === "pending") {
      result = result.filter((t) => !t.ustadhProfile?.isApproved);
    } else if (filter === "approved") {
      result = result.filter((t) => t.ustadhProfile?.isApproved);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.name?.toLowerCase() || "").includes(q) ||
          (t.email?.toLowerCase() || "").includes(q),
      );
    }
    return result;
  }, [teachers, filter, search]);

  async function handleApprove(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast({ title: "Teacher approved successfully", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Failed to approve teacher", variant: "error" });
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Optional rejection reason (sent via email):");
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: reason || undefined }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      toast({ title: "Teacher rejected", variant: "info" });
      router.refresh();
    } catch {
      toast({ title: "Failed to reject teacher", variant: "error" });
    } finally {
      setLoadingId(null);
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: teachers.filter((t) => !t.ustadhProfile?.isApproved).length },
    { key: "approved", label: "Approved", count: teachers.filter((t) => t.ustadhProfile?.isApproved).length },
    { key: "all", label: "All", count: teachers.length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-bg-card text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <UserCheck className="size-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-text-secondary">No teachers found</p>
          <p className="text-sm mt-1">
            {filter === "pending"
              ? "No pending teacher applications"
              : filter === "approved"
                ? "No approved teachers yet"
                : "No teachers registered"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Name</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Qiraah</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Qualifications</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Students</th>
                <th className="text-right py-3 px-4 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => (
                <tr key={teacher.id} className="border-b border-border hover:bg-bg-hover/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="font-medium text-text-primary hover:text-primary flex items-center gap-1.5"
                    >
                      {teacher.name || "Unnamed"}
                      <ExternalLink className="size-3 shrink-0 opacity-40" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{teacher.email || "—"}</td>
                  <td className="py-3 px-4 text-text-secondary">
                    {teacher.ustadhProfile?.qiraah || "—"}
                  </td>
                  <td className="py-3 px-4 text-text-secondary max-w-48 truncate">
                    {teacher.ustadhProfile?.qualifications || "—"}
                  </td>
                  <td className="py-3 px-4">
                    {teacher.ustadhProfile?.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        <span className="size-1.5 rounded-full bg-current" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                        <span className="size-1.5 rounded-full bg-current" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{teacher._count.teachings}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!teacher.ustadhProfile?.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(teacher.id)}
                            disabled={loadingId === teacher.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            <UserCheck className="size-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(teacher.id)}
                            disabled={loadingId === teacher.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                          >
                            <UserX className="size-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(teacher.id)}
                          disabled={loadingId === teacher.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                        >
                          <UserX className="size-3.5" />
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
