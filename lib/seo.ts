/**
 * Central SEO constants. One source of truth for the site's identity
 * across metadata, structured data, sitemap, and manifest.
 *
 * SITE_URL should be overridden via NEXT_PUBLIC_SITE_URL once a custom
 * domain is live — everything else (canonical URLs, OG image resolution,
 * sitemap/robots) derives from it automatically.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://maymanah.vercel.app";

export const SITE_NAME = "Maymanah";

export const SITE_TITLE = "Maymanah — Free Live Quran Classes Online";

export const SITE_DESCRIPTION =
  "Learn Tajweed, Hifdh (Quran memorization), and classical Arabic in live 1-on-1 sessions with vetted, ijazah-verified volunteer teachers — completely free, from anywhere in the world.";

export const SITE_KEYWORDS = [
  "online Quran classes",
  "learn Quran online",
  "Tajweed classes online",
  "Hifdh memorization",
  "Quran teacher online",
  "free Quran classes",
  "learn Arabic online",
  "Quran memorization course",
  "ijazah Quran",
  "1-on-1 Quran tutor",
  "Quran teacher for kids",
  "Islamic online education",
];

/** Used by opengraph-image.tsx / twitter-image.tsx and app/icon*.tsx. */
export const BRAND_COLORS = {
  layl: "#0B151B",
  laylDeep: "#060D11",
  brass: "#C6A15B",
  ivory: "#EAE6DA",
  sage: "#93A5A8",
};
