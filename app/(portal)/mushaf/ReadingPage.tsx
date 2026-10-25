"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { amiri } from "@/app/ui/fonts";
import {
  qcfFontFaceCss,
  qcfFontFamily,
} from "@/lib/qf/qcf-font";
import type { ReaderPage } from "@/lib/qf/types";

import { isJustifiedPage, toArabicNumber } from "./reader-utils";

interface ReadingPageProps {
  page: ReaderPage;
  playingVerseKey: string | null;
  highlightRange: { start: number; end: number } | null;
  onPlayVerse: (verseKey: string) => void;
  preloadFont?: boolean;
}

const BASE_FONT_SIZE = "clamp(1.5rem, 3.2vw, 2.1rem)";
const FALLBACK_FONT_FAMILY = amiri.style.fontFamily ?? "serif";

export function ReadingPage({
  page,
  playingVerseKey,
  highlightRange,
  onPlayVerse,
  preloadFont = false,
}: ReadingPageProps) {
  const pageNumber = page.page.pageNumber;
  const justify = isJustifiedPage(page);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontActive, setFontActive] = useState(preloadFont);
  const [fontFailed, setFontFailed] = useState(false);
  const qcfPage = page.verses[0]?.words[0]?.v2Page ?? pageNumber;
  const qcfPages = new Set(
    page.lines.flatMap((line) =>
      line.words.map((word) => word.v2Page ?? qcfPage),
    ),
  );
  const fontFaces = Array.from(qcfPages, qcfFontFaceCss).join("");
  const showGlyphs = fontActive && !fontFailed;
  const useJustification = justify && showGlyphs;

  useEffect(() => {
    if (fontActive) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setFontActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1600px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fontActive]);

  useEffect(() => {
    if (!fontActive || fontFailed) return;

    let cancelled = false;
    const family = qcfFontFamily(qcfPage);
    const timeout = window.setTimeout(() => {
      if (!cancelled) setFontFailed(true);
    }, 6000);

    document.fonts
      .load(`1em "${family}"`)
      .then((faces) => {
        window.clearTimeout(timeout);
        if (
          !cancelled &&
          (faces.length === 0 || !document.fonts.check(`1em "${family}"`))
        ) {
          setFontFailed(true);
        }
      })
      .catch(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setFontFailed(true);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [fontActive, fontFailed, qcfPage]);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      lang="ar"
      className={`${amiri.className} overflow-x-hidden px-4 py-6 text-text-primary md:px-8 md:py-8`}
      style={{ "--reading-base-size": BASE_FONT_SIZE } as CSSProperties}
    >
      <style>{fontFaces}</style>
      <div
        data-reading-content
        data-reading-page={qcfPage}
        className="mx-auto grid w-max"
        style={{
          fontSize:
            "calc(var(--reading-base-size) * var(--reading-scale, 1))",
        }}
      >
        {page.lines.map((line, lineIndex) => (
          <div
            key={`${line.lineNumber}-${lineIndex}`}
            data-reading-line={useJustification ? "true" : "false"}
            className={`flex items-baseline whitespace-nowrap leading-[1.8] ${
              useJustification
                ? "justify-between"
                : "justify-center gap-x-[0.08em]"
            }`}
          >
            {line.words.map((word) => {
              const qcfFont = showGlyphs
                ? `"${qcfFontFamily(word.v2Page ?? pageNumber)}", ${FALLBACK_FONT_FAMILY}`
                : undefined;

              if (word.charTypeName === "end") {
                const verseNumber = Number.parseInt(
                  word.verseKey.split(":")[1] ?? "",
                  10,
                );
                const active = word.verseKey === playingVerseKey;

                if (word.codeV2 && showGlyphs) {
                  return (
                    <button
                      key={word.key}
                      id={`verse-${word.verseKey.replace(":", "-")}`}
                      type="button"
                      onClick={() => onPlayVerse(word.verseKey)}
                      aria-label={`Play verse ${word.verseKey}`}
                      title={`Play verse ${word.verseKey}`}
                      style={qcfFont ? { fontFamily: qcfFont } : undefined}
                      className={`relative shrink-0 cursor-pointer bg-transparent p-0 leading-none transition-colors after:absolute after:-inset-2.5 after:content-[''] ${
                        active
                          ? "text-secondary"
                          : "text-primary hover:text-secondary"
                      }`}
                    >
                      {word.codeV2}
                    </button>
                  );
                }

                return (
                  <button
                    key={word.key}
                    id={`verse-${word.verseKey.replace(":", "-")}`}
                    type="button"
                    onClick={() => onPlayVerse(word.verseKey)}
                    aria-label={`Play verse ${word.verseKey}`}
                    title={`Play verse ${word.verseKey}`}
                    style={{ width: "1.15em", height: "1.15em" }}
                    className={`mx-[0.04em] inline-flex shrink-0 cursor-pointer items-center justify-center self-center rounded-full border leading-none transition-colors ${
                      active
                        ? "border-secondary bg-secondary-muted text-secondary"
                        : "border-primary/35 text-primary hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    <span className="text-[0.55em] leading-none">
                      {Number.isFinite(verseNumber)
                        ? toArabicNumber(verseNumber)
                        : word.text}
                    </span>
                  </button>
                );
              }

              const text = word.textUthmani ?? word.text;
              if (!text.trim()) return null;
              const displayGlyph = showGlyphs ? word.codeV2 : null;

              const wordIndex = word.position - 1;
              const highlighted = Boolean(
                word.verseKey === playingVerseKey &&
                  highlightRange &&
                  wordIndex >= highlightRange.start &&
                  wordIndex < highlightRange.end,
              );

              return (
                <span
                  key={word.key}
                  data-reading-word
                  aria-label={text}
                  style={displayGlyph && qcfFont ? { fontFamily: qcfFont } : undefined}
                  className={`shrink-0 rounded-sm transition-colors ${
                    highlighted ? "bg-secondary-muted text-secondary" : ""
                  }`}
                >
                  {displayGlyph ? (
                    <span aria-hidden="true">{displayGlyph}</span>
                  ) : (
                    text
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
