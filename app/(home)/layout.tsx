import { Footer } from "@/components/ui/footer";
import { TopNav } from "@/components/ui/nav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* The public shell is a night scene by design (dark-first Qandeel);
       the `dark` class pins nested theme tokens to the night palette so
       not-yet-redesigned public pages stay coherent regardless of theme. */
    <div className="dark night-scene relative flex min-h-svh w-full flex-col justify-between bg-layl text-ivory">
      <TopNav />
      {children}
      <Footer />
    </div>
  );
}
