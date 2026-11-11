import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin, UnauthorizedError } from "@/lib/admin";
import { logAuditEvent } from "@/lib/audit";
import { decideStanding } from "@/lib/standing";

const bodySchema = z.object({
  action: z.enum(["confirm", "dismiss"]),
});

/**
 * Confirms or dismisses a proposed account disable.
 *
 * Only an administrator can take this step: the hourly sweep proposes a
 * disable, but applying it is a human decision. Confirming also sends the
 * account its notice; dismissing leaves the account as it was.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Send a JSON body" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Choose confirm or dismiss" }, { status: 422 });
    }

    const result = await decideStanding(id, session.user.id, parsed.data.action);

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.reason === "decided"
              ? "That decision has already been made"
              : "That proposal could not be found",
        },
        { status: result.reason === "decided" ? 409 : 404 },
      );
    }

    await logAuditEvent({
      action: parsed.data.action === "confirm" ? "ADMIN_STANDING_DISABLED" : "ADMIN_STANDING_DISMISSED",
      userId: session.user.id,
      email: session.user.email,
      metadata: { standingEventId: id, action: parsed.data.action },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Standing decision error:", error);
    return NextResponse.json({ error: "Could not record that decision" }, { status: 500 });
  }
}
