"use client";

import {
  Bookmark,
  Copy,
  Link2,
  MoreHorizontal,
  NotebookPen,
  Play,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { amiri } from "@/app/ui/fonts";
import type { ReaderVerse } from "@/lib/qf/types";

import {
  parseTranslationParts,
  toArabicNumber,
  type TranslationFootnote,
} from "./reader-utils";

interface VerseRowProps {
  verse: ReaderVerse;
  bookmarked: boolean;
  isPlaying?: boolean;
  highlightRange?: { start: number; end: number } | null;
  showTranslation?: boolean;
  showWordTooltips?: boolean;
  onPlay: (verse: ReaderVerse) => void;
  onToggleBookmark: (verse: ReaderVerse) => void;
  onCopy: (verse: ReaderVerse) => void;
  onShare: (verse: ReaderVerse) => void;
  onNote: (verse: ReaderVerse) => void;
  onSoon: (label: string) => void;
}

function ActionButton({
  label,
  onClick,
  active = false,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-primary-muted text-primary"
          : "text-text-muted hover:bg-bg-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function FootnoteMarker({ footnote }: { footnote: TranslationFootnote }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

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

  return (
    <span ref={containerRef} className="relative inline-block align-super">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Footnote ${footnote.number}`}
        className="rounded px-0.5 text-[10px] font-semibold text-primary transition-colors hover:text-primary-dark"
      >
        {footnote.label}
      </button>

      {open ? (
        <span
          role="note"
          className="absolute bottom-full left-1/2 z-40 mb-2 block w-64 max-w-[calc(100vw-3rem)] -translate-x-1/2 rounded-xl border border-border bg-bg-elevated p-3 text-left text-xs leading-5 font-normal text-text-secondary shadow-float"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold tracking-[0.1em] text-text-muted uppercase">
              Footnote {footnote.number}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close footnote"
              className="-mt-0.5 -mr-1 flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
            >
              <X className="size-3" />
            </button>
          </span>
          <span className="mt-1 block">
            {footnote.note ?? "This footnote is not available."}
          </span>
        </span>
      ) : null}
    </span>
  );
}

function TranslationText({ verse }: { verse: ReaderVerse }) {
  const translation = verse.translations[0];
  const parts = useMemo(
    () =>
      translation
        ? parseTranslationParts(translation.text, translation.footNotes)
        : [],
    [translation],
  );

  if (!translation) {
    return (
      <p className="text-sm text-text-muted italic">
        Translation unavailable for this verse.
      </p>
    );
  }

  return (
    <p className="text-[0.95rem] leading-7 text-text-secondary">
      {parts.map((part, index) =>
        part.type === "footnote" ? (
          <FootnoteMarker
            key={`${part.number}-${index}`}
            footnote={part}
          />
        ) : (
          <span key={index}>{part.text} </span>
        ),
      )}
    </p>
  );
}

export function VerseRow({
  verse,
  bookmarked,
  isPlaying = false,
  highlightRange = null,
  showTranslation = true,
  showWordTooltips = true,
  onPlay,
  onToggleBookmark,
  onCopy,
  onShare,
  onNote,
  onSoon,
}: VerseRowProps) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const words = verse.words.filter(
    (word) => word.charTypeName !== "end" && word.text.trim().length > 0,
  );

  return (
    <article
      id={`verse-${verse.key.replace(":", "-")}`}
      className={`scroll-mt-36 border-b border-border/70 px-4 py-6 last:border-b-0 md:px-7 md:py-7 ${
        isPlaying ? "bg-bg-hover/70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 font-mono text-[11px] font-semibold tracking-wide text-text-muted">
            {verse.key}
          </span>
          <ActionButton
            label={`Play verse ${verse.key}`}
            active={isPlaying}
            onClick={() => onPlay(verse)}
          >
            <Play className="size-4" />
          </ActionButton>
          <ActionButton
            label={
              bookmarked
                ? `Remove bookmark for verse ${verse.key}`
                : `Bookmark verse ${verse.key}`
            }
            active={bookmarked}
            pressed={bookmarked}
            onClick={() => onToggleBookmark(verse)}
          >
            <Bookmark className={`size-4 ${bookmarked ? "fill-current" : ""}`} />
          </ActionButton>
        </div>

        <div className="flex items-center gap-0.5">
          <ActionButton label="Copy verse" onClick={() => onCopy(verse)}>
            <Copy className="size-4" />
          </ActionButton>
          <ActionButton label="Share verse" onClick={() => onShare(verse)}>
            <Share2 className="size-4" />
          </ActionButton>
          <ActionButton label="Add a note" onClick={() => onNote(verse)}>
            <NotebookPen className="size-4" />
          </ActionButton>

          <div ref={menuRef} className="relative">
            <ActionButton
              label="More verse actions"
              active={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <MoreHorizontal className="size-4" />
            </ActionButton>

            {menuOpen ? (
              <div className="absolute top-full right-0 z-30 mt-1 w-44 rounded-xl border border-border bg-bg-elevated p-1 shadow-float">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onShare(verse);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  <Link2 className="size-3.5" />
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSoon("Tafsir");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  <NotebookPen className="size-3.5" />
                  Open tafsir
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        dir="rtl"
        lang="ar"
        className={`${amiri.className} mt-4 text-right text-[length:var(--verse-arabic-size,2rem)] leading-[2.55] text-text-primary`}
      >
        {words.length > 0 ? (
          words.map((word) => {
            const text = word.textUthmani ?? word.text;
            const wordIndex = word.position - 1;
            const highlighted = Boolean(
              highlightRange &&
                wordIndex >= highlightRange.start &&
                wordIndex < highlightRange.end,
            );
            const tooltip =
              word.translation || word.transliteration
                ? [word.translation, word.transliteration]
                    .filter(Boolean)
                    .join(" · ")
                : null;
            const showTooltip =
              activeWord === word.key || hoveredWord === word.key;

            if (!showWordTooltips) {
              return (
                <span key={word.key}>
                  <span
                    className={
                      highlighted
                        ? "rounded-sm bg-secondary-muted text-secondary"
                        : undefined
                    }
                  >
                    {text}
                  </span>{" "}
                </span>
              );
            }

            return (
              <span key={word.key}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveWord((current) =>
                      current === word.key ? null : word.key,
                    )
                  }
                  onMouseEnter={() => setHoveredWord(word.key)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onFocus={() => setHoveredWord(word.key)}
                  onBlur={() => setHoveredWord(null)}
                  aria-label={tooltip ? `${text}: ${tooltip}` : `Word ${text}`}
                  className={`relative inline-block rounded-md px-0.5 align-baseline transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 ${
                    highlighted
                      ? "bg-secondary-muted text-secondary"
                      : ""
                  }`}
                >
                  {text}
                  {showTooltip && tooltip ? (
                    <span
                      role="tooltip"
                      dir="ltr"
                      className="absolute bottom-full left-1/2 z-40 mb-2 block w-max max-w-56 -translate-x-1/2 rounded-lg border border-ivory/10 bg-layl-deep px-2.5 py-1.5 text-left text-xs leading-5 font-medium text-ivory shadow-float"
                    >
                      {word.translation ? (
                        <span className="block">{word.translation}</span>
                      ) : null}
                      {word.transliteration ? (
                        <span className="mt-0.5 block text-[10px] font-normal text-ivory/70 italic">
                          {word.transliteration}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </button>{" "}
              </span>
            );
          })
        ) : (
          <span>{verse.textUthmani}</span>
        )}

        <span
          aria-label={`Verse ${verse.verseNumber}`}
          className="mx-1 inline-flex size-8 translate-y-1 items-center justify-center rounded-full border border-primary/35 align-middle text-[0.95rem] text-primary"
        >
          {toArabicNumber(verse.verseNumber)}
        </span>
      </div>

      {showTranslation ? (
        <div className="mt-3 max-w-3xl">
          <TranslationText verse={verse} />
        </div>
      ) : null}

    </article>
  );
}
