import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate — Support Free Quran Education",
  description:
    "Maymanah runs entirely on donations and volunteer teachers. Your sadaqah jariyah keeps Tajweed, Hifdh, and Arabic education free for thousands of students worldwide.",
  alternates: { canonical: "/donate" },
  openGraph: {
    title: "Donate — Support Free Quran Education | Maymanah",
    description:
      "Maymanah runs entirely on donations and volunteer teachers. Your sadaqah jariyah keeps Quran education free for thousands of students worldwide.",
    url: "/donate",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
