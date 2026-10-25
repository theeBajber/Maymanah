"use client";

import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { amiri } from "@/app/ui/fonts";
import { Skeleton } from "@/app/ui/Skeleton";
import { useToast } from "@/app/ui/toast";
import { qcfFontFamily } from "@/lib/qf/qcf-font";
import { getJuzStartPage } from "@/lib/quran";
import type {
  QfChapter,
  QfJuz,
  QfRecitation,
  QuranCatalog,
  ReaderAudioFile,
  ReaderPage,
  ReaderVerse,
} from "@/lib/qf/types";

import { AudioPlayer } from "./AudioPlayer";
import {
  activeWordRange,
  audioProxyUrl,
  buildSurahTimeline,
  findTimelineEntry,
  timelineDuration,
} from "./audio-utils";
import { ReadingPage } from "./ReadingPage";
import { ReaderHeader, type ReaderMode } from "./ReaderHeader";
import { ReaderSettingsDialog } from "./ReaderSettingsDialog";
import {
  arabicSizeCss,
  DEFAULT_READER_SETTINGS,
  loadReaderSettings,
  saveReaderSettings,
  type ReaderSettings,
} from "./reader-settings";
import {
  isJustifiedPage,
  pageChapter,
  readerProgress,
  showsBismillah,
  stripHtml,
  verseBookmarkKey,
} from "./reader-utils";
import { VerseRow } from "./VerseRow";

const TRANSLATION_ID =
  Number(process.env.NEXT_PUBLIC_QF_TRANSLATION_ID) || 85;
const MAX_READING_FONT_SIZE = 52;

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

interface BookmarkRow {
  id: string;
  surah: number;
  ayah: number;
}

type PendingPlay =
  | "first"
  | "last"
  | { verseKey: string; startAt: number };

function ReaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-16 md:px-6">
      <div className="rounded-2xl border border-border bg-bg-elevated">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="space-y-4 border-b border-border/70 p-6 last:border-b-0 md:p-7"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-3/4" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BismillahHeader() {
  return (
    <div className="px-4 py-7 text-center md:py-9">
      <p
        lang="ar"
        dir="rtl"
        className={`${amiri.className} text-[2rem] leading-[1.9] text-text-primary md:text-[2.5rem]`}
      >
        {BISMILLAH}
      </p>
      <p className="mt-2 text-xs text-text-muted">
        In the Name of Allah—the Most Compassionate, the Most Merciful
      </p>
    </div>
  );
}

function PageNavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
    >
      {direction === "previous" ? <Icon className="size-4" /> : null}
      {direction === "previous" ? "Previous" : "Next"}
      {direction === "next" ? <Icon className="size-4" /> : null}
    </button>
  );
}

