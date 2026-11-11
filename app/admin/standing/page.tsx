import { getStandingQueue, requireAdmin } from "@/lib/admin";

import { StandingQueue } from "./StandingQueue";

export const dynamic = "force-dynamic";

export default async function AdminStandingPage() {
  await requireAdmin();
  const events = await getStandingQueue();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Account standing</h1>
        <p className="mt-1 text-text-secondary">
          Disables proposed by the attendance sweep. A warning or a pause is applied automatically; a
          disable waits for a decision here.
        </p>
      </div>

      <StandingQueue events={events} />
    </div>
  );
}
