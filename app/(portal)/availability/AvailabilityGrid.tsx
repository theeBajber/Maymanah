"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const dragActionRef = useRef<"add" | "remove" | null>(null);
  const isDraggingRef = useRef(false);
  const anchorRef = useRef<{ row: number; day: number } | null>(null);
  const prevRectKeysRef = useRef<Set<string> | null>(null);
  const preDragSelectedRef = useRef<Set<SlotKey> | null>(null);

  const FIRST_HOUR = HOURS[0];
  const ROWS = HOURS.length * MINUTES.length;

  function getCellKey(row: number, day: number): SlotKey {
    const hourOffset = Math.floor(row / MINUTES.length);
    const minOffset = (row % MINUTES.length) * (60 / MINUTES.length);
    const hour = FIRST_HOUR + hourOffset;
    const min = minOffset;
    const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const endMin = min === 0 ? 30 : 0;
    const endHour = min === 0 ? hour : hour + 1;
    const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    return toSlotKey(day, start, end);
  }

  function getRectKeys(
    anchorRow: number,
    anchorDay: number,
    currentRow: number,
    currentDay: number,
  ): Set<SlotKey> {
    const minRow = Math.min(anchorRow, currentRow);
    const maxRow = Math.max(anchorRow, currentRow);
    const minDay = Math.min(anchorDay, currentDay);
    const maxDay = Math.max(anchorDay, currentDay);
    const keys = new Set<SlotKey>();
    for (let r = minRow; r <= maxRow; r++) {
      for (let d = minDay; d <= maxDay; d++) {
        keys.add(getCellKey(r, d));
      }
    }
    return keys;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragActionRef.current = null;
        anchorRef.current = null;
        prevRectKeysRef.current = null;
        preDragSelectedRef.current = null;
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCellMouseDown = useCallback(
    (row: number, day: number) => {
      const key = getCellKey(row, day);
      const currentlySelected = selected.has(key);
      dragActionRef.current = currentlySelected ? "remove" : "add";
      isDraggingRef.current = true;
      anchorRef.current = { row, day };
      preDragSelectedRef.current = new Set(selected);
      const rectKeys = new Set<SlotKey>([key]);
      prevRectKeysRef.current = rectKeys;
      setSelected((prev) => {
        const next = new Set(prev);
        if (dragActionRef.current === "add") {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    [selected],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, day: number) => {
      if (!isDraggingRef.current || !anchorRef.current) return;
      const newRectKeys = getRectKeys(
        anchorRef.current.row,
        anchorRef.current.day,
        row,
        day,
      );
      if (
        prevRectKeysRef.current &&
        newRectKeys.size === prevRectKeysRef.current.size &&
        [...newRectKeys].every((k) => prevRectKeysRef.current!.has(k))
      ) {
        return;
      }
      prevRectKeysRef.current = newRectKeys;
      setSelected((prev) => {
        const base = preDragSelectedRef.current!;
        if (dragActionRef.current === "add") {
          const next = new Set(base);
          for (const k of newRectKeys) next.add(k);
          return next;
        } else {
          const next = new Set(base);
          for (const k of newRectKeys) next.delete(k);
          return next;
        }
      });
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
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
        toast({ title: "Availability saved successfully.", variant: "success" });
      } else {
        toast({ title: "Failed to save availability.", variant: "error" });
      }
    } catch {
      toast({ title: "Failed to save availability.", variant: "error" });
    } finally {
      setSaving(false);
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
          {HOURS.map((hour, hourIndex) =>
            MINUTES.map((min, minIndex) => {
              const rowIndex = hourIndex * MINUTES.length + minIndex;
              const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
              const endMin = min === 0 ? 30 : 0;
              const endHour = min === 0 ? hour : hour + 1;
              const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
              const timeLabel = min === 0 ? `${hour}:00` : "";
              return (
                <div key={`${hour}-${min}`} className="contents">
                  <div className="bg-bg-card text-[10px] text-text-muted flex items-center justify-center">{timeLabel}</div>
                  {Array.from({ length: 7 }, (_, day) => {
                    const key = toSlotKey(day, start, end);
                    const isSelected = selected.has(key);
                    return (
                      <button key={key} type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCellMouseDown(rowIndex, day);
                        }}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, day)}
                        className={`text-[10px] transition-colors select-none ${isSelected ? "bg-secondary text-text-inverse" : "bg-bg-card hover:bg-bg-hover"}`} />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Click and drag to select multiple slots. Selected = available, blank = unavailable.
      </p>
    </div>
  );
}
