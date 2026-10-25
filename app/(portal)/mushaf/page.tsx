import type { Metadata } from "next";

import { MushafView } from "./MushafView";

export const metadata: Metadata = {
  title: "Mushaf",
  robots: { index: false, follow: false },
};

function initialPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  return <MushafView initialPage={initialPage(params.page)} />;
}
