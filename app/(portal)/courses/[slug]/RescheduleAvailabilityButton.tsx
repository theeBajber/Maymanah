"use client";

import { Check, Clock, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvailabilityGrid, parseSlotKey, type GridWindow, type SlotKey } from "@/app/ui/AvailabilityGrid";
import { useToast } from "@/app/ui/toast";

/**
 * Changes a paired student's weekly schedule from inside a modal.
 *
 * Only the times the teacher keeps open are selectable, and the new schedule is
 * saved against the existing pairing, so a change of hours never becomes a
 * change of teacher.
 */
export function RescheduleAvailabilityButton({
  mentorshipId,
  teacherAvail,
  autoOpen = false,
}: {
  mentorshipId: string;
  teacherAvail: GridWindow[];
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(autoOpen);
  const [wasAutoOpen, setWasAutoOpen] = useState(autoOpen);
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Opening on request is derived from the prop rather than synced in an
  // effect, so the modal opens in the same render the request arrives.
  if (autoOpen !== wasAutoOpen) {
    setWasAutoOpen(autoOpen);
    if (autoOpen) setOpen(true);
  }

  async function handleSave() {
    if (selected.size === 0) {
      toast({ title: "Select at least one time slot.", variant: "warning" });
      return;
    }

    setSaving(true);
    const slots = Array.from(selected).map((key) => {
      const { day, start, end } = parseSlotKey(key);
      return { dayOfWeek: day, startTime: start, endTime: end };
    });

    try {
      const res = await fetch(`/api/mentorship/${mentorshipId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        toast({ title: data.error || "Failed to update schedule. Try again.", variant: "error" });
        setSaving(false);
      }
    } catch {
      toast({ title: "Something went wrong. Try again.", variant: "error" });
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-4 border-t border-border pt-4">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Clock className="size-3" />
          Change my weekly schedule
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!saving) setOpen(false);
            }}
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Change Weekly Schedule</h3>
              <button
                onClick={() => setOpen(false)}
                disabled={saving}
                className="flex size-8 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-bg-hover hover:text-text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            {success ? (
              <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-success/10">
                  <Check className="size-6 text-success" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-text-primary">Schedule updated!</h3>
                <p className="text-sm text-text-secondary">Your new schedule is being applied...</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary">
                  Select <strong>ALL</strong> the times you&apos;re available — the system will create daily sessions
                  within your teacher&apos;s available windows. Only slots your teacher is available are shown.
                </p>

                <AvailabilityGrid selected={selected} onSelectedChange={setSelected} enabledWindows={teacherAvail} />

                <p className="text-xs text-text-muted">
                  Click and drag to select multiple slots. Only times your teacher is available are shown.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <p className="text-[11px] text-text-muted">
                    {selected.size} slot{selected.size !== 1 ? "s" : ""} selected
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:bg-bg-hover"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-text-inverse transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Schedule"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
