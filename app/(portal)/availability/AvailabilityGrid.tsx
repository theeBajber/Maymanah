"use client";

import { useState, useCallback } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);
const MINUTES = [0, 30];

type SlotKey = `${number}-${string}-${string}`;

function toSlotKey(day: number, start: string, end: string): SlotKey {
  return `${day}-${start}-${end}`;
}

function parseSlotKey(key: SlotKey) {
  const [day, start, end] = key.split("-");
  return { day: parseInt(day), start, end };
}

export function AvailabilityGrid({
  initialSlots,
}: {
  initialSlots: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  const [selected, setSelected] = useState<Set<SlotKey>>(() => {
    const s = new Set<SlotKey>();
    for (const slot of initialSlots) {
      s.add(toSlotKey(slot.dayOfWeek, slot.startTime, slot.endTime));
    }
    return s;
  });
  const [timezone, setTimezone] = useState(
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const toggleSlot = useCallback((day: number, start: string, end: string) => {
    const key = toSlotKey(day, start, end);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const slots = Array.from(selected).map((key) => {
      const { day, start, end } = parseSlotKey(key);
      return { dayOfWeek: day, startTime: start, endTime: end };
    });
    try {
      const res = await fetch("/api/ustadh/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots, timezone }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Availability saved successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to save availability." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save availability." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary">
          Timezone:{" "}
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
            className="bg-bg-card border border-border rounded-lg px-2 py-1 text-sm ml-2">
            {Intl.supportedValuesOf?.("timeZone")?.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            )) ?? <option value={timezone}>{timezone}</option>}
          </select>
        </label>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.type === "success" ? "text-success" : "text-danger"}`}>
              {message.text}
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="bg-primary text-text-inverse px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid gap-px bg-border rounded-xl overflow-hidden"
          style={{ gridTemplateColumns: `80px repeat(7, 1fr)`, gridTemplateRows: `auto repeat(${HOURS.length * 2}, 28px)` }}>
          <div className="bg-bg-card p-2 text-xs font-semibold text-text-secondary text-center" />
          {DAYS.map((day) => (
            <div key={day} className="bg-bg-card p-2 text-xs font-semibold text-text-secondary text-center">{day}</div>
          ))}
          {HOURS.map((hour) =>
            MINUTES.map((min) => {
              const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
              const endMin = min === 0 ? 30 : 0;
              const endHour = min === 0 ? hour : hour + 1;
              const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
              const timeLabel = min === 0 ? `${hour}:00` : "";
              return (
                <>
                  <div className="bg-bg-card text-[10px] text-text-muted flex items-center justify-center">{timeLabel}</div>
                  {Array.from({ length: 7 }, (_, day) => {
                    const key = toSlotKey(day, start, end);
                    const isSelected = selected.has(key);
                    return (
                      <button key={key} onClick={() => toggleSlot(day, start, end)}
                        className={`text-[10px] transition-colors ${isSelected ? "bg-secondary text-text-inverse" : "bg-bg-card hover:bg-bg-hover"}`} />
                    );
                  })}
                </>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Click a slot to toggle it as available. Green = available, blank = unavailable.
      </p>
    </div>
  );
}
