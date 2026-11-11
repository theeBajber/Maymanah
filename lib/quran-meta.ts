/**
 * The 114 surahs and their ayah counts, in the Hafs reading.
 *
 * This is the single source used to validate every memorisation range. The
 * same rows are seeded into `surah_meta`, which backs the dropdowns, so a
 * range can never name a surah or ayah the reader cannot actually select.
 *
 * Names follow the Tanzil metadata (CC-BY), the same dataset used for the
 * verse counts.
 */
export interface Surah {
  number: number;
  name: string;
  ayahCount: number;
}

export const SURAHS: readonly Surah[] = [
  { number: 1, name: "Al-Faatiha", ayahCount: 7 },
  { number: 2, name: "Al-Baqara", ayahCount: 286 },
  { number: 3, name: "Aal-i-Imraan", ayahCount: 200 },
  { number: 4, name: "An-Nisaa", ayahCount: 176 },
  { number: 5, name: "Al-Maaida", ayahCount: 120 },
  { number: 6, name: "Al-An'aam", ayahCount: 165 },
  { number: 7, name: "Al-A'raaf", ayahCount: 206 },
  { number: 8, name: "Al-Anfaal", ayahCount: 75 },
  { number: 9, name: "At-Tawba", ayahCount: 129 },
  { number: 10, name: "Yunus", ayahCount: 109 },
  { number: 11, name: "Hud", ayahCount: 123 },
  { number: 12, name: "Yusuf", ayahCount: 111 },
  { number: 13, name: "Ar-Ra'd", ayahCount: 43 },
  { number: 14, name: "Ibrahim", ayahCount: 52 },
  { number: 15, name: "Al-Hijr", ayahCount: 99 },
  { number: 16, name: "An-Nahl", ayahCount: 128 },
  { number: 17, name: "Al-Israa", ayahCount: 111 },
  { number: 18, name: "Al-Kahf", ayahCount: 110 },
  { number: 19, name: "Maryam", ayahCount: 98 },
  { number: 20, name: "Taa-Haa", ayahCount: 135 },
  { number: 21, name: "Al-Anbiyaa", ayahCount: 112 },
  { number: 22, name: "Al-Hajj", ayahCount: 78 },
  { number: 23, name: "Al-Muminoon", ayahCount: 118 },
  { number: 24, name: "An-Noor", ayahCount: 64 },
  { number: 25, name: "Al-Furqaan", ayahCount: 77 },
  { number: 26, name: "Ash-Shu'araa", ayahCount: 227 },
  { number: 27, name: "An-Naml", ayahCount: 93 },
  { number: 28, name: "Al-Qasas", ayahCount: 88 },
  { number: 29, name: "Al-Ankaboot", ayahCount: 69 },
  { number: 30, name: "Ar-Room", ayahCount: 60 },
  { number: 31, name: "Luqman", ayahCount: 34 },
  { number: 32, name: "As-Sajda", ayahCount: 30 },
  { number: 33, name: "Al-Ahzaab", ayahCount: 73 },
  { number: 34, name: "Saba", ayahCount: 54 },
  { number: 35, name: "Faatir", ayahCount: 45 },
  { number: 36, name: "Yaseen", ayahCount: 83 },
  { number: 37, name: "As-Saaffaat", ayahCount: 182 },
  { number: 38, name: "Saad", ayahCount: 88 },
  { number: 39, name: "Az-Zumar", ayahCount: 75 },
  { number: 40, name: "Al-Ghaafir", ayahCount: 85 },
  { number: 41, name: "Fussilat", ayahCount: 54 },
  { number: 42, name: "Ash-Shura", ayahCount: 53 },
  { number: 43, name: "Az-Zukhruf", ayahCount: 89 },
  { number: 44, name: "Ad-Dukhaan", ayahCount: 59 },
  { number: 45, name: "Al-Jaathiya", ayahCount: 37 },
  { number: 46, name: "Al-Ahqaf", ayahCount: 35 },
  { number: 47, name: "Muhammad", ayahCount: 38 },
  { number: 48, name: "Al-Fath", ayahCount: 29 },
  { number: 49, name: "Al-Hujuraat", ayahCount: 18 },
  { number: 50, name: "Qaaf", ayahCount: 45 },
  { number: 51, name: "Adh-Dhaariyat", ayahCount: 60 },
  { number: 52, name: "At-Tur", ayahCount: 49 },
  { number: 53, name: "An-Najm", ayahCount: 62 },
  { number: 54, name: "Al-Qamar", ayahCount: 55 },
  { number: 55, name: "Ar-Rahmaan", ayahCount: 78 },
  { number: 56, name: "Al-Waaqia", ayahCount: 96 },
  { number: 57, name: "Al-Hadid", ayahCount: 29 },
  { number: 58, name: "Al-Mujaadila", ayahCount: 22 },
  { number: 59, name: "Al-Hashr", ayahCount: 24 },
  { number: 60, name: "Al-Mumtahana", ayahCount: 13 },
  { number: 61, name: "As-Saff", ayahCount: 14 },
  { number: 62, name: "Al-Jumu'a", ayahCount: 11 },
  { number: 63, name: "Al-Munaafiqoon", ayahCount: 11 },
  { number: 64, name: "At-Taghaabun", ayahCount: 18 },
  { number: 65, name: "At-Talaaq", ayahCount: 12 },
  { number: 66, name: "At-Tahrim", ayahCount: 12 },
  { number: 67, name: "Al-Mulk", ayahCount: 30 },
  { number: 68, name: "Al-Qalam", ayahCount: 52 },
  { number: 69, name: "Al-Haaqqa", ayahCount: 52 },
  { number: 70, name: "Al-Ma'aarij", ayahCount: 44 },
  { number: 71, name: "Nooh", ayahCount: 28 },
  { number: 72, name: "Al-Jinn", ayahCount: 28 },
  { number: 73, name: "Al-Muzzammil", ayahCount: 20 },
  { number: 74, name: "Al-Muddaththir", ayahCount: 56 },
  { number: 75, name: "Al-Qiyaama", ayahCount: 40 },
  { number: 76, name: "Al-Insaan", ayahCount: 31 },
  { number: 77, name: "Al-Mursalaat", ayahCount: 50 },
  { number: 78, name: "An-Naba", ayahCount: 40 },
  { number: 79, name: "An-Naazi'aat", ayahCount: 46 },
  { number: 80, name: "Abasa", ayahCount: 42 },
  { number: 81, name: "At-Takwir", ayahCount: 29 },
  { number: 82, name: "Al-Infitaar", ayahCount: 19 },
  { number: 83, name: "Al-Mutaffifin", ayahCount: 36 },
  { number: 84, name: "Al-Inshiqaaq", ayahCount: 25 },
  { number: 85, name: "Al-Burooj", ayahCount: 22 },
  { number: 86, name: "At-Taariq", ayahCount: 17 },
  { number: 87, name: "Al-A'laa", ayahCount: 19 },
  { number: 88, name: "Al-Ghaashiya", ayahCount: 26 },
  { number: 89, name: "Al-Fajr", ayahCount: 30 },
  { number: 90, name: "Al-Balad", ayahCount: 20 },
  { number: 91, name: "Ash-Shams", ayahCount: 15 },
  { number: 92, name: "Al-Lail", ayahCount: 21 },
  { number: 93, name: "Ad-Dhuhaa", ayahCount: 11 },
  { number: 94, name: "Ash-Sharh", ayahCount: 8 },
  { number: 95, name: "At-Tin", ayahCount: 8 },
  { number: 96, name: "Al-Alaq", ayahCount: 19 },
  { number: 97, name: "Al-Qadr", ayahCount: 5 },
  { number: 98, name: "Al-Bayyina", ayahCount: 8 },
  { number: 99, name: "Az-Zalzala", ayahCount: 8 },
  { number: 100, name: "Al-Aadiyaat", ayahCount: 11 },
  { number: 101, name: "Al-Qaari'a", ayahCount: 11 },
  { number: 102, name: "At-Takaathur", ayahCount: 8 },
  { number: 103, name: "Al-Asr", ayahCount: 3 },
  { number: 104, name: "Al-Humaza", ayahCount: 9 },
  { number: 105, name: "Al-Fil", ayahCount: 5 },
  { number: 106, name: "Quraish", ayahCount: 4 },
  { number: 107, name: "Al-Maa'un", ayahCount: 7 },
  { number: 108, name: "Al-Kawthar", ayahCount: 3 },
  { number: 109, name: "Al-Kaafiroon", ayahCount: 6 },
  { number: 110, name: "An-Nasr", ayahCount: 3 },
  { number: 111, name: "Al-Masad", ayahCount: 5 },
  { number: 112, name: "Al-Ikhlaas", ayahCount: 4 },
  { number: 113, name: "Al-Falaq", ayahCount: 5 },
  { number: 114, name: "An-Naas", ayahCount: 6 },
];

