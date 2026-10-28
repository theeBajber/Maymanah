"use client";

import {
  Check,
  ListEnd,
  MoreHorizontal,
  Pause,
  Play,
  Repeat1,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatTime } from "./audio-utils";

const RATES = [0.75, 1, 1.25, 1.5, 2] as const;

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  muted: boolean;
  rate: number;
  repeatVerse: boolean;
  autoplayNext: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleMute: () => void;
  onRateChange: (rate: number) => void;
  onToggleRepeat: () => void;
  onToggleAutoplay: () => void;
}

function PlayerButton({
  label,
  onClick,
  disabled = false,
  active = false,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`flex size-9 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-primary-muted text-primary"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function MenuToggle({
  label,
  icon,
  checked,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitemcheckbox"
      aria-checked={checked}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
    >
      <span className="text-text-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      {checked ? <Check className="size-3.5 text-primary" /> : null}
    </button>
  );
}

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  muted,
  rate,
  repeatVerse,
  autoplayNext,
  canPrevious,
  canNext,
  onTogglePlay,
  onSeek,
  onPrevious,
  onNext,
  onClose,
  onToggleMute,
  onRateChange,
  onToggleRepeat,
  onToggleAutoplay,
}: AudioPlayerProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <section
      aria-label="Audio player"
      className="fixed right-0 bottom-16 left-0 z-30 border-t border-border bg-bg-elevated/95 shadow-float backdrop-blur-md md:bottom-0 md:left-16"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-text-muted">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => onSeek(Number(event.target.value))}
            disabled={!duration}
            aria-label="Audio progress"
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary disabled:cursor-not-allowed"
          />
          <span className="w-14 shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums text-text-muted">
            {formatTime(duration)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5">
          <div ref={menuRef} className="relative">
            <PlayerButton
              label="Playback options"
              active={menuOpen}
              pressed={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <MoreHorizontal className="size-4" />
            </PlayerButton>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 bottom-full z-40 mb-2 w-60 rounded-xl border border-border bg-bg-elevated p-1.5 shadow-float"
              >
                <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase">
                  Speed
                </p>
                <div className="grid grid-cols-5 gap-1 px-1.5 pb-1.5">
                  {RATES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onRateChange(option)}
                      aria-pressed={rate === option}
                      className={`rounded-md px-1 py-1.5 text-[10px] font-semibold transition-colors ${
                        rate === option
                          ? "bg-primary text-text-inverse"
                          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                      }`}
                    >
                      {option === 1 ? "1×" : `${option}×`}
                    </button>
                  ))}
                </div>

                <div className="my-1 h-px bg-border" />

                <MenuToggle
                  label="Repeat this verse"
                  icon={<Repeat1 className="size-3.5" />}
                  checked={repeatVerse}
                  onClick={onToggleRepeat}
                />
                <MenuToggle
                  label="Autoplay next verse"
                  icon={<ListEnd className="size-3.5" />}
                  checked={autoplayNext}
                  onClick={onToggleAutoplay}
                />
              </div>
            ) : null}
          </div>

          <PlayerButton
            label={muted ? "Unmute audio" : "Mute audio"}
            pressed={muted}
            onClick={onToggleMute}
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </PlayerButton>

          <PlayerButton
            label="Previous verse"
            disabled={!canPrevious}
            onClick={onPrevious}
          >
            <SkipBack className="size-4" />
          </PlayerButton>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
            className="flex size-10 items-center justify-center rounded-full bg-primary text-text-inverse transition-colors hover:bg-primary-dark"
          >
            {isPlaying ? (
              <Pause className="size-4.5 fill-current" />
            ) : (
              <Play className="size-4.5 translate-x-px fill-current" />
            )}
          </button>

          <PlayerButton label="Next verse" disabled={!canNext} onClick={onNext}>
            <SkipForward className="size-4" />
          </PlayerButton>

          <PlayerButton label="Close player" onClick={onClose}>
            <X className="size-4" />
          </PlayerButton>
        </div>
      </div>
    </section>
  );
}
