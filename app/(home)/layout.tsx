import { inter } from "@/components/ui/fonts";
import { Footer } from "@/components/ui/footer";
import { TopNav } from "@/components/ui/nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`h-full w-full flex flex-col justify-between ${inter.className}`}
    >
      <TopNav />
      {children}
      <Footer />
    </main>
  );
}
