import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ImportBookClient } from "./ImportBookClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ImportBookPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const course = await safeQuery(() =>
    prisma.course.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    }),
  );

  if (!course) notFound();

  return <ImportBookClient course={course} />;
}
