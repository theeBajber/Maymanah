"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { plexArabic } from "@/app/ui/fonts";
import type {
  QfChapter,
  QfJuz,
  QuranCatalog,
  ReaderPage,
} from "@/lib/qf/types";

type PickerTab = "surah" | "juz" | "page";

interface SurahPickerProps {
  catalog: QuranCatalog | null;
  chapter?: QfChapter;
  page?: ReaderPage;
  onSelectChapter: (chapter: QfChapter) => void;
  onSelectJuz: (juz: QfJuz) => void;
  onSelectPage: (page: number) => void;
}

const TABS: { value: PickerTab; label: string }[] = [
  { value: "surah", label: "Surah" },
  { value: "juz", label: "Juz" },
  { value: "page", label: "Page" },
];

function juzRange(juz: QfJuz): string {
  const first = Object.entries(juz.verse_mapping)[0];
  return first ? `${first[0]}:${first[1]}` : "";
}

export function SurahPicker({
  catalog,
  chapter,
  page,
  onSelectChapter,
  onSelectJuz,
  onSelectPage,
}: SurahPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PickerTab>("surah");
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const pageChapterMap = useMemo(() => {
    const map = new Map<number, QfChapter>();
    for (const row of catalog?.chapters ?? []) {
      for (const pageNumber of row.pages) {
        if (!map.has(pageNumber)) map.set(pageNumber, row);
      }
    }
    return map;
  }, [catalog]);

  const pageOptions = useMemo(() => {
    const pages = new Set<number>();
    for (const row of catalog?.chapters ?? []) {
      for (const pageNumber of row.pages) pages.add(pageNumber);
    }
    return Array.from(pages).sort((left, right) => left - right);
  }, [catalog]);

  const normalized = query.trim().toLowerCase();

  const chapters = (catalog?.chapters ?? []).filter((row) => {
    if (!normalized) return true;
    return (
      String(row.id).includes(normalized) ||
      row.name_simple.toLowerCase().includes(normalized) ||
      row.name_complex.toLowerCase().includes(normalized) ||
      row.name_arabic.includes(normalized) ||
      row.translated_name.name.toLowerCase().includes(normalized)
    );
  });

  const juzs = (catalog?.juzs ?? []).filter((row) => {
    if (!normalized) return true;
    return (
      String(row.juz_number).includes(normalized) ||
      juzRange(row).includes(normalized)
    );
  });

  const pages = pageOptions.filter((pageNumber) => {
    if (!normalized) return true;
    const row = pageChapterMap.get(pageNumber);
    return (
      String(pageNumber).includes(normalized) ||
      (row ? row.name_simple.toLowerCase().includes(normalized) : false)
    );
  });

  const currentPage = page?.page.pageNumber ?? 1;

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex h-9 min-w-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors ${
          open
            ? "border-primary bg-primary-muted text-primary"
            : "border-border bg-bg-elevated text-text-primary hover:border-primary/60"
        }`}
      >
        <span className="truncate">
          {chapter ? `${chapter.id}. ${chapter.name_simple}` : "Choose surah"}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a surah, juz, or page"
          className="absolute top-full left-0 z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-float"
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${tab}`}
                className="h-10 w-full rounded-xl border border-border bg-bg-primary pr-9 pl-9 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div
              role="tablist"
              aria-label="Browse by"
              className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-bg-hover p-1"
            >
              {TABS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.value}
                  onClick={() => {
                    setTab(item.value);
                    setQuery("");
                  }}
                  className={`h-8 rounded-md text-xs font-semibold transition-colors ${
                    tab === item.value
                      ? "bg-bg-elevated text-text-primary shadow-rest"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[min(22rem,60vh)] overflow-y-auto p-1.5">
            {tab === "surah"
              ? chapters.map((row) => {
                  const selected = chapter?.id === row.id;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        close();
                        onSelectChapter(row);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-primary-muted text-primary"
                          : "text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      <span className="w-7 shrink-0 text-right font-mono text-[11px] text-text-muted">
                        {row.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {row.name_simple}
                        </span>
                        <span className="block truncate text-[11px] text-text-muted">
                          {row.translated_name.name} · {row.verses_count} verses
                        </span>
                      </span>
                      <span
                        dir="rtl"
                        lang="ar"
                        className={`${plexArabic.className} shrink-0 text-lg text-text-secondary`}
                      >
                        {row.name_arabic}
                      </span>
                    </button>
                  );
                })
              : null}

            {tab === "juz"
              ? juzs.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      close();
                      onSelectJuz(row);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-text-primary transition-colors hover:bg-bg-hover"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-primary text-[11px] font-bold text-text-secondary">
                      {row.juz_number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        Juz {row.juz_number}
                      </span>
                      <span className="block truncate text-[11px] text-text-muted">
                        Starts at {juzRange(row)}
                      </span>
                    </span>
                  </button>
                ))
              : null}

            {tab === "page"
              ? pages.map((pageNumber) => {
                  const row = pageChapterMap.get(pageNumber);
                  const selected = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => {
                        close();
                        onSelectPage(pageNumber);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected
                          ? "bg-primary-muted text-primary"
                          : "text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      <span className="w-10 shrink-0 font-mono text-[11px] text-text-muted">
                        {pageNumber}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {row ? row.name_simple : "Quran"}
                      </span>
                    </button>
                  );
                })
              : null}

            {tab === "surah" && chapters.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-text-muted">
                No surahs match that search.
              </p>
            ) : null}
            {tab === "juz" && juzs.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-text-muted">
                No juz match that search.
              </p>
            ) : null}
            {tab === "page" && pages.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-text-muted">
                No pages match that search.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-text-muted">
            <span>
              {catalog
                ? `${catalog.chapters.length} surahs · ${catalog.juzs.length} juz`
                : "Loading catalog"}
            </span>
            <span>Page {currentPage}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
