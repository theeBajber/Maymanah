import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PortalHeader } from "@/components/ui/portal";
import { AvailabilityGrid } from "./AvailabilityGrid";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const slots = await prisma.availability.findMany({
    where: { userId: session.user.id },
    select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const initialSlots = slots.map((s) => ({
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  return (
    <div className="stagger-fade p-6 space-y-6 max-w-6xl mx-auto">
      <PortalHeader
        title="Weekly Availability"
        subtitle={
          <>
            Select <strong>all</strong> times you&apos;re available to teach.
            The more you add, the better the system can match students to your
            schedule.
          </>
        }
      />
      <AvailabilityGrid initialSlots={initialSlots} />
    </div>
  );
}
