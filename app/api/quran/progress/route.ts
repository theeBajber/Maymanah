import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getJuzNumber } from '@/lib/quran';
import { createMurajaAppointment } from '@/lib/mentorship';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { surahNumber, verseNumber } = await req.json();

    if (!surahNumber || !verseNumber) {
      return NextResponse.json(
        { error: 'Missing surahNumber or verseNumber' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.quranProgress.findUnique({
      where: { userId: user.id },
    });

    const prevSurah = existing?.lastSurah ?? 1;
    const prevVerse = existing?.lastVerse ?? 1;
    const prevCompletedJuz = existing?.completedJuz ?? 0;

    const newJuz = getJuzNumber(surahNumber, verseNumber);
    const newCompletedJuz = Math.max(prevCompletedJuz, newJuz > getJuzNumber(prevSurah, prevVerse) ? newJuz - 1 : prevCompletedJuz);

    const progress = await prisma.quranProgress.upsert({
      where: { userId: user.id },
      update: {
        lastSurah: surahNumber,
        lastVerse: verseNumber,
        completedJuz: newCompletedJuz,
      },
      create: {
        userId: user.id,
        lastSurah: surahNumber,
        lastVerse: verseNumber,
        completedJuz: newCompletedJuz,
      },
    });

    if (newCompletedJuz > prevCompletedJuz) {
      await createMurajaAppointment(user.id);
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const progress = await prisma.quranProgress.findUnique({
      where: { userId: user.id },
    });

    if (!progress) {
      return NextResponse.json({
        lastSurah: 1,
        lastVerse: 1,
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
