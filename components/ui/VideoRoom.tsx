"use client";

import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faPhoneSlash, faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LiveKitRoom,
  useTracks,
  useRemoteParticipants,
  RoomAudioRenderer,
  VideoTrack,
  useParticipants,
  useConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, ConnectionState as LKConnectionState } from "livekit-client";
import { useCallback, useState, useRef, useEffect } from "react";

function FocusedParticipant() {
  const cameraTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const remoteParticipants = useRemoteParticipants();
  const participants = useParticipants();

  const remoteTrack = cameraTracks.find((t) => !t.participant.isLocal);
  const localTrack = cameraTracks.find((t) => t.participant.isLocal);

  const otherParticipant = remoteParticipants.find((p) => !p.isLocal);
  const hasRemoteVideo = !!remoteTrack;
  const hasRemote = !!otherParticipant;

  return (
    <div className="relative w-full h-full bg-zinc-950">
      {hasRemoteVideo ? (
        <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain bg-zinc-950" />
      ) : hasRemote ? (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
          <div className="text-center">
            <div className="size-24 rounded-full bg-zinc-700 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-bold text-zinc-400">
                {otherParticipant.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <p className="text-zinc-300 text-sm font-medium">
              {otherParticipant.name || "Other participant"}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Establishing connection...</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
          <div className="text-center">
            <div className="size-24 rounded-full bg-zinc-700 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-bold text-zinc-400">?</span>
            </div>
            <p className="text-zinc-400 text-sm">Waiting for the other participant to join...</p>
          </div>
        </div>
      )}

      {localTrack && (
        <div className="absolute bottom-24 right-4 w-44 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
          <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-white/70">
        {participants.length < 2 ? "1/2 joined" : "2/2 in room"}
      </div>
    </div>
  );
}

interface VideoRoomProps {
  liveKitUrl: string;
  token: string;
  onLeave: () => void;
}

const connectionLabels: Record<LKConnectionState, string> = {
  [LKConnectionState.Connected]: "Connected",
  [LKConnectionState.Connecting]: "Connecting…",
  [LKConnectionState.Disconnected]: "Disconnected",
  [LKConnectionState.Reconnecting]: "Reconnecting…",
  [LKConnectionState.SignalReconnecting]: "Reconnecting…",
};

function ConnectionBadge() {
  const state = useConnectionState();
  const isBad = state === LKConnectionState.Disconnected || state === LKConnectionState.Reconnecting || state === LKConnectionState.SignalReconnecting;
  return (
    <span
      className={`px-3 py-1 rounded-lg text-xs font-medium ${
        isBad
          ? "bg-danger/20 text-danger"
          : state === LKConnectionState.Connected
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-amber-500/20 text-amber-400"
      }`}
    >
      {connectionLabels[state]}
    </span>
  );
}

function logToServer(level: string, message: string) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message }),
  }).catch(() => {});
}

