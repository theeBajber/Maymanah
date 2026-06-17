import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch bookmarks as "open ustadh notes"
    // These are verses the teacher has marked as focus areas for the student
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Return formatted notes
    const notes = bookmarks.map((bookmark) => 
      bookmark.note || `${bookmark.surah}:${bookmark.ayah}`
    );

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
