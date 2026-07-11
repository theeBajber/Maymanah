import Mushaf from "@/components/Mushaf";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MushaPage() {
  const session = await auth();
  let lastSurah = 1;
  let lastVerse = 1;

  if (session?.user?.id) {
    const progress = await prisma.quranProgress.findUnique({
      where: { userId: session.user.id },
      select: { lastSurah: true, lastVerse: true },
    });
    if (progress) {
      lastSurah = progress.lastSurah;
      lastVerse = progress.lastVerse;
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Mushaf mode="standalone" surahNumber={lastSurah} verseNumber={lastVerse} />
    </div>
  );
}
