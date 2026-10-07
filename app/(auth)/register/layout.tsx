import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Free Account",
  description:
    "Join Maymanah free — learn Tajweed, Hifdh, and Arabic with vetted volunteer teachers, or apply to teach yourself.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
