import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { GraduationCap, Lock } from "lucide-react";

import { GlassCard } from "@/app/ui/glass";
import { Panel } from "@/app/ui/portal";
import { getFinalExam } from "@/lib/assessments";
import { auth } from "@/lib/auth";
import { courseCompletion } from "@/lib/completion";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ExamRunner } from "./ExamRunner";

export const metadata: Metadata = { title: "Final Exam" };

export default async function FinalExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser(await auth());
  if (!user) redirect("/login");

  const { slug } = await params;
  const course = await db.course.findFirst({
    where: { slug, isPublished: true },
    select: { id: true, title: true, slug: true },
  });
  if (!course) notFound();

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status === "DROPPED") redirect(`/courses/${slug}`);

  const assessment = await getFinalExam(user.id, course.id);

  const completion = await courseCompletion(user.id, course);
  const memorizing = completion.mode === "memorization";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <nav aria-label="Course">
        <Link href={`/courses/${slug}`} className="text-sm font-semibold text-primary hover:underline">
          ← {course.title}
        </Link>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-text-primary">Final Exam</h1>

      {!assessment ? (
        <Panel className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary-muted">
            <GraduationCap className="size-6 text-primary" />
          </span>
          <h2 className="text-lg font-bold text-text-primary">Final Exam Coming Soon</h2>
          <p className="text-sm text-text-secondary">
            The final exam for this course has not been published yet.
          </p>
        </Panel>
      ) : !completion.completed ? (
        <Panel className="flex flex-col items-center gap-4 p-12 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-warning-muted">
            <Lock className="size-6 text-warning" />
          </span>
          <h2 className="text-lg font-bold text-text-primary">
            {memorizing ? "Finish Your Memorisation First" : "Complete All Lessons First"}
          </h2>
          <p className="text-sm text-text-secondary">
            {memorizing
              ? `You must memorise the whole Quran before taking the final exam. You are ${completion.progress}% of the way there.`
              : `You must complete every lesson before taking the final exam. You are ${completion.progress}% of the way there.`}
          </p>
          <div className="h-2 w-full max-w-xs rounded-full bg-bg-primary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completion.progress}%` }}
            />
          </div>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-text-inverse transition-all hover:bg-primary-dark"
          >
            <GraduationCap className="size-4" />
            {memorizing ? "Continue Memorising" : "Continue Learning"}
          </Link>
        </Panel>
      ) : (
        <GlassCard className="p-2">
          <ExamRunner assessment={assessment} courseSlug={slug} />
        </GlassCard>
      )}
    </div>
  );
}
