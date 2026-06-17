"use client";

import { ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
}

export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-[10px] uppercase tracking-widest font-bold px-1 block mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 h-12 rounded-xl border border-primary-dark/80 focus:border-primary focus:outline-none bg-transparent hover:border-primary transition-colors"
      >
        <span className={`truncate text-sm ${selected ? "text-text-primary" : "text-text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 ml-2 transition-transform text-text-secondary ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-lg animate-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-bg-hover ${
                opt.value === value ? "bg-primary-muted text-primary font-medium" : "text-text-primary"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  opt.value === value ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {opt.value === value && <Check size={10} className="text-text-inverse" />}
              </span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
