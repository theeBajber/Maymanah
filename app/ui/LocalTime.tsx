"use client";

import { useEffect, useState } from "react";

export type LocalTimeMode =
  | "time"
  | "date"
  | "date-short"
  | "datetime"
  | "weekday"
  | "weekday-time";

const FORMATS: Record<LocalTimeMode, Intl.DateTimeFormatOptions> = {
  time: { hour: "numeric", minute: "2-digit" },
  date: { weekday: "long", month: "short", day: "numeric" },
  "date-short": { weekday: "short", month: "short", day: "numeric" },
  datetime: {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  },
  weekday: { weekday: "long" },
  "weekday-time": { weekday: "short", hour: "numeric", minute: "2-digit" },
};

function format(iso: string, mode: LocalTimeMode, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    ...FORMATS[mode],
    timeZone,
  }).format(date);
}

/**
 * A session time in the viewer's own timezone.
 *
 * Server rendering happens in the server's zone, which is the wrong one for
 * most people. The first paint uses UTC so hydration is stable, then the
 * browser's zone takes over. Times are stored as UTC everywhere; only the
 * display changes.
 */
export function LocalTime({
  iso,
  mode = "datetime",
  className,
}: {
  iso: string;
  mode?: LocalTimeMode;
  className?: string;
}) {
  const [text, setText] = useState(() => format(iso, mode, "UTC"));

  useEffect(() => {
    // The browser zone is only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(format(iso, mode));
  }, [iso, mode]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
