"use client";

import {
  faBookOpen,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faMicrophone,
  faPen,
  faPhone,
  faPlus,
  faVideo,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";

type ReviewItem = {
  id: number;
  passage: string;
  note: string;
  status: "new" | "review" | "done";
};

type HifdhLiveRoomProps = {
  isEnrolled: boolean;
  progress: number | null;
};

const ayahLines = [
  { ref: "78:1", text: "عَمَّ يَتَسَاءَلُونَ" },
  { ref: "78:2", text: "عَنِ النَّبَإِ الْعَظِيمِ" },
  { ref: "78:3", text: "الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ" },
  { ref: "78:4", text: "كَلَّا سَيَعْلَمُونَ" },
  { ref: "78:5", text: "ثُمَّ كَلَّا سَيَعْلَمُونَ" },
];

const initialReviewItems: ReviewItem[] = [
  {
    id: 1,
    passage: "An-Naba 1-5",
    note: "Hold ghunnah evenly in verses 1 and 2.",
    status: "review",
  },
  {
    id: 2,
    passage: "An-Naba 6-10",
    note: "Separate similar endings before moving forward.",
    status: "new",
  },
  {
    id: 3,
    passage: "Yesterday's revision",
    note: "Recite once without looking before next session.",
    status: "done",
  },
];

export default function HifdhLiveRoom({ isEnrolled, progress }: HifdhLiveRoomProps) {
  const [reviewItems, setReviewItems] = useState(initialReviewItems);
  const [passage, setPassage] = useState("");
  const [note, setNote] = useState("");

  const activeItems = useMemo(
    () => reviewItems.filter((item) => item.status !== "done").length,
    [reviewItems],
  );

  function addReviewItem() {
    const cleanPassage = passage.trim();
    const cleanNote = note.trim();
    if (!cleanPassage || !cleanNote) return;

    setReviewItems((items) => [
      {
        id: Date.now(),
        passage: cleanPassage,
        note: cleanNote,
        status: "new",
      },
      ...items,
    ]);
    setPassage("");
    setNote("");
  }

  function cycleStatus(id: number) {
    setReviewItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "new") return { ...item, status: "review" };
        if (item.status === "review") return { ...item, status: "done" };
        return { ...item, status: "new" };
      }),
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-text-secondary">Live Hifdh Room</p>
          <h2 className="text-2xl font-bold">One-on-one recitation session</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span className="rounded-full bg-success-muted px-3 py-1 text-success">Teacher connected</span>
          <span className="rounded-full bg-primary-subtle px-3 py-1 text-primary">{progress ?? 0}% memorized</span>
          <span className="rounded-full bg-bg-card border border-border px-3 py-1">{activeItems} follow-ups</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="min-h-[640px] rounded-lg border border-border bg-bg-card overflow-hidden flex flex-col">
          <div className="grid flex-1 grid-rows-[minmax(360px,1fr)_170px] bg-bg-secondary">
            <div className="relative flex items-center justify-center overflow-hidden bg-[#101918] text-text-inverse">
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-sm">
                <span className="size-2 rounded-full bg-success" />
                Aisha reciting
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-sm">
                Surah An-Naba: 1-10
              </div>
              <div className="flex size-36 items-center justify-center rounded-full bg-primary text-5xl font-bold text-text-inverse shadow-2xl">
                AM
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-lg bg-black/35 px-4 py-3 backdrop-blur">
                <div>
                  <p className="font-semibold">Student audio</p>
                  <p className="text-sm text-white/70">Listening for retention, tajweed, and pace</p>
                </div>
                <div className="flex h-8 items-end gap-1">
                  {[18, 30, 22, 36, 26, 42, 28].map((height, index) => (
                    <span
                      key={index}
                      className="w-1.5 rounded-full bg-success"
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-bg-card p-4 md:grid-cols-[220px_1fr]">
              <div className="relative overflow-hidden rounded-lg bg-[#182624] text-text-inverse">
                <div className="absolute left-3 top-3 rounded-full bg-black/35 px-2 py-1 text-xs">Teacher</div>
                <div className="flex h-full items-center justify-center text-3xl font-bold">UI</div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-border bg-bg-primary p-4">
                <div>
                  <p className="text-sm uppercase tracking-wider text-text-secondary">Session Focus</p>
                  <h3 className="font-bold">New memorization plus yesterday&apos;s revision</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded bg-bg-card p-3">
                    <p className="text-text-secondary">Target</p>
                    <p className="font-semibold">10 ayat</p>
                  </div>
                  <div className="rounded bg-bg-card p-3">
                    <p className="text-text-secondary">Revision</p>
                    <p className="font-semibold">Juz Amma</p>
                  </div>
                  <div className="rounded bg-bg-card p-3">
                    <p className="text-text-secondary">Next</p>
                    <p className="font-semibold">78:11-16</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg-card p-4">
            <div className="flex items-center gap-2">
              <button className="flex size-11 items-center justify-center rounded-full bg-bg-primary border border-border text-text-primary">
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
              <button className="flex size-11 items-center justify-center rounded-full bg-bg-primary border border-border text-text-primary">
                <FontAwesomeIcon icon={faVideo} />
              </button>
              <button className="flex size-11 items-center justify-center rounded-full bg-bg-primary border border-border text-text-primary">
                <FontAwesomeIcon icon={faVolumeHigh} />
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-danger px-5 py-3 font-semibold text-text-inverse">
              <FontAwesomeIcon icon={faPhone} />
              Leave session
            </button>
          </div>
        </div>

        <aside className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary">Teacher Mushaf</p>
                <h3 className="font-bold">Follow recitation</h3>
              </div>
              <div className="flex items-center gap-1">
                <button className="flex size-8 items-center justify-center rounded border border-border bg-bg-primary">
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <button className="flex size-8 items-center justify-center rounded border border-border bg-bg-primary">
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <select className="rounded border border-border bg-bg-primary px-3 py-2 outline-none">
                <option>Surah An-Naba</option>
                <option>Surah Al-Mulk</option>
                <option>Surah Al-Qalam</option>
              </select>
              <select className="rounded border border-border bg-bg-primary px-3 py-2 outline-none">
                <option>Ayat 1-10</option>
                <option>Ayat 11-20</option>
                <option>Ayat 21-30</option>
              </select>
            </div>
            <div className="rounded-lg border border-border bg-bg-primary p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
                <FontAwesomeIcon icon={faBookOpen} />
                Hafs tracking view
              </div>
              <div className="space-y-4 text-right font-serif text-2xl leading-loose" dir="rtl">
                {ayahLines.map((ayah, index) => (
                  <p
                    key={ayah.ref}
                    className={`rounded px-3 py-1 ${index === 1 ? "bg-primary-subtle text-primary" : ""}`}
                  >
                    {ayah.text}
                    <span className="mr-3 align-middle text-xs text-text-secondary">{ayah.ref}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary">Follow-up List</p>
                <h3 className="font-bold">Teacher notes</h3>
              </div>
              <span className="rounded-full bg-primary-subtle px-3 py-1 text-sm text-primary">Next session</span>
            </div>

            <div className="mb-4 grid gap-2">
              <input
                value={passage}
                onChange={(event) => setPassage(event.target.value)}
                placeholder="Passage"
                className="rounded border border-border bg-bg-primary px-3 py-2 outline-none focus:border-primary"
                disabled={!isEnrolled}
              />
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Area to review"
                className="min-h-20 rounded border border-border bg-bg-primary px-3 py-2 outline-none focus:border-primary"
                disabled={!isEnrolled}
              />
              <button
                onClick={addReviewItem}
                disabled={!isEnrolled || !passage.trim() || !note.trim()}
                className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 font-semibold text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add follow-up
              </button>
            </div>

            <div className="space-y-3">
              {reviewItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => cycleStatus(item.id)}
                  className="w-full rounded-lg border border-border bg-bg-primary p-3 text-left transition hover:border-primary/50"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.passage}</p>
                      <p className="text-sm text-text-secondary">{item.note}</p>
                    </div>
                    <span
                      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        item.status === "done"
                          ? "bg-success text-text-inverse"
                          : item.status === "review"
                            ? "bg-warning-muted text-warning"
                            : "bg-primary-subtle text-primary"
                      }`}
                    >
                      <FontAwesomeIcon icon={item.status === "done" ? faCheck : item.status === "review" ? faPen : faCircle} />
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-text-tertiary">
                    {item.status === "done" ? "Completed" : item.status === "review" ? "Review again" : "New"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
