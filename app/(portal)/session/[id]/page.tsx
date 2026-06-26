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
  faSpinner,
  faVideo,
  faVolumeHigh,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useCallback } from "react";
import { VideoRoom } from "@/components/ui/VideoRoom";

type ReviewItem = {
  id: number;
  passage: string;
  note: string;
  status: "new" | "review" | "done";
};

interface JoinData {
  token: string;
  roomName: string;
  liveKitUrl: string;
  appointment: {
    id: string;
    title: string | null;
    startTime: string;
    status: string;
    isTeacher: boolean;
  };
}

const ayahLines = [
  { ref: "78:1", text: "عَمَّ يَتَسَاءَلُونَ" },
  { ref: "78:2", text: "عَنِ النَّبَإِ الْعَظِيمِ" },
  { ref: "78:3", text: "الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ" },
  { ref: "78:4", text: "كَلَّا سَيَعْلَمُونَ" },
  { ref: "78:5", text: "ثُمَّ كَلَّا سَيَعْلَمُونَ" },
];

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const { status: authStatus } = useSession();
  const [joinData, setJoinData] = useState<JoinData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [permError, setPermError] = useState("");

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([
    { id: 1, passage: "An-Naba 1-5", note: "Hold ghunnah evenly in verses 1 and 2.", status: "review" },
    { id: 2, passage: "An-Naba 6-10", note: "Separate similar endings before moving forward.", status: "new" },
    { id: 3, passage: "Yesterday's revision", note: "Recite once without looking before next session.", status: "done" },
  ]);
  const [passage, setPassage] = useState("");
  const [note, setNote] = useState("");

  const appointmentId = params.id as string;

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (authStatus !== "authenticated" || !appointmentId) return;

    fetch(`/api/appointments/${appointmentId}/join`)
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Failed to join"); });
        return r.json();
      })
      .then((data: JoinData) => {
        setJoinData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [authStatus, appointmentId, router]);

  const isTeacher = joinData?.appointment.isTeacher ?? false;

  const activeItems = useMemo(
    () => reviewItems.filter((item) => item.status !== "done").length,
    [reviewItems],
  );

  function addReviewItem() {
    const cleanPassage = passage.trim();
    const cleanNote = note.trim();
    if (!cleanPassage || !cleanNote) return;
    setReviewItems((items) => [
      { id: Date.now(), passage: cleanPassage, note: cleanNote, status: "new" },
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

  const handleJoinCall = useCallback(async () => {
    setPermError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermError("Camera/mic not available (insecure context or no permission)");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setInCall(true);
    } catch (e: any) {
      if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
        setPermError("Camera and microphone access was denied. Please allow permissions in your browser settings.");
      } else if (e?.name === "NotFoundError") {
        setPermError("No camera or microphone found on this device.");
      } else {
        setPermError(e?.message || "Could not access camera/microphone.");
      }
    }
  }, []);

  if (loading || authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="size-8 text-primary animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center max-w-md">
          <div className="size-16 rounded-full bg-danger/10 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-danger">!</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Cannot Join Session</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/courses/hifdh-ul-quran")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!joinData) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-text-secondary">Live Hifdh Session</p>
            <h2 className="text-2xl font-bold text-text-primary">
              {joinData.appointment.title || "One-on-one recitation session"}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span className="rounded-full bg-success/10 px-3 py-1 text-success font-medium">
              {isTeacher ? "Teaching" : "Student"}
            </span>
            <span className="rounded-full bg-bg-card border border-border px-3 py-1">{activeItems} follow-ups</span>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="h-[calc(100vh-16rem)] min-h-[360px] rounded-lg border border-border bg-bg-card overflow-hidden flex flex-col">
            {!inCall ? (
              <div className="flex flex-col items-center justify-center flex-1 bg-bg-secondary p-8 text-center">
                <div className="size-20 rounded-full bg-primary/10 mx-auto mb-5 flex items-center justify-center">
                  <span className="text-3xl text-primary">
                    <FontAwesomeIcon icon={faVideo} />
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  {joinData.appointment.title || "Live Session"}
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  {isTeacher ? "You are the teacher" : "You are joining as a student"}
                </p>
                {permError && (
                  <div className="mb-4 w-full max-w-sm rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400 mr-2" />
                    <span className="text-sm text-amber-300">{permError}</span>
                  </div>
                )}
                <div className="space-y-2 mb-6 w-full max-w-sm text-left">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-hover">
                    <span className="text-sm text-text-secondary">Room</span>
                    <span className="text-sm font-medium text-text-primary">{joinData.roomName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-bg-hover">
                    <span className="text-sm text-text-secondary">Status</span>
                    <span className="text-sm font-medium capitalize text-text-primary">
                      {joinData.appointment.status.toLowerCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleJoinCall}
                  className="px-8 py-3 bg-primary text-text-inverse rounded-xl font-bold hover:brightness-110 transition-all active:scale-[0.98] shadow-sm shadow-primary/20"
                >
                  Join Call
                </button>
              </div>
            ) : (
              <div className="flex-1 relative bg-black">
                <VideoRoom
                  liveKitUrl={joinData.liveKitUrl}
                  token={joinData.token}
                  onLeave={() => {
                    router.push("/courses/hifdh-ul-quran");
                  }}
                />
              </div>
            )}
          </div>

          <aside className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
            {isTeacher && (
              <div className="rounded-lg border border-border bg-bg-card p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-text-secondary">Teacher Mushaf</p>
                    <h3 className="font-bold text-text-primary">Follow recitation</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="flex size-8 items-center justify-center rounded border border-border bg-bg-primary text-text-secondary">
                      <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded border border-border bg-bg-primary text-text-secondary">
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                    </button>
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                  <select className="rounded border border-border bg-bg-primary px-3 py-2 outline-none text-text-primary">
                    <option>Surah An-Naba</option>
                    <option>Surah Al-Mulk</option>
                    <option>Surah Al-Qalam</option>
                  </select>
                  <select className="rounded border border-border bg-bg-primary px-3 py-2 outline-none text-text-primary">
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
                        className={`rounded px-3 py-1 ${index === 1 ? "bg-primary/10 text-primary" : "text-text-primary"}`}
                      >
                        {ayah.text}
                        <span className="mr-3 align-middle text-xs text-text-secondary">{ayah.ref}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border bg-bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wider text-text-secondary">Follow-up List</p>
                  <h3 className="font-bold text-text-primary">Teacher notes</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Next session</span>
              </div>

              {isTeacher && (
                <div className="mb-4 grid gap-2">
                  <input
                    value={passage}
                    onChange={(event) => setPassage(event.target.value)}
                    placeholder="Passage"
                    className="rounded border border-border bg-bg-primary px-3 py-2 outline-none focus:border-primary text-text-primary"
                  />
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Area to review"
                    className="min-h-20 rounded border border-border bg-bg-primary px-3 py-2 outline-none focus:border-primary text-text-primary"
                  />
                  <button
                    onClick={addReviewItem}
                    disabled={!passage.trim() || !note.trim()}
                    className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 font-semibold text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add follow-up
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {reviewItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => isTeacher && cycleStatus(item.id)}
                    className={`rounded-lg border border-border bg-bg-primary p-3 text-left ${isTeacher ? "cursor-pointer transition hover:border-primary/50" : ""}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{item.passage}</p>
                        <p className="text-sm text-text-secondary">{item.note}</p>
                      </div>
                      <span
                        className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                          item.status === "done"
                            ? "bg-success text-text-inverse"
                            : item.status === "review"
                              ? "bg-warning/20 text-warning"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        <FontAwesomeIcon icon={item.status === "done" ? faCheck : item.status === "review" ? faPen : faCircle} />
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-wider text-text-secondary">
                      {item.status === "done" ? "Completed" : item.status === "review" ? "Review again" : "New"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
