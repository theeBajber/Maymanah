"use client";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as FaIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useMemo } from "react";
import { useTopNavContent } from "@/lib/TopNavContext";
import Link from "next/link";
import { faArrowRight, faBookOpen, faNoteSticky } from "@fortawesome/free-solid-svg-icons";

type StudentData = {
  id: string;
  name: string | null;
  lastSurah: number | null;
  lastVerse: number | null;
  openNotesCount: number;
};

export default function StudentsClient({ students }: { students: StudentData[] }) {
  const { setContent } = useTopNavContent();
  const [search, setSearch] = useState("");

  useEffect(() => {
    setContent(
      <div className="relative w-full max-w-md">
        <FaIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-border bg-bg-primary text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition-colors"
        />
      </div>,
    );
    return () => setContent(null);
  }, [setContent, search]);

  const query = search.toLowerCase().trim();

  const filtered = useMemo(
    () =>
      !query
        ? students
        : students.filter((s) => (s.name ?? "").toLowerCase().includes(query)),
    [students, query],
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <section>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          My Students
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {students.length} active student{students.length !== 1 ? "s" : ""}
        </p>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-elevated/50 p-12 text-center">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FaIcon icon={faBookOpen} className="text-primary text-lg" />
          </div>
          <p className="text-sm text-text-secondary">
            {query ? `No students match "${search}"` : "No active students assigned yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="rounded-2xl border border-border bg-bg-elevated p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-text-primary">
                  {s.name?.split(" ")[0] ?? "Student"}
                </p>
                <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                  <span>Surah {s.lastSurah ?? "?"}:{s.lastVerse ?? "?"}</span>
                  <span className="flex items-center gap-1">
                    <FaIcon icon={faNoteSticky} className="size-3" />
                    {s.openNotesCount} open note{s.openNotesCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <FaIcon icon={faArrowRight} className="text-text-muted group-hover:text-primary transition-colors size-4" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
