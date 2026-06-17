import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/ui/PortalNav";
import { amiri } from "@/components/ui/fonts";
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
    <div className="flex flex-col max-w-6xl w-full h-full pt-16 mx-auto">
      <TopNav />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <section>
          <h1 className={`text-3xl text-primary ${amiri.className}`}>Weekly Availability</h1>
          <p className="text-text-secondary mt-1">
            Set your available teaching slots. All times are shown in your local timezone.
          </p>
        </section>
        <AvailabilityGrid initialSlots={initialSlots} />
      </div>
    </div>
  );
}
