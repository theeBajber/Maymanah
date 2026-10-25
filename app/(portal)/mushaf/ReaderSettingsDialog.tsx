"use client";

import {
  Check,
  Languages,
  Mic,
  Pointer,
  RotateCcw,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";

import type { QfRecitation } from "@/lib/qf/types";

import {
  READER_ARABIC_SIZES,
  type ReaderSettings,
} from "./reader-settings";

interface ReaderSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onChange: (patch: Partial<ReaderSettings>) => void;
  onReset: () => void;
  recitations: QfRecitation[] | null;
  recitationsLoading: boolean;
  recitationsError: string;
  onRetryRecitations: () => void;
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-bg-hover"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-bg-primary text-text-muted">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text-primary">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-text-muted">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-bg-elevated shadow-rest transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function ReaderSettingsDialog({
  open,
  onClose,
  settings,
  onChange,
  onReset,
  recitations,
  recitationsLoading,
  recitationsError,
  onRetryRecitations,
}: ReaderSettingsDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!open) return null;

  const reciterOptions = [...(recitations ?? [])].sort((left, right) =>
    (left.translated_name?.name ?? left.reciter_name).localeCompare(
      right.translated_name?.name ?? right.reciter_name,
    ),
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-settings-title"
        tabIndex={-1}
        className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-border bg-bg-elevated shadow-float outline-none sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="reader-settings-title"
              className="text-base font-bold text-text-primary"
            >
              Reader settings
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              Saved on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader settings"
            className="flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <section aria-labelledby="reader-size-heading">
            <h3
              id="reader-size-heading"
              className="flex items-center gap-2 px-1 text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase"
            >
              <Type className="size-3.5" />
              Arabic text size
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {READER_ARABIC_SIZES.map((size) => {
                const selected = settings.arabicSize === size.value;
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => onChange({ arabicSize: size.value })}
                    aria-pressed={selected}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      selected
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border bg-bg-primary text-text-secondary hover:border-primary/40 hover:text-text-primary"
                    }`}
                  >
                    {selected ? <Check className="size-3.5" /> : null}
                    {size.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 px-1 text-[11px] leading-5 text-text-muted">
              Applies to verse view. Reading view fits each page to the screen.
            </p>
          </section>

          <section className="mt-4 border-t border-border pt-3">
            <ToggleRow
              icon={Languages}
              label="Verse translation"
              description="Show the translation beneath each verse."
              checked={settings.showTranslation}
              onChange={(checked) => onChange({ showTranslation: checked })}
            />
            <ToggleRow
              icon={Pointer}
              label="Word tooltips"
              description="Tap or hover a word for its translation."
              checked={settings.showWordTooltips}
              onChange={(checked) => onChange({ showWordTooltips: checked })}
            />
          </section>

          <section
            aria-labelledby="reader-reciter-heading"
            className="mt-3 border-t border-border pt-4"
          >
            <h3
              id="reader-reciter-heading"
              className="flex items-center gap-2 px-1 text-[10px] font-bold tracking-[0.12em] text-text-muted uppercase"
            >
              <Mic className="size-3.5" />
              Reciter
            </h3>

            {recitationsLoading ? (
              <p className="mt-2 px-1 text-xs text-text-muted">
                Loading reciters…
              </p>
            ) : recitationsError ? (
              <div className="mt-2 rounded-xl border border-danger/30 bg-danger-muted px-3 py-2.5">
                <p className="text-xs text-danger">{recitationsError}</p>
                <button
                  type="button"
                  onClick={onRetryRecitations}
                  className="mt-2 text-xs font-semibold text-danger underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : reciterOptions.length === 0 ? (
              <p className="mt-2 px-1 text-xs text-text-muted">
                No reciters are available right now.
              </p>
            ) : (
              <>
                {!reciterOptions.some(
                  (reciter) => reciter.id === settings.reciterId,
                ) ? (
                  <p className="mt-2 px-1 text-[11px] text-text-muted">
                    Your saved reciter is not available right now. Choose one
                    below.
                  </p>
                ) : null}
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-bg-primary p-1">
                  {reciterOptions.map((reciter) => {
                  const selected = settings.reciterId === reciter.id;
                  const name =
                    reciter.translated_name?.name ?? reciter.reciter_name;
                  return (
                    <button
                      key={reciter.id}
                      type="button"
                      onClick={() => onChange({ reciterId: reciter.id })}
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        selected
                          ? "bg-primary-muted text-primary"
                          : "text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-primary bg-primary text-text-inverse"
                            : "border-border"
                        }`}
                      >
                        {selected ? <Check className="size-2.5" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {name}
                      </span>
                      {reciter.style ? (
                        <span className="shrink-0 text-[10px] text-text-muted">
                          {reciter.style}
                        </span>
                      ) : null}
                    </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-text-inverse transition-colors hover:bg-primary-dark"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
