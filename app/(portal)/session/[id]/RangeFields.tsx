"use client";

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

const FIELD =
  "h-10 rounded-[10px] border border-border bg-bg-primary px-3 text-sm text-text-primary focus:border-primary/60 focus:outline-none";

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
}: {
  surahs: SurahOption[];
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  disabled?: boolean;
  legend?: string;
}) {
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
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      {legend ? (
        <legend className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {legend}
        </legend>
      ) : null}
      <div className="flex flex-wrap items-end gap-3">
        {(["from", "to"] as const).map((side, index) => {
          const surahKey = side === "from" ? "fromSurah" : "toSurah";
          const ayahKey = side === "from" ? "fromAyah" : "toAyah";
          const surah = value[surahKey];

          return (
            <div key={side} className="flex items-end gap-3">
              {index === 1 ? (
                <span aria-hidden className="pb-2 text-sm text-text-muted">
                  →
                </span>
              ) : null}
              <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
                {side === "from" ? "From surah" : "To surah"}
                <select
                  value={surah}
                  onChange={(event) => setSurah(side, Number(event.target.value))}
                  className={FIELD}
                >
                  {surahs.map((row) => (
                    <option key={row.number} value={row.number}>
                      {row.number}. {row.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
                Ayah
                <select
                  value={value[ayahKey]}
                  onChange={(event) => onChange({ ...value, [ayahKey]: Number(event.target.value) })}
                  className={FIELD}
                >
                  {ayahOptions(surahs, surah).map((ayah) => (
                    <option key={ayah} value={ayah}>
                      {ayah}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
