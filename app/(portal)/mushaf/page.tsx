import { TopNav } from "@/components/ui/PortalNav";
import Mushaf from "@/components/Mushaf";

export default async function MushaPage() {
  return (
    <div className="flex flex-col h-full pt-16">
      <TopNav />
      <main className="flex-1 p-6 overflow-auto">
        <Mushaf mode="standalone" />
      </main>
    </div>
  );
}
