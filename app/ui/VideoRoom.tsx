"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
  BarVisualizer,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Mic, MicOff, PhoneOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * The session video room.
 *
 * Starts with camera and microphone off, so joining never broadcasts before
 * the person is ready. A dropped connection that was not an intentional leave
 * offers a way back rather than stranding the participant on a black screen.
 */
export function VideoRoom({
  liveKitUrl,
  token,
  onLeave,
}: {
  liveKitUrl: string;
  token: string;
  onLeave: () => void;
}) {
  const [disconnected, setDisconnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  const handleLeave = useCallback(() => {
    onLeave();
  }, [onLeave]);

  return (
    <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-2xl bg-black">
      <LiveKitRoom
        audio={false}
        video={false}
        token={token}
        serverUrl={liveKitUrl}
        data-lk-theme="default"
        className="absolute inset-0"
        onError={(error: Error) => setConnectionError(error?.message || "Unknown error")}
        onDisconnected={() => setDisconnected(true)}
      >
        <RoomAudioRenderer />
        <Stage />
        <ControlsBar onLeave={handleLeave} />
      </LiveKitRoom>

      {disconnected && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="mx-auto max-w-xs text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger/10">
              <span className="text-2xl text-danger">!</span>
            </div>
            <h3 className="mb-1 text-lg font-bold text-white">Connection lost</h3>
            <p className="mb-6 text-sm text-zinc-400">
              {connectionError || "The call was disconnected unexpectedly."}
            </p>
            <button
              onClick={handleLeave}
              className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The current speaker, large; everyone else is audio-only until they speak. */
function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const active = tracks.find((track) => track.participant.isSpeaking) ?? tracks[0];

  return (
    <div className="absolute inset-0 bottom-20">
      {active?.publication?.track ? (
        <VideoTrack trackRef={active} className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3">
          <span className="flex size-16 items-center justify-center rounded-full bg-ivory/10 text-2xl font-bold text-ivory">
            {(active?.participant.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="text-sm text-zinc-400">{active?.participant.name ?? "Waiting"}</span>
          <BarVisualizer
            trackRef={tracks.find((track) => track.source === Track.Source.Microphone)}
            className="h-6"
          />
        </div>
      )}
    </div>
  );
}

function ControlsBar({ onLeave }: { onLeave: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleCamera() {
    if (busy) return;
    setBusy(true);
    try {
      await localParticipant.setCameraEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    } finally {
      setBusy(false);
    }
  }

  async function toggleMic() {
    if (busy) return;
    setBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!micOn);
      setMicOn(!micOn);
    } finally {
      setBusy(false);
    }
  }

  function leave() {
    void room.disconnect();
    onLeave();
  }

  const control =
    "flex size-11 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50";

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-3 bg-black/60 py-4 backdrop-blur">
      <button
        onClick={toggleMic}
        disabled={busy}
        aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        aria-pressed={micOn}
        className={`${control} ${micOn ? "bg-ivory/15 text-white" : "bg-danger/80 text-white"}`}
      >
        {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
      </button>
      <button
        onClick={toggleCamera}
        disabled={busy}
        aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        aria-pressed={cameraOn}
        className={`${control} ${cameraOn ? "bg-ivory/15 text-white" : "bg-danger/80 text-white"}`}
      >
        {cameraOn ? <VideoIcon className="size-5" /> : <VideoOff className="size-5" />}
      </button>
      <button
        onClick={leave}
        aria-label="Leave session"
        className={`${control} bg-danger text-white hover:brightness-110`}
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
}