export function MushafView({ initialPage = 1 }: { initialPage?: number }) {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<QuranCatalog | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [readerPage, setReaderPage] = useState<ReaderPage | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [readerMode, setReaderMode] = useState<ReaderMode>("verse");
  const [settings, setSettings] = useState<ReaderSettings>(
    DEFAULT_READER_SETTINGS,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [recitations, setRecitations] = useState<QfRecitation[] | null>(null);
  const [recitationsLoading, setRecitationsLoading] = useState(false);
  const [recitationsError, setRecitationsError] = useState("");
  const [recitationsVersion, setRecitationsVersion] = useState(0);
  const [readingPages, setReadingPages] = useState<ReaderPage[] | null>(null);
  const [readingError, setReadingError] = useState<{
    chapterId: number;
    message: string;
  } | null>(null);
  const [bookmarkIds, setBookmarkIds] = useState<Map<string, string>>(
    new Map(),
  );
  const [audioByVerse, setAudioByVerse] = useState<
    Map<string, ReaderAudioFile>
  >(new Map());
  const [audioError, setAudioError] = useState("");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatVerse, setRepeatVerse] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const readingRootRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const pendingPlayRef = useRef<PendingPlay | null>(null);
  const lastReciterRef = useRef(settings.reciterId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettings(loadReaderSettings());
      setSettingsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    saveReaderSettings(settings);
  }, [settings, settingsHydrated]);

  useEffect(() => {
    if (!settingsOpen || recitations) return;

    const controller = new AbortController();

    fetch("/api/quran/recitations", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          recitations?: QfRecitation[];
          error?: string;
        };
        if (!response.ok || !body.recitations) {
          throw new Error(
            body.error ?? "The reciter list could not be loaded.",
          );
        }
        return body.recitations;
      })
      .then((rows) => {
        if (!controller.signal.aborted) setRecitations(rows);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setRecitationsError(
            error instanceof Error
              ? error.message
              : "The reciter list could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRecitationsLoading(false);
      });

    return () => controller.abort();
  }, [recitations, recitationsVersion, settingsOpen]);

  useEffect(() => {
    if (lastReciterRef.current === settings.reciterId) return;
    lastReciterRef.current = settings.reciterId;

    const element = audioRef.current;
    if (element) {
      element.pause();
      element.removeAttribute("src");
      element.load();
    }

    pendingPlayRef.current = null;
    setAudioByVerse(new Map());
    setAudioError("");
    setPlayerOpen(false);
    setIsPlaying(false);
    setPlayingVerseKey(null);
    setCurrentTime(0);
    setDuration(0);
  }, [settings.reciterId]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/quran/catalog", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as
          | QuranCatalog
          | { error?: string };
        if (!response.ok) {
          throw new Error(
            "error" in body && body.error
              ? body.error
              : "The surah list could not be loaded.",
          );
        }
        return body as QuranCatalog;
      })
      .then((body) => {
        setCatalog(body);
        setCatalogError("");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setCatalogError(
          error instanceof Error
            ? error.message
            : "The surah list could not be loaded.",
        );
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/bookmarks", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { bookmarks?: BookmarkRow[] };
      })
      .then((body) => {
        const next = new Map<string, string>();
        for (const row of body?.bookmarks ?? []) {
          next.set(`${row.surah}:${row.ayah}`, row.id);
        }
        setBookmarkIds(next);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `/api/quran/page/${pageNumber}?translation=${TRANSLATION_ID}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as
          | ReaderPage
          | { error?: string };
        if (!response.ok) {
          throw new Error(
            "error" in body && body.error
              ? body.error
              : "That page could not be loaded.",
          );
        }
        return body as ReaderPage;
      })
      .then((body) => {
        setReaderPage(body);
        setPageLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setReaderPage(null);
        setPageError(
          error instanceof Error
            ? error.message
            : "That page could not be loaded.",
        );
        setPageLoading(false);
      });

    return () => controller.abort();
  }, [pageNumber, requestVersion]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(pageNumber));
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [pageNumber]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!readerPage || !hash) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ block: "start" });
  }, [readerPage]);

  const chapters = useMemo(() => catalog?.chapters ?? [], [catalog]);
  const chapter = useMemo(
    () =>
      readerPage ? pageChapter(chapters, readerPage.verses) : undefined,
    [chapters, readerPage],
  );
  const audioChapterIds = useMemo(
    () =>
      Array.from(
        new Set(readerPage?.verses.map((verse) => verse.chapterId) ?? []),
      ),
    [readerPage],
  );
  const firstVerse = readerPage?.verses[0];
  const firstBookmark = firstVerse ? verseBookmarkKey(firstVerse) : null;
  const progress = readerPage ? readerProgress(readerPage.verses, chapter) : 0;
  const chapterId = chapter?.id;

  const readingChapterId = readingPages?.[0]?.verses[0]?.chapterId;
  const activeReadingPages = useMemo(() => {
    if (readerMode !== "reading") return [];
    if (
      readingPages &&
      readingPages.length > 0 &&
      (!chapterId || readingChapterId === chapterId)
    ) {
      return readingPages;
    }
    return readerPage ? [readerPage] : [];
  }, [
    chapterId,
    readerMode,
    readerPage,
    readingChapterId,
    readingPages,
  ]);
  const readingFontPreloadPage = useMemo(
    () =>
      (activeReadingPages.find(isJustifiedPage) ?? activeReadingPages[0])
        ?.page.pageNumber,
    [activeReadingPages],
  );
  const readingPagesLoading = Boolean(
    readerMode === "reading" &&
      chapterId &&
      readingChapterId !== chapterId &&
      readingError?.chapterId !== chapterId,
  );
  const readingPageError =
    readingError && readingError.chapterId === chapterId
      ? readingError.message
      : "";

  useEffect(() => {
    if (readerMode !== "reading") return;
    const root = readingRootRef.current;
    if (!root) return;

    let cancelled = false;
    let fitting = false;

    async function fit() {
      if (!root || fitting) return;
      fitting = true;

      try {
        const contents = Array.from(
          root.querySelectorAll<HTMLElement>("[data-reading-content]"),
        );
        const measurement =
          contents.find((content) =>
            content.querySelector('[data-reading-line="true"]'),
          ) ?? contents[0];
        if (!measurement) return;

        const pageNumber = Number(
          measurement.dataset.readingPage ??
            activeReadingPages[0]?.page.pageNumber,
        );
        if (!Number.isFinite(pageNumber) || pageNumber <= 0) return;

        const family = qcfFontFamily(pageNumber);
        if (!document.fonts.check(`1em "${family}"`)) {
          const loaded = await Promise.race([
            document.fonts
              .load(`1em "${family}"`)
              .then((faces) => faces.length > 0),
            new Promise<boolean>((resolve) =>
              window.setTimeout(() => resolve(false), 6_500),
            ),
          ]).catch(() => false);

          if (!loaded) {
            root.style.setProperty("--reading-scale", "1");
            return;
          }
        }
        if (cancelled || !root) return;

        root.style.setProperty("--reading-scale", "1");
        const parent = measurement.parentElement;
        if (!parent) return;

        const style = window.getComputedStyle(parent);
        const available =
          parent.clientWidth -
          (Number.parseFloat(style.paddingLeft) || 0) -
          (Number.parseFloat(style.paddingRight) || 0);
        const required = measurement.scrollWidth;
        const baseSize = Number.parseFloat(
          window.getComputedStyle(measurement).fontSize,
        );
        if (available <= 0 || required <= 0 || baseSize <= 0) return;

        const ratio = (available - 1) / (required * 1.025);
        const maxScale = MAX_READING_FONT_SIZE / baseSize;
        const scale = Math.min(ratio, maxScale);

        root.style.setProperty(
          "--reading-scale",
          String(Math.max(0.5, scale)),
        );
      } finally {
        fitting = false;
      }
    }

    let lastWidth = root.clientWidth;
    const observer = new ResizeObserver(() => {
      if (!root) return;
      const width = root.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      void fit();
    });

    void fit();
    lastWidth = root.clientWidth;
    observer.observe(root);
    window.addEventListener("resize", fit);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [activeReadingPages, readerMode]);

  useEffect(() => {
    if (readerMode !== "reading" || !chapterId) return;
    if (readingChapterId === chapterId) return;

    const controller = new AbortController();

    fetch(`/api/quran/chapter/${chapterId}?translation=${TRANSLATION_ID}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as {
          pages?: ReaderPage[];
          error?: string;
        };
        if (!response.ok || !body.pages) {
          throw new Error(
            body.error ?? "That surah could not be loaded for reading.",
          );
        }
        return body.pages;
      })
      .then((pages) => {
        setReadingPages(pages);
        setReadingError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setReadingError({
          chapterId,
          message:
            error instanceof Error
              ? error.message
              : "That surah could not be loaded for reading.",
        });
      });

    return () => controller.abort();
  }, [chapterId, readerMode, readingChapterId]);

  useEffect(() => {
    if (audioChapterIds.length === 0) return;

    const controller = new AbortController();

    Promise.all(
      audioChapterIds.map(async (chapterId) => {
        const response = await fetch(
          `/api/quran/recitations/${settings.reciterId}/chapters/${chapterId}`,
          { signal: controller.signal },
        );
        const body = (await response.json().catch(() => ({}))) as {
          audioFiles?: ReaderAudioFile[];
          error?: string;
        };

        if (!response.ok || !body.audioFiles) {
          throw new Error(
            body.error ?? "Recitation audio could not be loaded.",
          );
        }

        return body.audioFiles;
      }),
    )
      .then((groups) => {
        const next = new Map<string, ReaderAudioFile>();
        for (const file of groups.flat()) {
          next.set(file.verseKey, file);
        }
        setAudioByVerse(next);
        setAudioError("");
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        pendingPlayRef.current = null;
        setAudioByVerse(new Map());
        setAudioError(
          error instanceof Error
            ? error.message
            : "Recitation audio could not be loaded.",
        );
        setIsPlaying(false);
        setPlayingVerseKey(null);
        setPlayerOpen(false);
        setCurrentTime(0);
        setDuration(0);
      });

    return () => controller.abort();
  }, [audioChapterIds, settings.reciterId]);

  const maxPage = useMemo(() => {
    const pages = chapters.flatMap((row) => row.pages);
    return Math.max(pageNumber, ...pages, 1);
  }, [chapters, pageNumber]);

  const verseKeys = useMemo(() => {
    if (readerMode === "reading" && activeReadingPages.length > 0) {
      return Array.from(
        new Set(
          activeReadingPages.flatMap((page) =>
            page.verses.map((verse) => verse.key),
          ),
        ),
      );
    }

    return readerPage?.verses.map((verse) => verse.key) ?? [];
  }, [activeReadingPages, readerMode, readerPage]);
  const playingIndex = playingVerseKey
    ? verseKeys.indexOf(playingVerseKey)
    : -1;
  const activeAudio = playingVerseKey
    ? audioByVerse.get(playingVerseKey)
    : undefined;
  const surahTimeline = useMemo(() => {
    if (!playingVerseKey) return [];
    return buildSurahTimeline(
      audioByVerse.values(),
      Number(playingVerseKey.split(":")[0]),
    );
  }, [audioByVerse, playingVerseKey]);
  const surahDuration = timelineDuration(surahTimeline);
  const currentSurahEntry = surahTimeline.find(
    (entry) => entry.key === playingVerseKey,
  );
  const playerDuration = surahDuration > 0 ? surahDuration : duration;
  const playerCurrentTime =
    currentSurahEntry && surahDuration > 0
      ? currentSurahEntry.start +
        Math.min(currentTime, currentSurahEntry.duration)
      : currentTime;
  const activeRange =
    isPlaying && activeAudio
      ? activeWordRange(activeAudio.segments, currentTime)
      : null;
  const canPrevious = Boolean(
    playingVerseKey &&
      !pageLoading &&
      (playingIndex > 0 || pageNumber > 1),
  );
  const canNext = Boolean(
    playingVerseKey &&
      !pageLoading &&
      ((playingIndex >= 0 && playingIndex < verseKeys.length - 1) ||
        pageNumber < maxPage),
  );

  const stopPlayback = useCallback(() => {
    const element = audioRef.current;
    if (element) {
      element.pause();
      element.currentTime = 0;
    }

    pendingPlayRef.current = null;
    setPlayerOpen(false);
    setIsPlaying(false);
    setPlayingVerseKey(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const playVerse = useCallback(
    (verseKey: string, startAt = 0) => {
      const file = audioByVerse.get(verseKey);
      const element = audioRef.current;

      if (!file || !element) {
        toast({
          title:
            audioError ||
            "Recitation audio is still loading for this page.",
          variant: audioError ? "error" : "info",
        });
        return;
      }

      const source = audioProxyUrl(file.url);
      const sourceChanged =
        element.src !== new URL(source, window.location.href).toString();

      if (sourceChanged) {
        element.src = source;
        element.load();
      }

      const begin = () => {
        const limit =
          Number.isFinite(element.duration) && element.duration > 0
            ? Math.max(0, element.duration - 0.05)
            : null;
        element.currentTime = limit
          ? Math.min(Math.max(0, startAt), limit)
          : Math.max(0, startAt);
        element.playbackRate = playbackRate;
        element.defaultPlaybackRate = playbackRate;
        element.muted = muted;

        void element.play().catch(() => {
          setIsPlaying(false);
          toast({
            title: "That verse could not be played",
            variant: "error",
          });
        });
      };

      setPlayingVerseKey(verseKey);
      setPlayerOpen(true);
      setCurrentTime(startAt);
      setDuration(0);
      setIsPlaying(true);

      if (sourceChanged) {
        element.addEventListener("loadedmetadata", begin, { once: true });
      } else {
        begin();
      }
    },
    [audioByVerse, audioError, muted, playbackRate, toast],
  );

  const goToPage = useCallback(
    (
      next: number,
      options?: { preservePlayback?: boolean },
    ) => {
      const target = Math.min(Math.max(1, next), maxPage);
      if (target === pageNumber) return;

      if (options?.preservePlayback) {
        const pending = pendingPlayRef.current;
        audioRef.current?.pause();
        setIsPlaying(false);
        if (!pending || typeof pending === "string") {
          setCurrentTime(0);
          setDuration(0);
        }
      } else {
        stopPlayback();
      }

      setPageNumber(target);
      setReaderPage(null);
      setPageLoading(true);
      setPageError("");
      window.scrollTo({ top: 0 });
    },
    [maxPage, pageNumber, stopPlayback],
  );

  const togglePlayback = useCallback(() => {
    const element = audioRef.current;
    if (!element || !playingVerseKey) return;

    if (element.paused) {
      if (element.ended) element.currentTime = 0;
      void element.play().catch(() => {
        setIsPlaying(false);
        toast({
          title: "That verse could not be played",
          variant: "error",
        });
      });
      return;
    }

    element.pause();
  }, [playingVerseKey, toast]);

  const seekAudio = useCallback(
    (time: number) => {
      const element = audioRef.current;
      if (!element) return;

      if (surahTimeline.length === 0) {
        if (!Number.isFinite(element.duration)) return;
        const next = Math.min(Math.max(0, time), element.duration);
        element.currentTime = next;
        setCurrentTime(next);
        return;
      }

      const entry = findTimelineEntry(surahTimeline, time);
      if (!entry) return;

      const localTime = Math.max(
        0,
        Math.min(time - entry.start, entry.duration),
      );

      if (entry.key === playingVerseKey) {
        element.currentTime = localTime;
        setCurrentTime(localTime);
        return;
      }

      if (
        readerMode !== "reading" &&
        entry.pageNumber &&
        entry.pageNumber !== pageNumber
      ) {
        setPlayingVerseKey(entry.key);
        setCurrentTime(localTime);
        setDuration(0);
        pendingPlayRef.current = {
          verseKey: entry.key,
          startAt: localTime,
        };
        goToPage(entry.pageNumber, { preservePlayback: true });
        return;
      }

      playVerse(entry.key, localTime);
    },
    [
      goToPage,
      pageNumber,
      playVerse,
      playingVerseKey,
      readerMode,
      surahTimeline,
    ],
  );

  const playPrevious = useCallback(() => {
    if (!playingVerseKey) return;

    if (playingIndex > 0) {
      playVerse(verseKeys[playingIndex - 1]);
      return;
    }

    if (pageNumber > 1) {
      pendingPlayRef.current = "last";
      goToPage(pageNumber - 1, { preservePlayback: true });
    }
  }, [
    goToPage,
    pageNumber,
    playVerse,
    playingIndex,
    playingVerseKey,
    verseKeys,
  ]);

  const playNext = useCallback(() => {
    if (!playingVerseKey) return;

    if (playingIndex >= 0 && playingIndex < verseKeys.length - 1) {
      playVerse(verseKeys[playingIndex + 1]);
      return;
    }

    if (pageNumber < maxPage) {
      pendingPlayRef.current = "first";
      goToPage(pageNumber + 1, { preservePlayback: true });
    }
  }, [
    goToPage,
    maxPage,
    pageNumber,
    playVerse,
    playingIndex,
    playingVerseKey,
    verseKeys,
  ]);

  const handleEnded = useCallback(() => {
    if (!playingVerseKey) return;

    if (repeatVerse) {
      playVerse(playingVerseKey);
      return;
    }

    if (!autoplayNext) {
      setIsPlaying(false);
      return;
    }

    if (playingIndex >= 0 && playingIndex < verseKeys.length - 1) {
      playVerse(verseKeys[playingIndex + 1]);
      return;
    }

    if (pageNumber < maxPage) {
      pendingPlayRef.current = "first";
      goToPage(pageNumber + 1, { preservePlayback: true });
      return;
    }

    setIsPlaying(false);
  }, [
    autoplayNext,
    goToPage,
    maxPage,
    pageNumber,
    playVerse,
    playingIndex,
    playingVerseKey,
    repeatVerse,
    verseKeys,
  ]);

  const toggleMute = useCallback(() => {
    const element = audioRef.current;
    const next = !muted;
    if (element) element.muted = next;
    setMuted(next);
  }, [muted]);

  const changeRate = useCallback((rate: number) => {
    const element = audioRef.current;
    if (element) {
      element.playbackRate = rate;
      element.defaultPlaybackRate = rate;
    }
    setPlaybackRate(rate);
  }, []);

  const handleAudioError = useCallback(() => {
    if (!playingVerseKey) return;
    setIsPlaying(false);
    toast({
      title: "That verse could not be played",
      variant: "error",
    });
  }, [playingVerseKey, toast]);

  useEffect(() => {
    const pending = pendingPlayRef.current;
    if (!pending || !readerPage) return;

    const keys = readerPage.verses
      .map((verse) => verse.key)
      .filter((key) => audioByVerse.has(key));
    if (keys.length === 0) return;

    let key: string;
    let startAt = 0;

    if (pending === "first") {
      key = keys[0];
    } else if (pending === "last") {
      key = keys[keys.length - 1];
    } else {
      key = pending.verseKey;
      startAt = pending.startAt;
    }

    if (!audioByVerse.has(key)) return;

    const timer = window.setTimeout(() => {
      if (pendingPlayRef.current !== pending) return;
      pendingPlayRef.current = null;
      playVerse(key, startAt);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [audioByVerse, playVerse, readerPage]);

  useEffect(() => {
    if (
      readerMode !== "reading" ||
      playingVerseKey ||
      activeReadingPages.length === 0
    ) {
      return;
    }

    const target = document.getElementById(`page-${pageNumber}`);
    target?.scrollIntoView({ block: "start" });
  }, [
    activeReadingPages,
    pageNumber,
    playingVerseKey,
    readerMode,
  ]);

  useEffect(() => {
    if (!playingVerseKey) return;

    autoScrollRef.current = true;
    const target = document.getElementById(
      `verse-${playingVerseKey.replace(":", "-")}`,
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeReadingPages, playingVerseKey, readerMode, readerPage]);

  useEffect(() => {
    function pauseAutoScroll() {
      autoScrollRef.current = false;
    }

    window.addEventListener("wheel", pauseAutoScroll, { passive: true });
    window.addEventListener("touchmove", pauseAutoScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", pauseAutoScroll);
      window.removeEventListener("touchmove", pauseAutoScroll);
    };
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  const selectChapter = useCallback(
    (next: QfChapter) => goToPage(next.pages[0] ?? 1),
    [goToPage],
  );

  const selectJuz = useCallback(
    (juz: QfJuz) => goToPage(getJuzStartPage(juz.juz_number)),
    [goToPage],
  );

  const copyText = useCallback(
    async (text: string, title: string) => {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        toast({ title, variant: "success" });
      } catch {
        toast({ title: "Could not copy to the clipboard", variant: "error" });
      }
    },
    [toast],
  );

  const toggleBookmark = useCallback(
    async (verse: ReaderVerse) => {
      const reference = verseBookmarkKey(verse);
      const existing = bookmarkIds.get(reference.key);

      try {
        if (existing) {
          const response = await fetch(
            `/api/bookmarks?id=${encodeURIComponent(existing)}`,
            { method: "DELETE" },
          );
          const body = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          if (!response.ok) {
            throw new Error(body.error ?? "That bookmark could not be removed.");
          }

          setBookmarkIds((current) => {
            const next = new Map(current);
            next.delete(reference.key);
            return next;
          });
          toast({ title: "Bookmark removed", variant: "success" });
          return;
        }

        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            surah: reference.surah,
            ayah: reference.ayah,
          }),
        });
        const body = (await response.json().catch(() => ({}))) as {
          id?: string;
          error?: string;
        };
        if (!response.ok || !body.id) {
          throw new Error(body.error ?? "That verse could not be bookmarked.");
        }

        setBookmarkIds((current) => {
          const next = new Map(current);
          next.set(reference.key, body.id!);
          return next;
        });
        toast({ title: "Verse bookmarked", variant: "success" });
      } catch (error) {
        toast({
          title:
            error instanceof Error ? error.message : "Bookmarking failed",
          variant: "error",
        });
      }
    },
    [bookmarkIds, toast],
  );

  const copyVerse = useCallback(
    (verse: ReaderVerse) => {
      const translation = verse.translations[0]?.text;
      const arabic =
        verse.textUthmani ??
        verse.words.map((word) => word.text).join(" ");
      const text = [
        arabic,
        translation ? stripHtml(translation) : "",
        `Quran ${verse.key}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      void copyText(text, "Verse copied");
    },
    [copyText],
  );

  const shareVerse = useCallback(
    async (verse: ReaderVerse) => {
      const url = new URL(`${window.location.origin}/mushaf`);
      url.searchParams.set("page", String(pageNumber));
      url.hash = `verse-${verse.key.replace(":", "-")}`;

      if (navigator.share) {
        try {
          await navigator.share({ title: `Quran ${verse.key}`, url: url.toString() });
          return;
        } catch {
          return;
        }
      }

      await copyText(url.toString(), "Verse link copied");
    },
    [copyText, pageNumber],
  );

  const noteVerse = useCallback(
    (verse: ReaderVerse) => {
      toast({
        title: "Verse notes are coming soon",
        description: `Notes for ${verse.key} will live with Reflections.`,
        variant: "info",
      });
    },
    [toast],
  );

  const toggleSettings = useCallback(() => {
    if (!settingsOpen && !recitations) {
      setRecitationsError("");
      setRecitationsLoading(true);
    }
    setSettingsOpen((open) => !open);
  }, [recitations, settingsOpen]);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_READER_SETTINGS });
  }, []);

  const readerStyle = useMemo(
    () =>
      ({
        "--verse-arabic-size": arabicSizeCss(settings.arabicSize),
      }) as CSSProperties,
    [settings.arabicSize],
  );

  const comingSoon = useCallback(
    (label: string) => {
      toast({
        title: `${label} is coming soon`,
        description: "This part of the reader is being built in a later phase.",
        variant: "info",
      });
    },
    [toast],
  );

  return (
    <div className="min-h-screen bg-bg-primary" style={readerStyle}>
      <ReaderHeader
        catalog={catalog}
        chapter={chapter}
        page={readerPage ?? undefined}
        progress={progress}
        bookmarked={
          firstBookmark ? bookmarkIds.has(firstBookmark.key) : false
        }
        canBookmark={Boolean(firstBookmark)}
        onSelectChapter={selectChapter}
        onSelectJuz={selectJuz}
        onSelectPage={goToPage}
        onToggleBookmark={() => {
          if (firstVerse) void toggleBookmark(firstVerse);
        }}
        mode={readerMode}
        onModeChange={setReaderMode}
        settingsOpen={settingsOpen}
        onSettings={toggleSettings}
      />

      {catalogError ? (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-4xl rounded-xl border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger"
        >
          {catalogError}
        </p>
      ) : null}

      {pageLoading && !readerPage && activeReadingPages.length === 0 ? (
        <ReaderSkeleton />
      ) : null}

      {pageError ? (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6">
          <p className="text-sm text-text-secondary">{pageError}</p>
          <button
            type="button"
            onClick={() => {
              setPageLoading(true);
              setPageError("");
              setRequestVersion((value) => value + 1);
            }}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/50 hover:text-text-primary"
          >
            <RotateCw className="size-3.5" />
            Try again
          </button>
        </div>
      ) : null}

      {(readerPage || activeReadingPages.length > 0) && !pageError ? (
        <div
          className={`mx-auto w-full max-w-4xl px-4 pt-5 md:px-6 ${
            playerOpen ? "pb-48 md:pb-40" : "pb-16"
          }`}
        >
          {readerMode === "reading" ? (
            <div ref={readingRootRef} className="space-y-6">
              {activeReadingPages[0] &&
              showsBismillah(activeReadingPages[0].verses) ? (
                <BismillahHeader />
              ) : null}

              <p className="text-center text-[11px] text-text-muted">
                Tap an ayah number to play it.
              </p>

              {readingPagesLoading ? (
                <p className="text-center text-xs text-text-muted">
                  Loading surah pages…
                </p>
              ) : null}

              {readingPageError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-danger/30 bg-danger-muted px-4 py-3 text-center text-sm text-danger"
                >
                  {readingPageError}
                </p>
              ) : null}

              {activeReadingPages.map((page, index) => (
                <section
                  key={page.page.pageNumber}
                  id={`page-${page.page.pageNumber}`}
                  className={`scroll-mt-36 ${
                    index > 0 ? "border-t border-border pt-6" : ""
                  }`}
                >
                  <ReadingPage
                    page={page}
                    playingVerseKey={playingVerseKey}
                    highlightRange={activeRange}
                    onPlayVerse={playVerse}
                    preloadFont={
                      index === 0 ||
                      page.page.pageNumber === readingFontPreloadPage
                    }
                  />
                  <p className="mt-3 text-center text-[10px] font-semibold tracking-[0.12em] text-text-muted uppercase">
                    Page {page.page.pageNumber}
                  </p>
                </section>
              ))}
            </div>
          ) : readerPage ? (
            <>
              {showsBismillah(readerPage.verses) ? <BismillahHeader /> : null}

              <div className="rounded-2xl border border-border bg-bg-elevated shadow-rest">
                {readerPage.verses.map((verse) => (
                  <VerseRow
                    key={verse.id}
                    verse={verse}
                    bookmarked={bookmarkIds.has(verse.key)}
                    isPlaying={playingVerseKey === verse.key}
                    highlightRange={
                      playingVerseKey === verse.key ? activeRange : null
                    }
                    showTranslation={settings.showTranslation}
                    showWordTooltips={settings.showWordTooltips}
                    onPlay={(row) => playVerse(row.key)}
                    onToggleBookmark={(row) => void toggleBookmark(row)}
                    onCopy={copyVerse}
                    onShare={(row) => void shareVerse(row)}
                    onNote={noteVerse}
                    onSoon={comingSoon}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <PageNavButton
                  direction="previous"
                  disabled={pageNumber <= 1}
                  onClick={() => goToPage(pageNumber - 1)}
                />
                <span className="text-[11px] font-semibold tracking-[0.08em] text-text-muted">
                  Page {pageNumber} of {maxPage}
                </span>
                <PageNavButton
                  direction="next"
                  disabled={pageNumber >= maxPage}
                  onClick={() => goToPage(pageNumber + 1)}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <ReaderSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
        onReset={resetSettings}
        recitations={recitations}
        recitationsLoading={recitationsLoading}
        recitationsError={recitationsError}
        onRetryRecitations={() => {
          setRecitations(null);
          setRecitationsError("");
          setRecitationsLoading(true);
          setRecitationsVersion((version) => version + 1);
        }}
      />

      {playerOpen && playingVerseKey ? (
        <AudioPlayer
          verseKey={playingVerseKey}
          isPlaying={isPlaying}
          currentTime={playerCurrentTime}
          duration={playerDuration}
          muted={muted}
          rate={playbackRate}
          repeatVerse={repeatVerse}
          autoplayNext={autoplayNext}
          canPrevious={canPrevious}
          canNext={canNext}
          onTogglePlay={togglePlayback}
          onSeek={seekAudio}
          onPrevious={playPrevious}
          onNext={playNext}
          onClose={stopPlayback}
          onToggleMute={toggleMute}
          onRateChange={changeRate}
          onToggleRepeat={() => setRepeatVerse((value) => !value)}
          onToggleAutoplay={() => setAutoplayNext((value) => !value)}
        />
      ) : null}

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) =>
          setDuration(
            Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : 0,
          )
        }
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={handleAudioError}
      />
    </div>
  );
}

export function MushafPage() {
  return <MushafView />;
}
