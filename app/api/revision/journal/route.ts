import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { surahNumber, fromVerse, toVerse, errors, accuracy, duration } = await req.json();

    if (!surahNumber || !fromVerse || !toVerse) {
      return NextResponse.json(
        { error: 'Missing required fields: surahNumber, fromVerse, toVerse' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create RecitationJournal entry
    const journal = await prisma.recitationJournal.create({
      data: {
        userId: user.id,
        surahNumber,
        fromVerse,
        toVerse,
        errors: errors || [],
        accuracy: accuracy || 0,
        duration: duration || 0,
      },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
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

    // Fetch user's recitation journal entries
    const entries = await prisma.recitationJournal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Latest 50 entries
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
