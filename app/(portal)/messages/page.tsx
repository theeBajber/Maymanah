import type { Metadata } from "next";

import { MessagesView } from "./MessagesView";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MessagesView />;
}
