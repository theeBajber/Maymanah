import type { Metadata } from "next";

import { CoursesView } from "./CoursesView";

export const metadata: Metadata = {
  title: "Courses",
  robots: { index: false, follow: false },
};

export default function CoursesPage() {
  return <CoursesView />;
}
