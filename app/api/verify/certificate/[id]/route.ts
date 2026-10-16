import { NextResponse } from "next/server";

import { verifyCertificate } from "@/lib/certificate";

/**
 * Checks a certificate by its code, falling back to its id for older links.
 *
 * Public: anyone with the link can confirm what it says, since a certificate
 * that cannot be checked answers nothing. Nothing beyond the printed details
 * is revealed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const certificate = await verifyCertificate(id);
  if (!certificate) {
    return NextResponse.json({ error: "That certificate could not be found" }, { status: 404 });
  }

  return NextResponse.json({ certificate });
}
