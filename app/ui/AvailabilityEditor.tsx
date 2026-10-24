"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/app/ui/Skeleton";
import { useToast } from "@/app/ui/toast";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Slot = { dayOfWeek: number; startTime: string; endTime: string };

/**
 * The weekly availability editor.
 *
 * Shared between the settings panel and the standalone availability page so a
 * teacher finds the same control in both places. It reads and writes the
 * recurring slots through the availability endpoint.
 */
export function AvailabilityEditor() {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addSlot(dayOfWeek: number) {
    setSlots((prev) => [...prev, { dayOfWeek, startTime: "09:00", endTime: "10:00" }]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof Slot, value: string | number) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (res.ok) {
        toast({ title: "Availability saved", variant: "success" });
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to save", variant: "error" });
      }
    } catch {
      toast({ title: "Failed to save availability", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const grouped = DAY_NAMES.map((_, dayIdx) => ({
    day: dayIdx,
    label: DAY_NAMES[dayIdx],
    slots: slots.filter((s) => s.dayOfWeek === dayIdx),
  }));

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Weekly Availability</h2>
      <p className="text-sm text-text-secondary mb-6">
        Set your recurring weekly availability for Hifdh sessions. Sessions will be scheduled automatically when your availability overlaps with your paired teacher.
      </p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ day, label, slots: daySlots }) => (
            <div key={day} className="rounded-xl border border-border bg-bg-elevated p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-text-primary text-sm">{label}</span>
                <button
                  onClick={() => addSlot(day)}
                  className="text-xs font-medium text-primary hover:text-primary-light transition-colors"
                >
                  + Add slot
                </button>
              </div>
              {daySlots.length === 0 ? (
                <p className="text-xs text-text-muted">No availability set</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot, idx) => {
                    const globalIdx = slots.indexOf(slot);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(globalIdx, "startTime", e.target.value)}
                          className="rounded-lg border border-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                        />
                        <span className="text-text-muted text-sm">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(globalIdx, "endTime", e.target.value)}
                          className="rounded-lg border border-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => removeSlot(globalIdx)}
                          className="ml-auto text-danger/70 hover:text-danger transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 active:scale-[0.97] hover:shadow-glow-accent"
      >
        <Save className="size-4" />
        {saving ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
}
