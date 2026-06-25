import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { level, message } = await req.json();
  const prefix = level === "error" ? "[CLIENT ERROR]" : "[CLIENT LOG]";
  console.log(`${prefix} ${message}`);
  return NextResponse.json({ ok: true });
}
