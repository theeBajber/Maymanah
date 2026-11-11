import { NextResponse } from "next/server";

import { authoriseCron, runHourlyJobs } from "@/lib/cron";

export const maxDuration = 60;

/**
 * Earlier name for the hourly job, kept so existing schedules keep working.
 *
 * Both this endpoint and `/api/cron/hourly` run the same idempotent work.
 * Schedule only one of them; running both would send the same reminder twice.
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
