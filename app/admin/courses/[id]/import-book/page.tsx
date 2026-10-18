import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ImportBookClient } from "./ImportBookClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ImportBookPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!course) notFound();

  return <ImportBookClient course={course} />;
}
