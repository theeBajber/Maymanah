"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheck,
  faSpinner,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const MINUTES = [0, 30];

type SlotKey = `${number}-${string}-${string}`;

function toSlotKey(day: number, start: string, end: string): SlotKey {
  return `${day}-${start}-${end}`;
}

function parseSlotKey(key: SlotKey) {
  const [day, start, end] = key.split("-");
  return { day: parseInt(day), start, end };
}

export function SetAvailabilityForPairing() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  async function handleSaveAndPair() {
    if (selected.size === 0) {
      setError("Select at least one time slot.");
      return;
    }

    setSaving(true);
    setError(null);

    const slots = Array.from(selected).map((key) => {
      const { day, start, end } = parseSlotKey(key);
      return { dayOfWeek: day, startTime: start, endTime: end };
    });

    try {
      const availRes = await fetch("/api/student/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (!availRes.ok) {
        setError("Failed to save availability. Try again.");
        setSaving(false);
        return;
      }

      const pairRes = await fetch("/api/mentorship/pair", { method: "POST" });

      if (!pairRes.ok) {
        const data = await pairRes.json();
        setError(
          data.error || "Could not find a teacher. Try different times.",
        );
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.refresh(), 1500);
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <div className="size-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCheck} className="text-success text-xl" />
        </div>
        <h3 className="font-semibold text-text-primary text-lg mb-1">
          You&apos;re all set!
        </h3>
        <p className="text-sm text-text-secondary">
          Redirecting to your schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FontAwesomeIcon icon={faClock} className="text-primary size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">
            Set Your Weekly Availability
          </h3>
          <p className="text-xs text-text-secondary">
            Select <strong>ALL </strong> the times you&apos;re available — the
            more you pick, the more daily sessions you&apos;ll get. We&apos;ll
            match you with a teacher and create sessions on every overlapping
            weekday.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-px bg-border rounded-xl overflow-hidden min-w-[500px]"
          style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}
        >
          <div className="bg-bg-card p-2 text-[10px] font-semibold text-text-secondary text-center" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-bg-card p-2 text-[10px] font-semibold text-text-secondary text-center"
            >
              {day}
            </div>
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
                  <div className="bg-bg-card text-[9px] text-text-muted flex items-center justify-center">
                    {timeLabel}
                  </div>
                  {Array.from({ length: 7 }, (_, day) => {
                    const key = toSlotKey(day, start, end);
                    const isSelected = selected.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleCellMouseDown(rowIndex, day);
                        }}
                        onMouseEnter={() =>
                          handleCellMouseEnter(rowIndex, day)
                        }
                        className={`text-[10px] transition-colors h-7 select-none ${
                          isSelected
                            ? "bg-primary text-text-inverse"
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

      <p className="text-xs text-text-muted mt-4">
        Click and drag to select multiple slots. Selected = available, blank = unavailable.
      </p>

      {error && (
        <div className="flex items-center gap-2 mt-4 text-sm text-danger">
          <FontAwesomeIcon icon={faExclamationCircle} className="size-3.5" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-5">
        <p className="text-[11px] text-text-muted">
          {selected.size} slot{selected.size !== 1 ? "s" : ""} selected
        </p>
        <button
          onClick={handleSaveAndPair}
          disabled={saving}
          className="bg-primary text-text-inverse px-5 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <FontAwesomeIcon
                icon={faSpinner}
                className="size-3.5 animate-spin"
              />
              Finding a teacher...
            </>
          ) : (
            "Save & Find Teacher"
          )}
        </button>
      </div>
    </div>
  );
}
