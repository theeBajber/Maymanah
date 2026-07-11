"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

type MediaType = "video" | "audio";

export function MediaPlayer({ src, type }: { src: string; type?: MediaType }) {
  const ref = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const detectedType: MediaType = type ?? (src.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "audio");

  const togglePlay = () => {
    if (!ref.current) return;
    if (ref.current.paused) {
      ref.current.play();
      setPlaying(true);
    } else {
      ref.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!ref.current) return;
    ref.current.muted = !ref.current.muted;
    setMuted(!muted);
  };

  const handleTimeUpdate = () => {
    if (ref.current) setCurrentTime(ref.current.currentTime);
  };

  const handleLoaded = () => {
    if (ref.current) setDuration(ref.current.duration);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    ref.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (detectedType === "video") {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-black group">
        <video
          ref={ref}
          src={src}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoaded}
          onEnded={() => setPlaying(false)}
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!playing && (
            <button
              onClick={togglePlay}
              className="pointer-events-auto size-16 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all hover:scale-105"
            >
              <Play className="size-6 text-white" />
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <div className="flex-1 h-1.5 rounded-full bg-white/30 cursor-pointer" onClick={seek}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white/80 text-xs font-mono tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              onClick={() => ref.current?.requestFullscreen()}
              className="text-white hover:text-primary transition-colors"
            >
              <Maximize className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 flex items-center gap-4">
      <button
        onClick={togglePlay}
        className="size-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-all shrink-0"
      >
        {playing ? <Pause className="size-5 text-text-inverse" /> : <Play className="size-5 text-text-inverse" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-2 rounded-full bg-bg-primary cursor-pointer" onClick={seek}>
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="text-text-secondary text-xs font-mono tabular-nums shrink-0">{fmt(currentTime)} / {fmt(duration)}</span>
      <button onClick={toggleMute} className="text-text-secondary hover:text-primary transition-colors shrink-0">
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <audio
        ref={ref}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoaded}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
