"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faCheck,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/components/ui/toast";

const DAYS_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const MINUTES = [0, 30];

type SlotKey = `${number}-${string}-${string}`;

interface TeacherAvail {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function toSlotKey(day: number, start: string, end: string): SlotKey {
  return `${day}-${start}-${end}` as SlotKey;
}

function parseSlotKey(key: SlotKey) {
  const [day, start, end] = key.split("-");
  return { day: parseInt(day), start, end };
}

export function RescheduleAvailabilityButton({
  mentorshipId,
  teacherAvail,
  autoOpen,
}: {
  mentorshipId: string;
  teacherAvail: TeacherAvail[];
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<SlotKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  const dragActionRef = useRef<"add" | "remove" | null>(null);
  const isDraggingRef = useRef(false);
  const anchorRef = useRef<{ row: number; day: number } | null>(null);
  const prevRectKeysRef = useRef<Set<string> | null>(null);
  const preDragSelectedRef = useRef<Set<SlotKey> | null>(null);

  const FIRST_HOUR = HOURS[0];

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

  const isTeacherAvailable = useCallback((day: number, start: string, end: string): boolean => {
    const startMin = parseInt(start.split(":")[0]) * 60 + parseInt(start.split(":")[1]);
    const endMin = parseInt(end.split(":")[0]) * 60 + parseInt(end.split(":")[1]);
    return teacherAvail.some((a) => {
      if (a.dayOfWeek !== day) return false;
      const aStart = parseInt(a.startTime.split(":")[0]) * 60 + parseInt(a.startTime.split(":")[1]);
      const aEnd = parseInt(a.endTime.split(":")[0]) * 60 + parseInt(a.endTime.split(":")[1]);
      return startMin >= aStart && endMin <= aEnd;
    });
  }, [teacherAvail]);

  const getCellKey = useCallback((row: number, day: number): SlotKey => {
    const hourOffset = Math.floor(row / MINUTES.length);
    const minOffset = (row % MINUTES.length) * (60 / MINUTES.length);
    const hour = FIRST_HOUR + hourOffset;
    const min = minOffset;
    const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const endMin = min === 0 ? 30 : 0;
    const endHour = min === 0 ? hour : hour + 1;
    const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    return toSlotKey(day, start, end);
  }, [FIRST_HOUR]);

  const getRectKeys = useCallback((
    anchorRow: number,
    anchorDay: number,
    currentRow: number,
    currentDay: number,
  ): Set<SlotKey> => {
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
  }, [getCellKey]);

  const handleCellMouseDown = useCallback(
    (row: number, day: number) => {
      const key = getCellKey(row, day);
      const { start, end } = parseSlotKey(key);
      if (!isTeacherAvailable(day, start, end)) return;

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
    [selected, getCellKey, isTeacherAvailable],
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

      const filteredKeys = new Set<SlotKey>();
      for (const k of newRectKeys) {
        const { day: d, start, end } = parseSlotKey(k);
        if (isTeacherAvailable(d, start, end)) {
          filteredKeys.add(k as SlotKey);
        }
      }

      if (
        prevRectKeysRef.current &&
        filteredKeys.size === prevRectKeysRef.current.size &&
        [...filteredKeys].every((k) => prevRectKeysRef.current!.has(k as string))
      ) {
        return;
      }
      prevRectKeysRef.current = filteredKeys as unknown as Set<string>;
      setSelected(() => {
        const base = preDragSelectedRef.current!;
        if (dragActionRef.current === "add") {
          const next = new Set(base);
          for (const k of filteredKeys) next.add(k);
          return next;
        } else {
          const next = new Set(base);
          for (const k of filteredKeys) next.delete(k);
          return next;
        }
      });
    },
    [getRectKeys, isTeacherAvailable],
  );

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
        const data = await res.json();
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
          className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
        >
          <FontAwesomeIcon icon={faClock} className="size-3" />
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
          <div className="relative bg-bg-elevated border border-border rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Change Weekly Schedule</h3>
              <button
                onClick={() => setOpen(false)}
                disabled={saving}
                className="size-8 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            {success ? (
              <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
                <div className="size-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCheck} className="text-success text-xl" />
                </div>
                <h3 className="font-semibold text-text-primary text-lg mb-1">
                  Schedule updated!
                </h3>
                <p className="text-sm text-text-secondary">
                  Your new schedule is being applied...
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-text-secondary">
                  Select <strong>ALL</strong> the times you&apos;re available — the system will create daily sessions
                  within your teacher&apos;s available windows. Only slots your teacher is available are shown.
                </p>

                <div className="overflow-x-auto">
                  <div
                    className="grid gap-px bg-border rounded-xl overflow-hidden min-w-[500px]"
                    style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}
                  >
                    <div className="bg-bg-card p-2 text-[10px] font-semibold text-text-secondary text-center" />
                    {DAYS_LABEL.map((day) => (
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
                              const available = isTeacherAvailable(day, start, end);
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  disabled={!available}
                                  onMouseDown={(e) => {
                                    if (!available) return;
                                    e.preventDefault();
                                    handleCellMouseDown(rowIndex, day);
                                  }}
                                  onMouseEnter={() => handleCellMouseEnter(rowIndex, day)}
                                  className={`text-[10px] transition-colors h-7 select-none ${
                                    !available
                                      ? "bg-bg-card opacity-20 cursor-not-allowed"
                                      : isSelected
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

                <p className="text-xs text-text-muted">
                  Click and drag to select multiple slots. Only times your teacher is available are shown.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <p className="text-[11px] text-text-muted">
                    {selected.size} slot{selected.size !== 1 ? "s" : ""} selected
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:bg-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-primary text-text-inverse text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="size-3.5 animate-spin" />
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
