import type { Metadata } from "next";

import { SessionsPage } from "./SessionsList";

export const metadata: Metadata = {
  title: "Sessions",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SessionsPage />;
}