/** Ayahs in the whole Quran; the denominator for memorisation percentage. */
export const TOTAL_QURAN_AYAHS = 6236;

const BY_NUMBER = new Map(SURAHS.map((surah) => [surah.number, surah]));

export function surahByNumber(number: number): Surah | undefined {
  return BY_NUMBER.get(number);
}

/** The first ayah of each surah, as a position in the whole Quran (1-based). */
const OFFSETS: readonly number[] = (() => {
  const offsets: number[] = [];
  let running = 0;
  for (const surah of SURAHS) {
    offsets.push(running);
    running += surah.ayahCount;
  }
  return offsets;
})();

/**
 * Turns a surah:ayah pair into a position in the whole Quran.
 *
 * Returns null when the surah is unknown or the ayah falls outside it, so
 * callers can validate and convert in one step.
 */
export function absoluteAyah(surah: number, ayah: number): number | null {
  const meta = BY_NUMBER.get(surah);
  if (!meta || !Number.isInteger(ayah) || ayah < 1 || ayah > meta.ayahCount) return null;
  return OFFSETS[surah - 1] + ayah;
}

/** The surah:ayah a whole-Quran position falls on. */
export function positionToAyah(position: number): { surah: number; ayah: number } | null {
  if (!Number.isInteger(position) || position < 1 || position > TOTAL_QURAN_AYAHS) return null;
  const index = OFFSETS.findLastIndex((offset) => offset < position);
  const surah = SURAHS[index];
  return { surah: surah.number, ayah: position - OFFSETS[index] };
}

