"use client";

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className = "",
}: SegmentedControlProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative grid grid-flow-col auto-cols-fr w-full rounded-xl border border-ivory/10 bg-ivory/[0.04] p-1 ${className}`}
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-[9px] bg-brass shadow-[0_0_24px_-6px_rgba(198,161,91,0.5)] transition-transform duration-300 ease-qandeel"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative z-10 h-11 rounded-[9px] text-sm font-semibold transition-colors duration-300 ${
              active ? "text-layl-deep" : "text-sage hover:text-ivory"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
