"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  Music,
  ChevronDown,
  Check,
  Bookmark,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

type MushafMode = "standalone" | "revision" | "session";

interface WordResultData {
  position: number;
  status: string;
  description?: string;
}

interface VerseCompleteData {
  accuracy: number;
}

interface SessionSummaryData {
  accuracy: number;
  surahNumber: number;
  fromVerse: number;
  toVerse: number;
  errors?: { description?: string }[] | string[];
  duration: number;
}

type AiMessage =
  | { type: "word_result"; data: WordResultData }
  | { type: "verse_complete"; data: VerseCompleteData }
  | { type: "session_summary"; data: SessionSummaryData };

interface MushafProps {
  mode: MushafMode;
  surahNumber?: number;
  verseNumber?: number;
  studentNotes?: string[];
  activeVerse?: string;
  onVerseSelect?: (verseKey: string) => void;
  onSessionEnd?: (data: SessionSummaryData) => Promise<void> | void;
  aiMessages?: AiMessage[];
}

interface SelectOption {
  label: string;
  value: number;
}

function CustomSelect({
  options,
  value,
  onChange,
  label,
}: {
  options: SelectOption[];
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-text-secondary mb-1">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl border border-border bg-bg-secondary text-text-primary hover:bg-bg-hover transition-colors"
      >
        <span className="truncate">{selected?.label || "Select..."}</span>
        <ChevronDown
          size={14}
          className={`transition-transform shrink-0 ml-1 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-lg animate-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-bg-hover ${
                opt.value === value
                  ? "bg-primary-muted text-primary font-medium"
                  : "text-text-primary"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  opt.value === value
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              >
                {opt.value === value && (
                  <Check size={10} className="text-text-inverse" />
                )}
              </span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Mushaf({
  mode = "standalone",
  surahNumber: initialSurah = 1,
  verseNumber: initialVerse = 1,
  studentNotes = [],
  activeVerse,
  onVerseSelect,
  onSessionEnd,
  aiMessages = [],
}: MushafProps) {
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [selectedVerse, setSelectedVerse] = useState(initialVerse);
  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedRecitationIdx, setSelectedRecitationIdx] = useState<number>(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [wordFeedback, setWordFeedback] = useState<Map<number, WordResultData>>(
    new Map(),
  );
  const [showControls, setShowControls] = useState(true);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Set<string>>(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => {
        if (data?.bookmarks) {
          setBookmarkedVerses(
            new Set(data.bookmarks.map((b: { surah: number; ayah: number }) => `${b.surah}:${b.ayah}`)),
          );
        }
      })
      .catch(() => {});
  }, []);

  async function toggleBookmark(surah: number, ayah: number) {
    const key = `${surah}:${ayah}`;
    setBookmarkLoading((prev) => new Set(prev).add(key));
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surah, ayah }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedVerses((prev) => {
          const next = new Set(prev);
          if (data.bookmarked) next.add(key);
          else next.delete(key);
          return next;
        });
      }
    } catch {
    } finally {
      setBookmarkLoading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { data: chaptersData } = useSWR(
    "https://api.quran.com/api/v4/chapters",
    fetcher,
  );

  const { data: versesData, error: versesError } = useSWR(
    selectedSurah
      ? `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah}`
      : null,
    fetcher,
  );

  const { data: editionsData } = useSWR(
    "https://api.alquran.cloud/v1/edition?format=audio&language=ar",
    fetcher,
  );

  type Edition = { identifier: string; englishName: string };

  const editions: Edition[] = useMemo(
    () =>
      (editionsData?.data || []).filter(
        (e: Edition) => !e.identifier.endsWith("-2"),
      ),
    [editionsData],
  );

  const effectiveRecitationIdx = useMemo(() => {
    if (editions.length > 0 && selectedRecitationIdx === 0) {
      const idx = editions.findIndex(
        (e: Edition) => e.identifier === "ar.minshawi",
      );
      return idx >= 0 ? idx : 0;
    }
    return selectedRecitationIdx;
  }, [editions, selectedRecitationIdx]);

  const reciterOptions: SelectOption[] = useMemo(
    () =>
      editions.map((e: Edition, i: number) => ({
        label: e.englishName,
        value: i,
      })),
    [editions],
  );

  const reciterIdentifier =
    editions[effectiveRecitationIdx]?.identifier || "ar.minshawi";
  const audioUrl = selectedSurah
    ? `https://api.alquran.cloud/v1/surah/${selectedSurah}/${reciterIdentifier}`
    : null;

  const { data: audioData } = useSWR(audioUrl, fetcher);

  const audioFiles = useMemo(() => {
    if (audioData?.data?.ayahs) {
      const fileMap = new Map<string, string>();
      audioData.data.ayahs.forEach(
        (ayah: { numberInSurah: number; audio: string }) => {
          const verseKey = `${selectedSurah}:${ayah.numberInSurah}`;
          if (ayah.audio) {
            fileMap.set(
              verseKey,
              `/api/quran/audio?url=${encodeURIComponent(ayah.audio)}`,
            );
          }
        },
      );
      return fileMap;
    }
    return new Map<string, string>();
  }, [audioData, selectedSurah]);

  const chapters = useMemo(() => chaptersData?.chapters || [], [chaptersData]);
  const verses = versesData?.verses || [];

  const currentSurah = chapters.find((c: Chapter) => c.id === selectedSurah);
  const currentSurahName = currentSurah?.name_arabic || "";
  const currentSurahNameLatin = currentSurah?.name_simple || "";

  useEffect(() => {
    if (mode === "standalone" && selectedSurah && selectedVerse) {
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/quran/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              surahNumber: selectedSurah,
              verseNumber: selectedVerse,
            }),
          });
        } catch {}
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedSurah, selectedVerse, mode]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsMicActive(false);
  }, []);

  const handleAiFeedback = useCallback(
    (message: AiMessage) => {
      if (message.type === "word_result") {
        const { position, status, description } = message.data;
        setWordFeedback((prev) =>
          new Map(prev).set(position, { position, status, description }),
        );
      } else if (message.type === "verse_complete") {
        //
      } else if (message.type === "session_summary") {
        if (onSessionEnd) onSessionEnd(message.data);
        stopRecording();
      }
    },
    [onSessionEnd, stopRecording],
  );

  useEffect(() => {
    if (mode !== "revision" || !isMicActive) return;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        let wsUrl = process.env.NEXT_PUBLIC_RECITATION_WS_URL;
        if (!wsUrl) {
          console.error("Recitation engine unavailable: NEXT_PUBLIC_RECITATION_WS_URL not set");
          setIsMicActive(false);
          return;
        }
        if (!wsUrl.endsWith("/ws/recitation")) {
          wsUrl = wsUrl.replace(/\/+$/, "") + "/ws/recitation";
        }

        const ws = new WebSocket(wsUrl);
        websocketRef.current = ws;
        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: "init",
              surah: selectedSurah,
              verse: selectedVerse,
              focusAreas: studentNotes,
            }),
          );
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) ws.send(event.data);
          };
          mediaRecorder.start(100);
        };
        ws.onmessage = (event) => {
          try {
            handleAiFeedback(JSON.parse(event.data));
          } catch {}
        };
        ws.onerror = () => {
          console.error("Recitation engine WebSocket connection failed");
          setIsMicActive(false);
        };
      } catch {
        setIsMicActive(false);
      }
    };

    startRecording();

    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        websocketRef.current.close();
      }
    };
  }, [
    isMicActive,
    selectedSurah,
    selectedVerse,
    studentNotes,
    mode,
    handleAiFeedback,
  ]);

  const getAudioUrl = useCallback(
    (verse: number) => {
      const verseKey = `${selectedSurah}:${verse}`;
      return audioFiles.get(verseKey) || "";
    },
    [audioFiles, selectedSurah],
  );

  const handlePlayVerse = useCallback(
    async (verse: number) => {
      const url = getAudioUrl(verse);
      if (!url || !audioRef.current) return;

      setCurrentVerse(verse);
      setIsLoading(true);

      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackSpeed;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [playbackSpeed, getAudioUrl],
  );

  const handleNextVerse = useCallback(() => {
    if (currentVerse < verses.length) {
      handlePlayVerse(currentVerse + 1);
    }
  }, [currentVerse, verses.length, handlePlayVerse]);

  const handlePrevVerse = useCallback(() => {
    if (currentVerse > 1) {
      handlePlayVerse(currentVerse - 1);
    }
  }, [currentVerse, handlePlayVerse]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      handlePlayVerse(currentVerse);
    }
  }, [isPlaying, currentVerse, handlePlayVerse]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (mode === "standalone") {
        handleNextVerse();
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, [handleNextVerse, mode]);

  useEffect(() => {
    if (currentVerse && mode === "standalone") {
      const el = verseRefs.current.get(currentVerse);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentVerse, mode]);

  const setVerseRef = useCallback(
    (verse: number, el: HTMLDivElement | null) => {
      if (el) {
        verseRefs.current.set(verse, el);
      } else {
        verseRefs.current.delete(verse);
      }
    },
    [],
  );

  const surahNames = useMemo(() => {
    return chapters.map((ch: Chapter) => ({
      value: ch.id,
      label: `${ch.name_simple} - ${ch.name_arabic}`,
    }));
  }, [chapters]);

  const renderVerseWithFeedback = (verse: Verse) => {
    const words = verse.text_uthmani.split(/\s+/);
    return (
      <div dir="rtl" className="flex flex-wrap gap-1.5">
        {words.map((word, index) => {
          const fb = wordFeedback.get(index);
          let cls =
            "px-2 py-0.5 rounded-lg transition-colors border border-border";
          if (fb?.status === "correct")
            cls += " bg-success-muted text-success border-success/30";
          if (fb?.status === "error")
            cls += " bg-danger-muted text-danger border-danger/30";
          return (
            <span key={index} className={cls}>
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  const renderVerse = (verse: Verse) => {
    const verseNum = parseInt(verse.verse_key.split(":")[1]);
    const isActive =
      mode === "session"
        ? verse.verse_key === activeVerse
        : verseNum === currentVerse;

    return (
      <div
        key={verse.id}
        ref={(el) => setVerseRef(verseNum, el)}
        onClick={() => {
          if (mode === "session" && onVerseSelect) {
            onVerseSelect(verse.verse_key);
          } else if (mode === "standalone") {
            setSelectedVerse(verseNum);
            handlePlayVerse(verseNum);
          }
        }}
        className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
          isActive
            ? "border-primary bg-primary-muted shadow-md scale-[1.01]"
            : "border-transparent bg-transparent hover:bg-bg-hover hover:border-border"
        }`}
        dir="rtl"
      >
        <div className="flex justify-between items-start mb-3">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
              isActive
                ? "bg-primary text-text-inverse"
                : "bg-bg-secondary text-text-tertiary"
            }`}
          >
            {verseNum}
          </span>
          {mode === "standalone" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(selectedSurah, verseNum);
                }}
                className={`p-2 rounded-full transition-all duration-200 ${
                  bookmarkedVerses.has(`${selectedSurah}:${verseNum}`)
                    ? "text-amber-500 opacity-100"
                    : "opacity-0 group-hover:opacity-100 text-text-secondary hover:text-amber-500"
                }`}
              >
                {bookmarkLoading.has(`${selectedSurah}:${verseNum}`) ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Bookmark
                    size={14}
                    fill={
                      bookmarkedVerses.has(`${selectedSurah}:${verseNum}`)
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayVerse(verseNum);
                }}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isActive && isPlaying
                    ? "bg-primary text-text-inverse"
                    : "opacity-0 group-hover:opacity-100 bg-bg-secondary text-text-secondary hover:bg-primary hover:text-text-inverse"
                }`}
              >
                {isActive && isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isActive && isPlaying ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
              </button>
            </>
          )}
        </div>
        <p
          className="text-3xl leading-[2.5] font-serif tracking-wide"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
        >
          {mode === "revision" && isMicActive && verseNum === currentVerse
            ? renderVerseWithFeedback(verse)
            : verse.text_uthmani}
        </p>
      </div>
    );
  };

  if (mode === "standalone") {
    return (
      <>
        <div className="w-full max-w-2xl mx-auto px-4 pb-32 space-y-4">
          <div className="rounded-2xl border border-border p-4 space-y-4 sticky top-0 z-10 backdrop-blur-sm bg-bg-elevated/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music size={20} className="text-primary" />
                <h1 className="text-lg font-bold text-text-primary">
                  Al-Mushaf
                </h1>
              </div>
              <button
                onClick={() => setShowControls(!showControls)}
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <ChevronDown
                  size={20}
                  className={`transition-transform ${showControls ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showControls && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-3">
                  <CustomSelect
                    label="Surah"
                    options={surahNames}
                    value={selectedSurah}
                    onChange={(surahId) => {
                      setSelectedSurah(surahId);
                      setSelectedVerse(1);
                      setCurrentVerse(1);
                    }}
                  />

                  <CustomSelect
                    label="Reciter"
                    options={reciterOptions}
                    value={selectedRecitationIdx}
                    onChange={setSelectedRecitationIdx}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Speed
                  </label>
                  <div className="flex gap-1.5">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`flex-1 px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                          playbackSpeed === speed
                            ? "bg-primary text-text-inverse shadow-sm"
                            : "bg-bg-secondary text-text-secondary border border-border hover:bg-bg-hover"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-text-secondary whitespace-nowrap">
                    Go to verse:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={verses.length}
                    value={selectedVerse}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (v >= 1 && v <= verses.length) {
                        setSelectedVerse(v);
                        setCurrentVerse(v);
                      }
                    }}
                    className="w-20 px-3 py-1.5 text-sm rounded-xl border border-border bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-xs text-text-tertiary">
                    / {verses.length}
                  </span>
                </div>
              </div>
            )}
          </div>

          {versesError ? (
            <div className="text-center py-16">
              <p className="text-danger mb-2">Failed to load verses</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : verses.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-bg-secondary rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {verses.map((verse: Verse) => renderVerse(verse))}
            </div>
          )}
        </div>

        {/* Sticky bottom player */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-bg-elevated/95 backdrop-blur-md border-t border-border">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary min-w-0">
                <span className="truncate max-w-30">
                  {currentSurahNameLatin || currentSurahName}
                </span>
                <span className="shrink-0">·</span>
                <span className="shrink-0 font-semibold text-text-primary">
                  {currentVerse}:{verses.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevVerse}
                  disabled={currentVerse <= 1}
                  className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <SkipBack size={18} />
                </button>

                <button
                  onClick={togglePlayPause}
                  disabled={!audioFiles.size}
                  className="p-3 rounded-full bg-primary text-text-inverse hover:opacity-90 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextVerse}
                  disabled={currentVerse >= verses.length}
                  className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <SkipForward size={18} />
                </button>
              </div>

              <div className="w-20 flex justify-end">
                {audioFiles.size === 0 && !versesError && verses.length > 0 && (
                  <span className="text-[10px] text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
                    Loading audio...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <audio ref={audioRef} preload="none" />
      </>
    );
  }

  if (mode === "revision") {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">
            Revision: {currentSurahName}
          </h2>
          <button
            onClick={() => setIsMicActive(!isMicActive)}
            className={`flex gap-2 items-center px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              isMicActive
                ? "bg-danger text-text-inverse"
                : "bg-secondary text-text-inverse"
            }`}
          >
            {isMicActive ? "Stop Recording" : "Start Recording"}
          </button>
        </div>

        <div className="space-y-2">
          {verses.map((verse: Verse) => renderVerse(verse))}
        </div>

        {(isMicActive || aiMessages.length > 0) && (
          <div className="bg-secondary-muted border border-secondary rounded-2xl p-4">
            <h3 className="font-semibold text-secondary mb-3">Live Feedback</h3>
            <div className="space-y-2">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="text-sm text-text-primary bg-bg-elevated p-3 rounded-xl border border-border"
                >
                  {msg.type === "word_result" && (
                    <span>
                      Word {msg.data.position}: {msg.data.status}
                      {msg.data.description && ` - ${msg.data.description}`}
                    </span>
                  )}
                  {msg.type === "verse_complete" && (
                    <span>Verse complete - Accuracy: {msg.data.accuracy}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-bg-elevated rounded-2xl p-4 border border-border">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-text-primary">
            {currentSurahName} : {selectedVerse}
          </h3>
          {mode === "session" && onVerseSelect && (
            <span className="text-xs text-text-muted">
              Click to select verse
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {verses.map((verse: Verse) => renderVerse(verse))}
        </div>
      </div>

      {aiMessages.length > 0 && (
        <div className="space-y-2">
          {aiMessages.map((msg, idx) => (
            <div
              key={idx}
              className="bg-bg-secondary rounded-xl p-3 text-sm border border-border"
            >
              {msg.type === "word_result" && (
                <span
                  className={
                    msg.data.status === "correct"
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {msg.data.status}: {msg.data.description}
                </span>
              )}
              {msg.type === "verse_complete" && (
                <span className="text-secondary">
                  Accuracy: {msg.data.accuracy}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
