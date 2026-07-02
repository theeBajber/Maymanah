const JUZ_ENDS: { surah: number; verse: number }[] = [
  { surah: 2, verse: 141 },
  { surah: 2, verse: 252 },
  { surah: 2, verse: 286 },
  { surah: 4, verse: 23 },
  { surah: 4, verse: 147 },
  { surah: 5, verse: 81 },
  { surah: 5, verse: 147 },
  { surah: 6, verse: 111 },
  { surah: 6, verse: 165 },
  { surah: 8, verse: 40 },
  { surah: 9, verse: 93 },
  { surah: 11, verse: 5 },
  { surah: 12, verse: 52 },
  { surah: 15, verse: 99 },
  { surah: 17, verse: 111 },
  { surah: 18, verse: 74 },
  { surah: 21, verse: 112 },
  { surah: 23, verse: 118 },
  { surah: 25, verse: 77 },
  { surah: 27, verse: 55 },
  { surah: 29, verse: 45 },
  { surah: 33, verse: 30 },
  { surah: 36, verse: 83 },
  { surah: 39, verse: 31 },
  { surah: 41, verse: 46 },
  { surah: 46, verse: 35 },
  { surah: 51, verse: 30 },
  { surah: 58, verse: 22 },
  { surah: 67, verse: 30 },
  { surah: 78, verse: 46 },
];

export function getJuzNumber(surah: number, verse: number): number {
  for (let juz = 0; juz < JUZ_ENDS.length; juz++) {
    const end = JUZ_ENDS[juz];
    if (surah < end.surah || (surah === end.surah && verse <= end.verse)) {
      return juz + 1;
    }
  }
  return 30;
}

export function hasCompletedNewJuz(
  prevSurah: number,
  prevVerse: number,
  newSurah: number,
  newVerse: number,
): boolean {
  const prevJuz = getJuzNumber(prevSurah, prevVerse);
  const newJuz = getJuzNumber(newSurah, newVerse);
  return newJuz > prevJuz;
}
