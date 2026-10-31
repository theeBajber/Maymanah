import {
  getAdminDonations,
  requireAdmin,
  type AdminDonationProviderFilter,
  type AdminDonationStatusFilter,
} from "@/lib/admin";

import { DonationsList } from "./DonationsList";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    provider?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const status: AdminDonationStatusFilter =
    sp.status === "COMPLETED" || sp.status === "PENDING" || sp.status === "FAILED"
      ? sp.status
      : "ALL";
  const provider: AdminDonationProviderFilter =
    sp.provider === "mpesa" || sp.provider === "stripe" ? sp.provider : "ALL";

  const result = await getAdminDonations({
    status,
    provider,
    search: sp.search ?? "",
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Donations</h1>
        <p className="text-text-secondary mt-1">
          Every contribution, newest first
        </p>
      </div>

      <DonationsList
        donations={result.donations}
        total={result.total}
        totalPages={result.totalPages}
        currentPage={result.page}
        currentStatus={status}
        currentProvider={provider}
        currentSearch={sp.search ?? ""}
      />
    </div>
  );
}
