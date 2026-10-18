import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AvailabilityEditor } from "@/app/ui/AvailabilityEditor";
import { PortalHeader } from "@/app/ui/portal";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Availability" };

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");
  if (user.role !== "TEACHER") redirect("/dashboard");

  return (
    <div className="stagger-fade mx-auto max-w-6xl space-y-6 p-6">
      <PortalHeader
        title="Weekly Availability"
        subtitle="Set the times you can teach so students can be scheduled with you."
      />
      <AvailabilityEditor />
    </div>
  );
}
