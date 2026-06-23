import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'audio/mpeg',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
    }

    const audioBuffer = await response.arrayBuffer();
    const origin = req.headers.get('origin') || '';
    const allowedOrigins = ['https://maymanah.com', 'http://localhost:3000'];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : '';

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': corsOrigin || 'null',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audio' }, { status: 500 });
  }
}
