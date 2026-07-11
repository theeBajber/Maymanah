import {
  Amiri,
  El_Messiri,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  Noto_Naskh_Arabic,
} from "next/font/google";

/* Qandeel type roles — see DESIGN_SYSTEM.md 2.4 */

/** Display: Latin drawn to harmonize with Arabic Naskh. Headings, wordmark. */
export const elMessiri = El_Messiri({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "arabic"],
});

/** Body: quiet engineered grotesque with a true Arabic sibling. */
export const plexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

/** UI-level Arabic (labels, names, dates) — matched rhythm with plexSans. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600"],
  subsets: ["arabic"],
});

/** Quranic Arabic: Bulaq-press Naskh revival. Ayat, hadith, bismillah. */
export const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"] });

export const naskh = Noto_Naskh_Arabic({
  weight: "variable",
  subsets: ["arabic"],
});

/** @deprecated legacy alias from the pre-Qandeel stack; use plexSans. */
export const inter = plexSans;
