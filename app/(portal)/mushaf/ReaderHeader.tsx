"use client";

import { Bookmark, Settings2 } from "lucide-react";

import type {
  QfChapter,
  QfJuz,
  QuranCatalog,
  ReaderPage,
} from "@/lib/qf/types";

import { SurahPicker } from "./SurahPicker";

export type ReaderMode = "verse" | "reading";

interface ReaderHeaderProps {
  catalog: QuranCatalog | null;
  chapter?: QfChapter;
  page?: ReaderPage;
  progress: number;
  bookmarked: boolean;
  canBookmark: boolean;
  onSelectChapter: (chapter: QfChapter) => void;
  onSelectJuz: (juz: QfJuz) => void;
  onSelectPage: (page: number) => void;
  onToggleBookmark: () => void;
  mode: ReaderMode;
  onModeChange: (mode: ReaderMode) => void;
  onSettings: () => void;
}

export function ReaderHeader({
  catalog,
  chapter,
  page,
  progress,
  bookmarked,
  canBookmark,
  onSelectChapter,
  onSelectJuz,
  onSelectPage,
  onToggleBookmark,
  mode,
  onModeChange,
  onSettings,
}: ReaderHeaderProps) {
  const pageNumber = page?.page.pageNumber;
  const juz = page?.page.juzNumbers[0];
  const hizb = page?.page.hizbNumbers[0];

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-bg-primary">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 md:px-6">
        <SurahPicker
          catalog={catalog}
          chapter={chapter}
          page={page}
          onSelectChapter={onSelectChapter}
          onSelectJuz={onSelectJuz}
          onSelectPage={onSelectPage}
        />

        <div className="order-2 ml-auto flex items-center gap-2 lg:order-3">
          <div
            role="group"
            aria-label="Reader mode"
            className="flex items-center rounded-lg border border-border bg-bg-elevated p-0.5"
          >
            <button
              type="button"
              aria-pressed={mode === "verse"}
              onClick={() => onModeChange("verse")}
              className={`h-8 rounded-md px-2.5 text-xs font-semibold transition-colors sm:px-3 ${
                mode === "verse"
                  ? "bg-primary text-text-inverse shadow-rest"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span className="sm:hidden">Verse</span>
              <span className="hidden sm:inline">Verse by Verse</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === "reading"}
              onClick={() => onModeChange("reading")}
              className={`h-8 rounded-md px-2.5 text-xs font-semibold transition-colors sm:px-3 ${
                mode === "reading"
                  ? "bg-primary text-text-inverse shadow-rest"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Reading
            </button>
          </div>

          <button
            type="button"
            onClick={onSettings}
            aria-label="Reader settings"
            title="Reader settings arrive in Phase 5"
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary"
          >
            <Settings2 className="size-4" />
          </button>
        </div>

        <div className="order-3 flex w-full items-center gap-3 text-[11px] font-semibold tracking-[0.08em] text-text-muted lg:order-2 lg:w-auto lg:flex-1 lg:justify-center">
          <button
            type="button"
            onClick={onToggleBookmark}
            disabled={!canBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove page bookmark" : "Bookmark this page"}
            className={`flex size-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40 ${
              bookmarked
                ? "border-primary/40 bg-primary-muted text-primary"
                : "border-border bg-bg-elevated text-text-secondary hover:border-primary/50 hover:text-text-primary"
            }`}
          >
            <Bookmark className={`size-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>

          <span className="font-mono text-xs text-text-primary">
            {pageNumber ? `Page ${pageNumber}` : "Loading page"}
          </span>

          <span aria-hidden className="h-3 w-px bg-border" />

          <span>
            Juz {juz ?? "—"} <span className="text-text-muted/60">/</span> Hizb{" "}
            {hizb ?? "—"}
          </span>
        </div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-border/70">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-qandeel"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
