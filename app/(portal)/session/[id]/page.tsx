"use client";

import { faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VideoRoom } from "@/components/ui/VideoRoom";

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

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const { status: authStatus } = useSession();
  const [joinData, setJoinData] = useState<JoinData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

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

  if (loading || authStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="size-8 text-primary animate-spin mb-4" />
          <p className="text-text-secondary text-sm">Connecting to session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center max-w-md">
          <div className="size-16 rounded-full bg-danger/10 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-danger">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cannot Join Session</h2>
          <p className="text-zinc-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-text-inverse rounded-xl font-medium hover:brightness-110 transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="size-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!joinData) return null;

  if (!inCall) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
        <div className="bg-bg-card rounded-2xl border border-border shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
          <div className="size-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">📹</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {joinData.appointment.title || "Live Session"}
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {joinData.appointment.isTeacher ? "You are the teacher" : "You are joining as a student"}
          </p>

          <div className="space-y-3 mb-8 text-left">
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

          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              You&apos;ll be connected via LiveKit. Make sure your camera and microphone are enabled.
            </p>
            <button
              onClick={() => setInCall(true)}
              className="w-full py-3 bg-primary text-text-inverse rounded-xl font-bold hover:brightness-110 transition-all active:scale-[0.98]"
            >
              Join Call
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <VideoRoom
        liveKitUrl={joinData.liveKitUrl}
        token={joinData.token}
        onLeave={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
