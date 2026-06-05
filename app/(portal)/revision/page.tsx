import { TopNav } from "@/app/ui/PortalNav";

export default async function Revision() {
  return (
    <div className="flex flex-col h-full pt-16">
      <TopNav />
      <main className="flex-1 p-6">
        <div className="size-64 rounded-xl bg-white"></div>
      </main>
    </div>
  );
}
