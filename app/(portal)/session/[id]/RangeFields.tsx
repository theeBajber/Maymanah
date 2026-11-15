"use client";

import { ArrowRight } from "lucide-react";

import { Dropdown } from "@/app/ui/Dropdown";

export interface SurahOption {
  number: number;
  name: string;
  ayahCount: number;
}

export interface RangeValue {
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
}

function ayahOptions(surahs: SurahOption[], surah: number): number[] {
  const count = surahs.find((row) => row.number === surah)?.ayahCount ?? 0;
  return Array.from({ length: count }, (_, index) => index + 1);
}

/**
 * Two surah:ayah pickers, one for each end of a range.
 *
 * The ayah list follows the chosen surah, so a teacher cannot pick an ayah
 * that does not exist. Changing the surah keeps the ayah when it is valid and
 * clamps it to the new surah's length otherwise.
 */
export function RangeFields({
  surahs,
  value,
  onChange,
  disabled = false,
  legend,
  describedBy,
  invalid = false,
}: {
  surahs: SurahOption[];
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  disabled?: boolean;
  legend?: string;
  describedBy?: string;
  invalid?: boolean;
}) {
  const surahOptions = surahs.map((row) => ({
    value: row.number,
    label: `${row.number}. ${row.name}`,
  }));

  function setSurah(side: "from" | "to", surah: number) {
    const options = ayahOptions(surahs, surah);
    const ayahKey = side === "from" ? "fromAyah" : "toAyah";
    const surahKey = side === "from" ? "fromSurah" : "toSurah";
    const currentAyah = value[ayahKey];
    onChange({
      ...value,
      [surahKey]: surah,
      [ayahKey]: currentAyah > options.length ? options.length : currentAyah,
    });
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2" disabled={disabled}>
      {legend ? (
        <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {legend}
        </legend>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {(["from", "to"] as const).map((side, index) => {
          const surahKey = side === "from" ? "fromSurah" : "toSurah";
          const ayahKey = side === "from" ? "fromAyah" : "toAyah";
          const surah = value[surahKey];

          return (
            <div key={side} className="contents">
              {index === 1 ? (
                <div aria-hidden className="hidden items-end justify-center pb-3 sm:flex">
                  <ArrowRight className="size-4 text-text-secondary rtl:rotate-180" />
                </div>
              ) : null}
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-2">
                <Dropdown
                  label={side === "from" ? "From surah" : "To surah"}
                  options={surahOptions}
                  value={surah}
                  onChange={(next) => setSurah(side, next)}
                  searchable
                  disabled={disabled}
                  invalid={invalid}
                  describedBy={describedBy}
                />
                <Dropdown
                  label={side === "from" ? "From ayah" : "To ayah"}
                  options={ayahOptions(surahs, surah).map((ayah) => ({
                    value: ayah,
                    label: String(ayah),
                  }))}
                  value={value[ayahKey]}
                  onChange={(next) => onChange({ ...value, [ayahKey]: next })}
                  disabled={disabled}
                  invalid={invalid}
                  describedBy={describedBy}
                />
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
