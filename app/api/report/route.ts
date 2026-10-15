import { NextResponse } from "next/server";
import { z } from "zod";

import { mailer } from "@/lib/mailer";
import { toMultiLine, toSingleLine } from "@/lib/text";

const reportSchema = z.object({
  reportType: z.enum(["user", "technical", "other"]),
  reportedUser: z.string().transform(toSingleLine).pipe(z.string().max(200)).optional(),
  reason: z.string().transform(toSingleLine).pipe(z.string().max(200)).optional(),
  description: z.string().transform(toMultiLine).pipe(z.string().min(10, "Describe the problem in a little more detail").max(5000)),
  reporterName: z.string().transform(toSingleLine).pipe(z.string().max(100)).optional(),
  reporterEmail: z.string().transform(toSingleLine).pipe(z.email("Enter a valid email address")).optional(),
});

/** Where safety and technical reports are delivered. Absent until mail is configured. */
function destination(): string | undefined {
  return process.env.CONTACT_EMAIL;
}

/**
 * Files a report about a person, a fault, or anything else.
 *
 * A report about a person names them; anything else must still describe the
 * problem in enough words to act on. Delivered as plain text through the mail
 * transport, so nothing the reporter typed is interpreted as markup.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the report" }, { status: 422 });
  }

  const { reportType, reportedUser, reason, description, reporterName, reporterEmail } = parsed.data;

  if (reportType === "user" && (!reportedUser || reportedUser.trim().length < 2)) {
    return NextResponse.json({ error: "Say who this report is about" }, { status: 422 });
  }

  const to = destination();
  if (!to) {
    console.warn("Report received but no CONTACT_EMAIL is configured", { reportType });
    return NextResponse.json({ error: "Reports cannot be delivered just now. Try again later" }, { status: 503 });
  }

  try {
    await mailer.send({
      to,
      subject: `Report: ${reportType}${reportedUser ? ` — ${reportedUser}` : ""}`,
      text: [
        `Type: ${reportType}`,
        reportedUser ? `About: ${reportedUser}` : null,
        reason ? `Reason: ${reason}` : null,
        reporterName ? `From: ${reporterName}` : null,
        reporterEmail ? `Reply to: ${reporterEmail}` : null,
        "",
        description,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (error) {
    console.error("Could not deliver report", error);
    return NextResponse.json({ error: "Reports cannot be delivered just now. Try again later" }, { status: 503 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
