import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, getUsers } from "@/lib/admin";
import { z } from "zod";
import type { UserRole } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await getUsers({
      search: parsed.data.search,
      role: parsed.data.role as UserRole | "ALL" | undefined,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
