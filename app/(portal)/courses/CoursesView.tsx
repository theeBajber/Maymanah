"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CourseCard } from "@/app/ui/cards";
import { EmptyState, PortalHeader } from "@/app/ui/portal";
import { Input } from "@/app/ui/input";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  image: string | null;
  lessonCount: number;
  enrolled: boolean;
  progress: number;
}

/**
 * The course catalogue, split into enrolled and available.
 *
 * Search filters both lists by title, so a catalogue of any size stays
 * navigable without pagination. An enrolled course links straight to its page;
 * anything else is an invitation, not a dead end.
 */
export function CoursesView() {
  const [courses, setCourses] = useState<CourseItem[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/courses")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { courses?: CourseItem[]; error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setError(body.error ?? "Could not load courses.");
          return;
        }
        setCourses(body.courses ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the server.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!courses) return null;
    const needle = query.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(needle) ||
        course.description?.toLowerCase().includes(needle),
    );
  }, [courses, query]);

  if (error && courses === null) {
    return <EmptyState title={error} />;
  }

  if (filtered === null) {
    return <EmptyState title="Loading courses…" />;
  }

  const enrolled = filtered.filter((course) => course.enrolled);
  const available = filtered.filter((course) => !course.enrolled);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <PortalHeader title="Courses" subtitle="Structured Hifdh and Tajweed, lesson by lesson" />

      <Input
        type="search"
        placeholder="Search courses…"
        aria-label="Search courses"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="max-w-md"
      />

      {enrolled.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-text-primary">Currently Enrolled</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {enrolled.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                progress={course.progress}
                lessons={course.lessonCount}
                href={`/courses/${course.slug}`}
                image={course.image}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary">
          {enrolled.length > 0 ? "Catalogue" : "Available Courses"}
        </h2>
        {available.length === 0 ? (
          <EmptyState
            title={query ? "Nothing matches that search." : "No courses available yet."}
            action={
              query ? null : (
                <p className="mt-2 text-sm text-text-secondary">
                  New courses appear here as teachers publish them.
                </p>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {available.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                progress={course.progress}
                lessons={course.lessonCount}
                href={`/courses/${course.slug}`}
                image={course.image}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-sm text-text-secondary">
        Looking for a teacher rather than a course?{" "}
        <Link href="/dashboard" className="font-semibold text-primary hover:underline">
          Go to your dashboard
        </Link>
      </p>
    </div>
  );
}
