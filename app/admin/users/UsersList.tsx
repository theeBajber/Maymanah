"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ExternalLink, Mail, Shield } from "lucide-react";
import type { User, Profile } from "@prisma/client";

type UserWithCounts = User & {
  profile: Pick<Profile, "phone" | "country"> | null;
  _count: { enrollments: number; teachings: number; submissions: number };
};

const roleLabels: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
};

const roleColors: Record<string, string> = {
  STUDENT: "bg-info/10 text-info",
  TEACHER: "bg-secondary/10 text-secondary",
  ADMIN: "bg-primary/10 text-primary",
  SUPERADMIN: "bg-warning/10 text-warning",
};

export function UsersList({
  users,
  total,
  totalPages,
  currentPage,
  currentRole,
  currentSearch,
}: {
  users: UserWithCounts[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentRole: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    router.push(`/admin/users?${sp.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search, page: "1" });
  }

  const roleTabs = [
    { key: "ALL", label: "All", count: 0 },
    { key: "STUDENT", label: "Students", count: 0 },
    { key: "TEACHER", label: "Teachers", count: 0 },
    { key: "ADMIN", label: "Admins", count: 0 },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate({ role: tab.key === "ALL" ? "" : tab.key, page: "1" })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                (currentRole || "ALL") === tab.key
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-bg-card text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
      </div>

      <p className="text-sm text-text-muted mb-4">{total} user{total !== 1 ? "s" : ""} found</p>

      {users.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Shield className="size-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-text-secondary">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Name</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Role</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Verified</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Enrollments</th>
                <th className="text-left py-3 px-4 font-medium text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-bg-hover/50 transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="font-medium text-text-primary hover:text-primary flex items-center gap-1.5"
                    >
                      {user.name || "Unnamed"}
                      <ExternalLink className="size-3 shrink-0 opacity-40" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Mail className="size-3.5 shrink-0" />
                      {user.email || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        roleColors[user.role] || "bg-bg-hover text-text-secondary"
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.emailVerified ? (
                      <span className="text-xs text-success font-medium">Verified</span>
                    ) : (
                      <span className="text-xs text-text-muted">Unverified</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{user._count.enrollments}</td>
                  <td className="py-3 px-4 text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => navigate({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => navigate({ page: String(p) })}
              className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => navigate({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