export function compareAyahs(
  a: { surah: number; ayah: number },
  b: { surah: number; ayah: number },
): number {
  return a.surah - b.surah || a.ayah - b.ayah;
}

export type RangeProblem = "unknown_surah" | "ayah_out_of_range" | "empty_range";

export interface AyahRangeInput {
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
}

/**
 * Checks a memorisation range before it is stored.
 *
 * A range must name two real positions in the same direction as the Quran and
 * cannot run backwards. A single ayah is a valid range; an empty one is not.
 */
export function validateAyahRange(range: AyahRangeInput): { ok: true } | { ok: false; reason: RangeProblem } {
  const from = surahByNumber(range.fromSurah);
  const to = surahByNumber(range.toSurah);
  if (!from || !to) return { ok: false, reason: "unknown_surah" };
  if (
    !Number.isInteger(range.fromAyah) ||
    !Number.isInteger(range.toAyah) ||
    range.fromAyah < 1 ||
    range.fromAyah > from.ayahCount ||
    range.toAyah < 1 ||
    range.toAyah > to.ayahCount
  ) {
    return { ok: false, reason: "ayah_out_of_range" };
  }

  const start = absoluteAyah(range.fromSurah, range.fromAyah);
  const end = absoluteAyah(range.toSurah, range.toAyah);
  if (start === null || end === null) return { ok: false, reason: "ayah_out_of_range" };
  if (start > end) return { ok: false, reason: "empty_range" };

  return { ok: true };
}

/** A human label such as "Al-Baqara 2:255" or "Al-Baqara 2:1–5". */
export function rangeLabel(range: AyahRangeInput): string {
  const from = surahByNumber(range.fromSurah)?.name ?? `Surah ${range.fromSurah}`;
  const to = surahByNumber(range.toSurah)?.name ?? `Surah ${range.toSurah}`;
  if (range.fromSurah === range.toSurah && range.fromAyah === range.toAyah) {
    return `${from} ${range.fromSurah}:${range.fromAyah}`;
  }
  if (range.fromSurah === range.toSurah) {
    return `${from} ${range.fromSurah}:${range.fromAyah}–${range.toAyah}`;
  }
  return `${from} ${range.fromSurah}:${range.fromAyah} – ${to} ${range.toSurah}:${range.toAyah}`;
}
