import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const donation = await prisma.donation.findFirst({
    where: { reference },
    select: { status: true },
  });

  return NextResponse.json({
    status: donation?.status ?? "PENDING",
  });
}
