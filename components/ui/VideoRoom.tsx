"use client";

import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faPhoneSlash, faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LiveKitRoom,
  useTracks,
  RoomAudioRenderer,
  VideoTrack,
} from "@livekit/components-react";
import "@livekit/components-styles/dist/index.css";
import { Track } from "livekit-client";
import { useCallback, useState } from "react";

function FocusedParticipant() {
  const cameraTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  const remoteTrack = cameraTracks.find((t) => !t.participant.isLocal);
  const localTrack = cameraTracks.find((t) => t.participant.isLocal);

  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-2xl overflow-hidden">
      {remoteTrack ? (
        <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
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
        <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
          <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

interface VideoRoomProps {
  liveKitUrl: string;
  token: string;
  onLeave: () => void;
}

export function VideoRoom({ liveKitUrl, token, onLeave }: VideoRoomProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

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
    <LiveKitRoom
      video={camOn}
      audio={micOn}
      token={token}
      serverUrl={liveKitUrl}
      data-lk-theme="default"
      className="relative w-full h-full flex flex-col bg-black"
      onDisconnected={onLeave}
    >
      <RoomAudioRenderer />
      <div className="flex-1 relative p-2 md:p-4">
        <FocusedParticipant />
      </div>

      <div className="flex items-center justify-center gap-3 py-4 px-4 bg-zinc-900/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setMicOn((p) => !p)}
          className={`size-12 rounded-full flex items-center justify-center transition-all ${
            micOn
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-danger/20 text-danger"
          }`}
          title={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          <FontAwesomeIcon icon={micOn ? faMicrophone : faMicrophoneSlash} className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setCamOn((p) => !p)}
          className={`size-12 rounded-full flex items-center justify-center transition-all ${
            camOn
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-danger/20 text-danger"
          }`}
          title={camOn ? "Turn off camera" : "Turn on camera"}
        >
          <FontAwesomeIcon icon={camOn ? faVideo : faVideoSlash} className="size-4" />
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="size-12 rounded-full bg-danger flex items-center justify-center hover:bg-danger/80 transition-all"
          title="Leave session"
        >
          <FontAwesomeIcon icon={faPhoneSlash} className="size-4 text-white" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="size-12 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center transition-all"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          <FontAwesomeIcon icon={fullscreen ? faCompress : faExpand} className="size-4" />
        </button>
      </div>
    </LiveKitRoom>
  );
}
