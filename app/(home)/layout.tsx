import { inter } from "../ui/fonts";
import { Footer } from "../ui/footer";
import { TopNav } from "../ui/nav";

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
