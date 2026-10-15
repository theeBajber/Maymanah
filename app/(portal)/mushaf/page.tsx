import type { Metadata } from "next";

import { MushafView } from "./MushafView";

export const metadata: Metadata = {
  title: "Mushaf",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MushafView />;
}
