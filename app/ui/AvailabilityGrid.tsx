"use client";

import { useCallback, useEffect, useRef } from "react";

export type SlotKey = `${number}-${string}-${string}`;

export interface GridWindow {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 18 }, (_, index) => index + 5);
const MINUTES = [0, 30];
const FIRST_HOUR = HOURS[0];

export function toSlotKey(day: number, start: string, end: string): SlotKey {
  return `${day}-${start}-${end}`;
}

export function parseSlotKey(key: SlotKey): { day: number; start: string; end: string } {
  const [day, start, end] = key.split("-");
  return { day: Number(day), start, end };
}

function minutesOf(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function cellKey(row: number, day: number): SlotKey {
  const hour = FIRST_HOUR + Math.floor(row / MINUTES.length);
  const minute = (row % MINUTES.length) * (60 / MINUTES.length);
  const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const endHour = minute === 0 ? hour : hour + 1;
  const endMinute = minute === 0 ? 30 : 0;
  const end = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  return toSlotKey(day, start, end);
}

/**
 * The weekly selection grid shared by the pairing and rescheduling flows.
 *
 * Drag across cells to paint a block, and drag again over a selected block to
 * clear it. When `enabledWindows` is given the cells outside those windows are
 * inert, so a student is only ever offered times their teacher holds open.
 */
export function AvailabilityGrid({
  selected,
  onSelectedChange,
  enabledWindows,
}: {
  selected: Set<SlotKey>;
  onSelectedChange: (next: Set<SlotKey>) => void;
  enabledWindows?: GridWindow[];
}) {
  const draggingRef = useRef(false);
  const actionRef = useRef<"add" | "remove">("add");
  const anchorRef = useRef<{ row: number; day: number } | null>(null);
  const prevRectRef = useRef<Set<SlotKey> | null>(null);
  const baseRef = useRef<Set<SlotKey>>(new Set());

  useEffect(() => {
    const stop = () => {
      draggingRef.current = false;
      anchorRef.current = null;
      prevRectRef.current = null;
    };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const isEnabled = useCallback(
    (day: number, start: string, end: string): boolean => {
      if (!enabledWindows) return true;
      return enabledWindows.some(
        (window) =>
          window.dayOfWeek === day &&
          minutesOf(start) >= minutesOf(window.startTime) &&
          minutesOf(end) <= minutesOf(window.endTime),
      );
    },
    [enabledWindows],
  );

  const rectKeys = useCallback((anchorRow: number, anchorDay: number, row: number, day: number) => {
    const keys = new Set<SlotKey>();
    for (let r = Math.min(anchorRow, row); r <= Math.max(anchorRow, row); r++) {
      for (let d = Math.min(anchorDay, day); d <= Math.max(anchorDay, day); d++) {
        keys.add(cellKey(r, d));
      }
    }
    return keys;
  }, []);

  const handleCellMouseDown = useCallback(
    (row: number, day: number) => {
      const key = cellKey(row, day);
      const { start, end } = parseSlotKey(key);
      if (!isEnabled(day, start, end)) return;

      actionRef.current = selected.has(key) ? "remove" : "add";
      draggingRef.current = true;
      anchorRef.current = { row, day };
      baseRef.current = new Set(selected);
      prevRectRef.current = new Set<SlotKey>([key]);

      const next = new Set(selected);
      if (actionRef.current === "add") next.add(key);
      else next.delete(key);
      onSelectedChange(next);
    },
    [selected, isEnabled, onSelectedChange],
  );

  const handleCellMouseEnter = useCallback(
    (row: number, day: number) => {
      if (!draggingRef.current || !anchorRef.current) return;

      const rect = rectKeys(anchorRef.current.row, anchorRef.current.day, row, day);
      const filtered = new Set<SlotKey>();
      for (const key of rect) {
        const { day: keyDay, start, end } = parseSlotKey(key);
        if (isEnabled(keyDay, start, end)) filtered.add(key);
      }

      const previous = prevRectRef.current;
      if (previous && filtered.size === previous.size && [...filtered].every((key) => previous.has(key))) {
        return;
      }
      prevRectRef.current = filtered;

      const draft = new Set(baseRef.current);
      for (const key of filtered) {
        if (actionRef.current === "add") draft.add(key);
        else draft.delete(key);
      }
      onSelectedChange(draft);
    },
    [rectKeys, isEnabled, onSelectedChange],
  );

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[500px] gap-px overflow-hidden rounded-xl bg-border"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        <div className="bg-bg-card p-2 text-center text-[10px] font-semibold text-text-secondary" />
        {DAYS.map((day) => (
          <div key={day} className="bg-bg-card p-2 text-center text-[10px] font-semibold text-text-secondary">
            {day}
          </div>
        ))}
        {HOURS.map((hour, hourIndex) =>
          MINUTES.map((minute, minuteIndex) => {
            const row = hourIndex * MINUTES.length + minuteIndex;
            const start = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
            const endHour = minute === 0 ? hour : hour + 1;
            const endMinute = minute === 0 ? 30 : 0;
            const end = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
            return (
              <div key={`${hour}-${minute}`} className="contents">
                <div className="flex items-center justify-center bg-bg-card text-[9px] text-text-muted">
                  {minute === 0 ? `${hour}:00` : ""}
                </div>
                {Array.from({ length: 7 }, (_, day) => {
                  const key = toSlotKey(day, start, end);
                  const enabled = isEnabled(day, start, end);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${DAYS[day]} ${start}`}
                      disabled={!enabled}
                      onMouseDown={(event) => {
                        if (!enabled) return;
                        event.preventDefault();
                        handleCellMouseDown(row, day);
                      }}
                      onMouseEnter={() => handleCellMouseEnter(row, day)}
                      className={`h-7 select-none transition-colors ${
                        !enabled
                          ? "cursor-not-allowed bg-bg-card opacity-20"
                          : selected.has(key)
                            ? "bg-primary"
                            : "bg-bg-card hover:bg-bg-hover"
                      }`}
                    />
                  );
                })}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