function CallControlsBar({
  onLeave,
  fullscreen,
  toggleFullscreen,
}: {
  onLeave: () => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [camError, setCamError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    if (!localParticipant) return;
    localParticipant.setCameraEnabled(true).catch((e: Error) => {
      const msg = e?.message || "Camera access denied";
      setCamError(msg);
      logToServer("error", `Camera failed: ${msg}`);
    });
    localParticipant.setMicrophoneEnabled(true).catch((e: Error) => {
      const msg = e?.message || "Microphone access denied";
      setMicError(msg);
      logToServer("error", `Microphone failed: ${msg}`);
    });
  }, [localParticipant]);

  const toggleCamera = useCallback(() => {
    setCamOn((p) => {
      const next = !p;
      setCamError(null);
      localParticipant?.setCameraEnabled(next).catch((e: Error) => {
        const msg = e?.message || "Camera access denied";
        setCamError(msg);
        logToServer("error", `Camera toggle failed: ${msg}`);
      });
      return next;
    });
  }, [localParticipant]);

  const toggleMic = useCallback(() => {
    setMicOn((p) => {
      const next = !p;
      setMicError(null);
      localParticipant?.setMicrophoneEnabled(next).catch((e: Error) => {
        const msg = e?.message || "Microphone access denied";
        setMicError(msg);
        logToServer("error", `Microphone toggle failed: ${msg}`);
      });
      return next;
    });
  }, [localParticipant]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-10"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))" }}
    >
      {(camError || micError) && (
        <div className="px-3 py-2 bg-amber-500/15 border-b border-amber-500/20 text-center">
          <p className="text-xs text-amber-300 font-medium">
            {camError && micError
              ? `Camera: ${camError}  ·  Mic: ${micError}`
              : camError
                ? `Camera: ${camError}`
                : `Mic: ${micError}`}
          </p>
          <p className="text-[10px] text-amber-400/60 mt-0.5">Check browser permissions (lock icon in address bar)</p>
        </div>
      )}
      <div className="flex items-center justify-center gap-3 py-3 px-2 bg-zinc-900/90 backdrop-blur-sm border-t border-white/5">
        <button
          type="button"
          onClick={toggleMic}
          className={`size-14 md:size-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            micError
              ? "bg-amber-500/20 text-amber-400"
              : micOn
                ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                : "bg-danger/20 text-danger"
          }`}
          title={micError ? "Microphone unavailable" : micOn ? "Mute microphone" : "Unmute microphone"}
        >
          <FontAwesomeIcon icon={micError ? faMicrophoneSlash : (micOn ? faMicrophone : faMicrophoneSlash)} className="size-5 md:size-4" />
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          className={`size-14 md:size-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            camError
              ? "bg-amber-500/20 text-amber-400"
              : camOn
                ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                : "bg-danger/20 text-danger"
          }`}
          title={camError ? "Camera unavailable" : camOn ? "Turn off camera" : "Turn on camera"}
        >
          <FontAwesomeIcon icon={camError ? faVideoSlash : (camOn ? faVideo : faVideoSlash)} className="size-5 md:size-4" />
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="size-14 md:size-12 rounded-full bg-danger flex items-center justify-center hover:bg-danger/80 transition-all active:scale-90"
          title="Leave session"
        >
          <FontAwesomeIcon icon={faPhoneSlash} className="size-5 md:size-4 text-white" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="size-14 md:size-12 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center transition-all active:scale-90"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <FontAwesomeIcon icon={fullscreen ? faCompress : faExpand} className="size-5 md:size-4" />
        </button>
      </div>
    </div>
  );
}

export function VideoRoom({ liveKitUrl, token, onLeave }: VideoRoomProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const intentionalLeave = useRef(false);

  const handleLeave = useCallback(() => {
    intentionalLeave.current = true;
    onLeave();
  }, [onLeave]);

  const handleError = useCallback((err: Error) => {
    setConnectionError(err?.message || "Unknown error");
  }, []);

  const handleDisconnected = useCallback(() => {
    if (!intentionalLeave.current) {
      setDisconnected(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      <LiveKitRoom
        audio={false}
        video={false}
        token={token}
        serverUrl={liveKitUrl}
        data-lk-theme="default"
        className="w-full h-full"
        onError={handleError}
        onDisconnected={handleDisconnected}
      >
        <RoomAudioRenderer />
        <FocusedParticipant />

        <div className="absolute top-4 right-4 z-10">
          <ConnectionBadge />
        </div>

        {!disconnected && (
          <CallControlsBar
            onLeave={handleLeave}
            fullscreen={fullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        )}
      </LiveKitRoom>

      {disconnected && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center max-w-xs">
            <div className="size-16 rounded-full bg-danger/10 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-danger">!</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Connection Lost</h3>
            <p className="text-zinc-400 text-sm mb-6">
              {connectionError || "The call was disconnected unexpectedly."}
            </p>
            <button
              onClick={handleLeave}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:brightness-110 transition-all active:scale-[0.98]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
