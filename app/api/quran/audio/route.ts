import { NextResponse } from "next/server";

/**
 * Proxies recitation audio from its CDN.
 *
 * The browser cannot fetch the audio directly without leaking the reader's
 * address to a third party on every verse, so the server fetches and relays
 * it with a day of caching.
 *
 * Only the known audio hosts are allowed. Proxying an arbitrary `url`
 * parameter would turn this endpoint into a way to fetch anything through the
 * server, so anything else is refused outright.
 */
const ALLOWED_AUDIO_HOSTS = new Set([
  "cdn.islamic.network",
  "everyayah.com",
  "audio.qurancdn.com",
  "audio-cdn.tilawat.com",
  "cdn.tilawat.com",
  "verses.quran.foundation",
  "mirrors.quranicaudio.com",
  "download.quranicaudio.com",
]);

export async function GET(request: Request): Promise<NextResponse> {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "Say which audio to play" }, { status: 422 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "That audio address is not valid" }, { status: 422 });
  }

  if (target.protocol !== "https:" || !ALLOWED_AUDIO_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "That audio source is not allowed" }, { status: 403 });
  }

  try {
    const range = request.headers.get("range");
    const upstream = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "audio/mpeg",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "That audio could not be loaded" }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": upstream.headers.get("accept-ranges") ?? "bytes",
    });
    for (const name of [
      "content-range",
      "content-length",
      "etag",
      "last-modified",
    ]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "That audio could not be loaded" }, { status: 502 });
  }
}
