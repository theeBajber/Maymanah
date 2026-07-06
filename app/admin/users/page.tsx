import { requireAdmin, getUsers } from "@/lib/admin";
import { UsersList } from "./UsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const result = await getUsers({
    search: sp.search,
    role: (sp.role as "STUDENT" | "TEACHER" | "ADMIN" | "ALL") || "ALL",
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-secondary mt-1">Manage all platform users</p>
      </div>

      <UsersList
        users={result.users}
        total={result.total}
        totalPages={result.totalPages}
        currentPage={result.page}
        currentRole={sp.role || "ALL"}
        currentSearch={sp.search || ""}
      />
    </div>
  );
}
