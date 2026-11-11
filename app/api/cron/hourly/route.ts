import { NextResponse } from "next/server";

import { authoriseCron, runHourlyJobs } from "@/lib/cron";

export const maxDuration = 60;

/**
 * The hourly housekeeping job.
 *
 * Releases lapsed teaching seats, settles missed sessions, reminds both sides
 * of lessons starting within the hour, and evaluates attendance standing. Point
 * the deployment's scheduler here once an hour with `CRON_SECRET`.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const authorisation = authoriseCron(request);
  if (authorisation === "unconfigured") {
    return NextResponse.json({ error: "Cron jobs are not configured" }, { status: 503 });
  }
  if (authorisation === "unauthorized") {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, ...(await runHourlyJobs()) });
}
