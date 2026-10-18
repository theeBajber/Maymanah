import { Sun, Zap } from "lucide-react";

import { auth } from "@/lib/auth";
import { getStudentSchedule, getTodayHifdhSlot } from "@/lib/pairing";
import { getCurrentUser } from "@/lib/session";
import { DailySessionButton } from "./DailySessionButton";
import { SetAvailabilityForPairing } from "./SetAvailabilityForPairing";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatSlotTime(startTime: string): string {
  // The slot is a wall clock on the teacher's schedule, so it is formatted as
  // read rather than shifted into any zone.
  return new Date(`2000-01-01T${startTime}:00Z`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * The Hifdh schedule panel on the course page.
 *
 * A student without a pairing is shown the availability grid; once paired they
 * see the weekly slots, today's session, and who they are paired with.
 */
export async function HifdhSchedule({ enrolled, isTest }: { enrolled: boolean; isTest: boolean }) {
  if (!enrolled) return null;

  const user = await getCurrentUser(await auth());
  if (!user) return null;

  const schedule = await getStudentSchedule(user.id);
  if (!schedule || schedule.slots.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SetAvailabilityForPairing />
      </section>
    );
  }

  const todaySlot = await getTodayHifdhSlot(user.id);

  return (
    <section className="space-y-6">
      {(todaySlot || isTest) && (
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-bg-elevated p-6 shadow-raise">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
                <Sun className="size-4" />
                Today&apos;s Daily Session
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {todaySlot
                  ? todaySlot.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                  : "Test Mode"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {todaySlot ? `${todaySlot.duration} min session` : "Force-start a session for testing"}
              </p>
            </div>
            <DailySessionButton
              startTime={todaySlot ? todaySlot.startTime.toISOString() : ""}
              endTime={todaySlot ? todaySlot.endTime.toISOString() : ""}
              isTest={!todaySlot && isTest}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-raise">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Your Schedule</h3>
        <div className="space-y-3">
          {schedule.slots.map((slot) => {
            const SlotIcon = slot.type === "DAILY_HIFDH" ? Sun : Zap;
            return (
              <div
                key={`${slot.type}-${slot.dayOfWeek}`}
                className="flex items-center gap-3"
              >
                <span className="flex size-9 items-center justify-center rounded-[10px] border border-primary/25 text-primary">
                  <SlotIcon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {slot.type === "DAILY_HIFDH" ? "Daily Hifdh" : "Muraja'ah"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {DAY_NAMES[slot.dayOfWeek]}s at {formatSlotTime(slot.startTime)} &middot; {slot.duration} min
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 border-t border-border pt-3 text-xs text-text-muted">Teacher: {schedule.teacherName}</p>
      </div>
    </section>
  );
}
