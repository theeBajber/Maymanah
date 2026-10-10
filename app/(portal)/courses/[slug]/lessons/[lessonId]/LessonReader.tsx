"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/app/ui/button";
import { GlassCard } from "@/app/ui/glass";
import { useToast } from "@/app/ui/toast";

interface LessonView {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  courseId: string;
  course: { title: string; slug: string };
}

interface Neighbour {
  id: string;
  title: string;
}

/**
 * One lesson: the content, its neighbours, and completion.
 *
 * Content is markdown rendered as components. The completion button reports
 * the refreshed course percentage back, so the surrounding progress updates
 * without a reload.
 */
export function LessonReader({
  lesson,
  completed,
  previous,
  next,
  courseSlug,
}: {
  lesson: LessonView;
  completed: boolean;
  previous: Neighbour | null;
  next: Neighbour | null;
  courseSlug: string;
}) {
  const { toast } = useToast();
  const [done, setDone] = useState(completed);
  const [saving, setSaving] = useState(false);

  async function complete() {
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseSlug}/lessons/${lesson.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; progress?: number };
      if (!response.ok) {
        toast({ title: body.error ?? "Could not save your progress", variant: "error" });
        return;
      }
      setDone(true);
      toast({
        title: body.progress === 100 ? "Course complete. Well done." : "Marked complete.",
        variant: "success",
      });
    } catch {
      toast({ title: "Could not reach the server", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <nav aria-label="Course">
        <Link href={`/courses/${courseSlug}`} className="text-sm font-semibold text-primary hover:underline">
          ← {lesson.course.title}
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">{lesson.title}</h1>
        {lesson.duration ? <p className="text-sm text-text-secondary">{lesson.duration} min</p> : null}
      </header>

      {lesson.videoUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <video src={lesson.videoUrl} controls preload="metadata" className="aspect-video w-full bg-black" />
        </div>
      ) : null}

      {lesson.audioUrl && !lesson.videoUrl ? (
        <audio src={lesson.audioUrl} controls preload="metadata" className="w-full" />
      ) : null}

      {lesson.content ? (
        <GlassCard className="p-6 md:p-8">
          <LessonMarkdown content={lesson.content} />
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <p className="text-sm text-text-secondary">The text for this lesson is being written.</p>
        </GlassCard>
      )}

      <div className="flex items-center justify-between gap-3">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-night-success/15 px-3 py-1.5 text-sm font-semibold text-night-success">
            Completed
          </span>
        ) : (
          <Button size="md" loading={saving} onClick={complete}>
            Mark complete
          </Button>
        )}
      </div>

      <nav aria-label="Lessons" className="flex items-center justify-between gap-3 border-t border-border pt-6">
        {previous ? (
          <Link href={`/courses/${courseSlug}/lessons/${previous.id}`} className="max-w-[45%] truncate text-sm font-semibold text-primary hover:underline">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/courses/${courseSlug}/lessons/${next.id}`} className="max-w-[45%] truncate text-right text-sm font-semibold text-primary hover:underline">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

/**
 * Renders lesson markdown as components.
 *
 * Deliberately small: headings, emphasis, lists, links, and code. Anything
 * richer belongs in a dedicated renderer, not in a reader that must stay
 * predictable. Raw HTML is never interpreted, so untrusted content cannot
 * become markup.
 */
function LessonMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-text-secondary">
      {blocks.map((block, index) => (
        <MarkdownBlock key={index} block={block.trim()} />
      ))}
    </div>
  );
}

function MarkdownBlock({ block }: { block: string }) {
  if (block.startsWith("### ")) {
    return <h4 className="text-base font-bold text-text-primary">{inline(block.slice(4))}</h4>;
  }
  if (block.startsWith("## ")) {
    return <h3 className="text-lg font-bold text-text-primary">{inline(block.slice(3))}</h3>;
  }
  if (block.startsWith("# ")) {
    return <h2 className="text-xl font-bold text-text-primary">{inline(block.slice(2))}</h2>;
  }
  if (block.startsWith("> ")) {
    return (
      <blockquote className="border-l-2 border-primary/50 pl-4 italic">
        {inline(block.replace(/^> ?/gm, ""))}
      </blockquote>
    );
  }
  if (/^(-|\*) /m.test(block)) {
    return (
      <ul className="flex list-disc flex-col gap-1.5 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^(-|\*) /, ""))}</li>
        ))}
      </ul>
    );
  }
  if (/^\d+\. /m.test(block)) {
    return (
      <ol className="flex list-decimal flex-col gap-1.5 pl-5">
        {block.split("\n").map((line, i) => (
          <li key={i}>{inline(line.replace(/^\d+\. /, ""))}</li>
        ))}
      </ol>
    );
  }
  return <p>{inline(block)}</p>;
}

function inline(text: string): React.ReactNode {
  // Links first, so their brackets are not mistaken for emphasis.
  const parts = text.split(/(\[.+?\]\(.+?\)|\*\*.+?\*\*|\*[^*]+?\*|`[^`]+?`)/g);

  return parts.map((part, index) => {
    const link = /^\[(.+?)\]\((.+?)\)$/.exec(part);
    if (link) {
      const href = link[2];
      const safe = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/");
      return safe ? (
        <a key={index} href={href} className="font-medium text-primary hover:underline">
          {link[1]}
        </a>
      ) : (
        <span key={index}>{link[1]}</span>
      );
    }
    const bold = /^\*\*(.+)\*\*$/.exec(part);
    if (bold) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {bold[1]}
        </strong>
      );
    }
    const italic = /^\*([^]+)\*$/.exec(part);
    if (italic) {
      return <em key={index}>{italic[1]}</em>;
    }
    const code = /^`([^`]+)`$/.exec(part);
    if (code) {
      return (
        <code key={index} className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[13px] text-text-primary">
          {code[1]}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
