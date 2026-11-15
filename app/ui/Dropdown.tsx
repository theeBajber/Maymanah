"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface Option<T> {
  value: T;
  label: string;
}

interface DropdownProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Used when the surrounding design already labels the control visually. */
  ariaLabel?: string;
  id?: string;
  describedBy?: string;
  invalid?: boolean;
  /** Shows a filter field above the options. Useful for the 114 surahs. */
  searchable?: boolean;
}

/**
 * The portal's custom single select.
 *
 * A button plus a listbox, with roving active state, arrow/Home/End keys,
 * Escape to close, and an optional search field for long lists. The visual
 * tokens match the form fields around it, so existing call sites keep their
 * shape while gaining keyboard and screen-reader support.
 */
export function Dropdown<T extends string | number>({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  disabled = false,
  className = "",
  ariaLabel,
  id,
  describedBy,
  invalid = false,
  searchable = false,
}: DropdownProps<T>) {
  const fallbackId = useId();
  const controlId = id ?? `dropdown-${fallbackId}`;
  const labelId = `${controlId}-label`;
  const listboxId = `${controlId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = options.find((option) => option.value === value);
  const filtered = searchable && query.trim()
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;
  const active = filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (searchable) searchRef.current?.focus();
    optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [open, searchable, active]);

  function close(returnFocus = false) {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(option: Option<T>) {
    onChange(option.value);
    close(true);
  }

  function openMenu() {
    if (disabled) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function move(direction: 1 | -1) {
    if (filtered.length === 0) return;
    setActiveIndex((current) => {
      const next = (current + direction + filtered.length) % filtered.length;
      return next;
    });
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      move(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (filtered[active]) choose(filtered[active]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (filtered[active]) choose(filtered[active]);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(Math.max(0, filtered.length - 1));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? (
        <span id={labelId} className="mb-1.5 block text-xs font-semibold text-text-secondary">
          {label}
        </span>
      ) : null}

      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        role="combobox"
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && filtered[active] ? `${controlId}-option-${active}` : undefined
        }
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-bg-primary px-4 py-2 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid
            ? "border-danger"
            : open
              ? "border-primary"
              : "border-border hover:border-primary"
        }`}
      >
        <span className={`truncate ${selected ? "text-text-primary" : "text-text-secondary"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && !disabled ? (
        <div className="absolute inset-x-0 z-30 mt-1 overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-float">
          {searchable ? (
            <div className="border-b border-border p-2">
              <input
                ref={searchRef}
                type="text"
                role="searchbox"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder="Search…"
                aria-label={label ? `Search ${label}` : "Search options"}
                aria-controls={listboxId}
                aria-activedescendant={
                  filtered[active] ? `${controlId}-option-${active}` : undefined
                }
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-border bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-secondary"
              />
            </div>
          ) : null}

          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            className="max-h-60 overflow-y-auto p-1"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-text-secondary">No matches</p>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === active;
                return (
                  <button
                    key={option.value}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    id={`${controlId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors ${
                      isSelected
                        ? "bg-primary-muted font-medium text-primary"
                        : isActive
                          ? "bg-bg-hover text-text-primary"
                          : "text-text-primary"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <Check aria-hidden className="ms-auto size-4 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
