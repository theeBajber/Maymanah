"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState, PortalHeader } from "@/app/ui/portal";

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

interface Reciter {
  identifier: string;
  name: string;
}

// Only reciters whose verse-by-verse audio is available on the CDN the proxy
// accepts. Asking the editions endpoint returns hundreds of entries, including
// surah-level and translated recordings that have no audio for a single verse,
// which is why the list is fixed rather than fetched.
const RECITERS: Reciter[] = [
  { identifier: "ar.alafasy", name: "Mishary Alafasy" },
  { identifier: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { identifier: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais" },
  { identifier: "ar.shaatree", name: "Abu Bakr Ash-Shaatree" },
  { identifier: "ar.ahmedajamy", name: "Ahmed Al-Ajamy" },
  { identifier: "ar.hanirifai", name: "Hani Ar-Rifai" },
  { identifier: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  { identifier: "ar.husarymujawwad", name: "Mahmoud Khalil Al-Husary (Mujawwad)" },
  { identifier: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  { identifier: "ar.mahermuaiqly", name: "Maher Al-Muaiqly" },
  { identifier: "ar.minshawi", name: "Muhammad Siddiq Al-Minshawi" },
  { identifier: "ar.minshawimujawwad", name: "Muhammad Siddiq Al-Minshawi (Mujawwad)" },
  { identifier: "ar.muhammadayyoub", name: "Muhammad Ayyoub" },
  { identifier: "ar.muhammadjibreel", name: "Muhammad Jibreel" },
  { identifier: "ar.saoodshuraym", name: "Saud Ash-Shuraym" },
];

interface AyahAudio {
  numberInSurah: number;
  audio: string;
}

const DEFAULT_RECITER = "ar.minshawi";

/**
 * Reads the Quran with recitation audio.
 *
 * Text comes from the Quran.com API and audio from the AlQuran Cloud API, both
 * keyless public endpoints fetched at read time — nothing is bundled and
 * nothing is stored. Audio passes through our proxy rather than direct, so
 * the reader's address is not exposed to a third party on every verse.
 *
 * The furthest verse read is reported back, so progress survives a reload.
 */
export function MushafView() {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [surah, setSurah] = useState(1);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [reciter, setReciter] = useState(DEFAULT_RECITER);
  const [audioByVerse, setAudioByVerse] = useState<Map<number, string>>(new Map());
  const [playing, setPlaying] = useState<number | null>(null);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressSent = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.quran.com/api/v4/chapters")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { chapters?: Chapter[] };
        if (!cancelled) setChapters(body.chapters ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("The chapter list could not be loaded. Check your connection.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function selectSurah(id: number) {
    setVerses(null);
    setAudioByVerse(new Map());
    setPlaying(null);
    progressSent.current = new Set();
    setSurah(id);
  }

  function selectReciter(identifier: string) {
    setAudioByVerse(new Map());
    setPlaying(null);
    setReciter(identifier);
  }

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surah}`)
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { verses?: Verse[] };
        if (!cancelled) setVerses(body.verses ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Those verses could not be loaded. Check your connection.");
      });

    fetch(`https://api.alquran.cloud/v1/surah/${surah}/${reciter}`)
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as { data?: { ayahs?: AyahAudio[] } };
        if (cancelled) return;
        const map = new Map<number, string>();
        for (const ayah of body.data?.ayahs ?? []) {
          map.set(ayah.numberInSurah, `/api/quran/audio?url=${encodeURIComponent(ayah.audio)}`);
        }
        setAudioByVerse(map);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [surah, reciter]);

  const reportProgress = useCallback(
    (verseNumber: number) => {
      if (progressSent.current.has(verseNumber)) return;
      progressSent.current.add(verseNumber);
      fetch("/api/quran/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ surah, verse: verseNumber }),
      }).catch(() => {});
    },
    [surah],
  );

  function play(verseNumber: number) {
    const url = audioByVerse.get(verseNumber);
    if (!url) return;

    const element = audioRef.current;
    if (!element) return;

    if (playing === verseNumber) {
      element.pause();
      setPlaying(null);
      return;
    }

    element.src = url;
    void element.play().catch(() => {});
    setPlaying(verseNumber);
    reportProgress(verseNumber);
  }

  const chapter = chapters?.find((row) => row.id === surah);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <PortalHeader
        title={chapter ? chapter.name_simple : "Mushaf"}
        subtitle={chapter ? `${chapter.verses_count} verses` : "Read with recitation audio"}
      />

      {error ? (
        <p role="alert" className="rounded-[10px] border border-night-danger/40 bg-night-danger/10 px-4 py-3 text-sm text-night-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Chapter
          <select
            value={surah}
            onChange={(event) => selectSurah(Number(event.target.value))}
            className="h-10 rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-3 text-sm text-ivory focus:border-brass/60 focus:outline-none"
          >
            {(chapters ?? []).map((row) => (
              <option key={row.id} value={row.id} className="bg-bg-elevated">
                {row.id}. {row.name_simple}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Reciter
          <select
            value={reciter}
            onChange={(event) => selectReciter(event.target.value)}
            className="h-10 max-w-56 rounded-[10px] border border-ivory/10 bg-ivory/[0.04] px-3 text-sm text-ivory focus:border-brass/60 focus:outline-none"
          >
            {RECITERS.map((row) => (
              <option key={row.identifier} value={row.identifier} className="bg-bg-elevated">
                {row.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {verses === null ? (
        <EmptyState title="Loading verses…" />
      ) : verses.length === 0 ? (
        <EmptyState title="No verses found for that chapter." />
      ) : (
        <ol className="flex flex-col gap-2 rounded-2xl border border-border bg-bg-elevated p-4 md:p-6">
          {verses.map((verse, index) => (
            <li
              key={verse.id}
              className="flex items-start justify-between gap-4 border-b border-border/50 px-2 py-3 last:border-0"
            >
              <p lang="ar" dir="rtl" className="font-naskh flex-1 text-right text-2xl leading-loose text-ivory">
                {verse.text_uthmani}{" "}
                <span className="text-brass">﴿{index + 1}﴾</span>
              </p>
              <button
                onClick={() => play(index + 1)}
                disabled={!audioByVerse.has(index + 1)}
                aria-label={playing === index + 1 ? `Pause verse ${index + 1}` : `Play verse ${index + 1}`}
                className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                {playing === index + 1 ? "❚❚" : "▶"}
              </button>
            </li>
          ))}
        </ol>
      )}

      <audio ref={audioRef} preload="none" onEnded={() => setPlaying(null)} className="hidden" />
    </div>
  );
}

export function MushafPage() {
  return <MushafView />;
}
