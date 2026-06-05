import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SideNav } from "../ui/PortalNav";

export const metadata: Metadata = {
  title: "Maymanah - Portal",
  description: "Quran learning platform",
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="md:pl-16 pb-16 md:pb-0 flex flex-col items-center h-full">
      <SideNav />
      {children}
    </div>
  );
}
