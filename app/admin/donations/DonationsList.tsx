"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Receipt, Search } from "lucide-react";

type DonationRow = {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  reference: string | null;
  anonymous: boolean;
  createdAt: Date;
  donor: { id: string; name: string; email: string } | null;
};

const STATUS_TABS = [
  { key: "ALL", label: "All" },
  { key: "COMPLETED", label: "Completed" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
};

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-success-muted text-success",
  PENDING: "bg-warning-muted text-warning",
  FAILED: "bg-danger-muted text-danger",
};

const PROVIDER_LABELS: Record<string, string> = {
  mpesa: "M-Pesa",
  stripe: "Card",
};

function formatAmount(amount: number, currency: string) {
  const fractionDigits = currency === "KES" ? 0 : 2;
  return `${currency} ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DonationsList({
  donations,
  total,
  totalPages,
  currentPage,
  currentStatus,
  currentProvider,
  currentSearch,
}: {
  donations: DonationRow[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentStatus: string;
  currentProvider: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    router.push(`/admin/donations?${sp.toString()}`);
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ search, page: "1" });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() =>
                navigate({
                  status: tab.key === "ALL" ? "" : tab.key,
                  page: "1",
                })
              }
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentStatus === tab.key
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2 sm:justify-end">
          <select
            value={currentProvider}
            onChange={(event) =>
              navigate({ provider: event.target.value, page: "1" })
            }
            aria-label="Filter by payment provider"
            className="h-10 rounded-lg border border-border bg-bg-card px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="ALL">All methods</option>
            <option value="mpesa">M-Pesa</option>
            <option value="stripe">Card</option>
          </select>

          <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search reference, donor..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-bg-card text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </form>
        </div>
      </div>

      <p className="text-sm text-text-muted mb-4">
        {total} donation{total !== 1 ? "s" : ""} found
      </p>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {donations.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Receipt className="size-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium text-text-secondary">
              No donations found
            </p>
            <p className="text-sm text-text-muted mt-1">
              Try adjusting the filters or search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Donor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Method
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {donations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary">
                      {formatDate(donation.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      {donation.anonymous ? (
                        <span className="text-text-muted">Anonymous</span>
                      ) : donation.donor ? (
                        <div>
                          <Link
                            href={`/admin/users/${donation.donor.id}`}
                            className="inline-flex items-center gap-1.5 font-medium text-text-primary hover:text-primary"
                          >
                            {donation.donor.name || "Unnamed"}
                            <ExternalLink className="size-3 shrink-0 opacity-40" />
                          </Link>
                          <p className="text-xs text-text-muted mt-0.5">
                            {donation.donor.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-text-muted">Guest</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-bg-hover px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {PROVIDER_LABELS[donation.provider] ??
                          donation.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-text-primary">
                      {formatAmount(donation.amount, donation.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[donation.status] ??
                          "bg-bg-hover text-text-secondary"
                        }`}
                      >
                        {STATUS_LABELS[donation.status] ?? donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="block max-w-[220px] truncate font-mono text-xs text-text-secondary"
                        title={donation.reference ?? undefined}
                      >
                        {donation.reference ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => navigate({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() => navigate({ page: String(page) })}
                className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
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
