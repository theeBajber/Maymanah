/**
 * What a sign-in looked like, read from its request.
 *
 * The settings page shows the account's devices as people think of them —
 * "Chrome 126 on Windows 11, Nairobi" — not as a raw user-agent string and an
 * address. Everything here is pure so the shape of a login can be tested
 * without a request.
 */

/** The browser and platform a user-agent names, e.g. "Chrome 126 on Windows 11". */
export function deviceLabel(userAgent: string): string {
  if (!userAgent || userAgent === "unknown device" || userAgent === "unknown") {
    return "Unknown device";
  }

  const browser = browserName(userAgent);
  const version = browserVersion(userAgent);
  const os = osName(userAgent);
  const namedBrowser = version ? `${browser} ${version}` : browser;
  return [namedBrowser, os].filter(Boolean).join(" on ") || "Unknown device";
}

function browserName(ua: string): string {
  // Order matters: Edge, Opera, and other Chromium builds also contain
  // "Chrome", so their own tokens must win. "Safari" matches everything
  // WebKit, so it comes last and only when no other name is present.
  if (/\bEdg(?:e|A|iOS)?\//.test(ua)) return "Edge";
  if (/\bOPR\//.test(ua) || /\bOpera\b/.test(ua)) return "Opera";
  if (/\bSamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/\bFirefox\//.test(ua) || /\bFxiOS\//.test(ua)) return "Firefox";
  if (/\bChrome\//.test(ua) || /\bCriOS\//.test(ua)) return "Chrome";
  if (/\bSafari\//.test(ua)) return "Safari";
  return "";
}

function browserVersion(ua: string): string {
  for (const [pattern] of [
    [/\bEdg(?:e|A|iOS)?\/([\d.]+)/],
    [/\bOPR\/([\d.]+)/],
    [/\bSamsungBrowser\/([\d.]+)/],
    [/\bFirefox\/([\d.]+)/],
    [/\bFxiOS\/([\d.]+)/],
    [/\bChrome\/([\d.]+)/],
    [/\bCriOS\/([\d.]+)/],
    [/\bVersion\/([\d.]+).*\bSafari\//],
  ] as [RegExp][]) {
    const match = ua.match(pattern);
    if (match) return match[1].split(".")[0];
  }
  return "";
}

function osName(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Windows/.test(ua)) return "Windows";
  // iPhones and iPads report "Macintosh" in desktop mode; the device token
  // is the honest tell when it is there.
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) {
    const version = ua.match(/Android [\d.]+/);
    return version ? version[0].replace("And", "And") : "Android";
  }
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Ubuntu/.test(ua)) return "Ubuntu";
  if (/Fedora/.test(ua)) return "Fedora";
  if (/Linux/.test(ua)) return "Linux";
  return "";
}

/**
 * Where the request came from, as the edge reports it.
 *
 * Vercel and Cloudflare both stamp their geo headers before the request
 * reaches the app, so a sign-in's region costs nothing to read and no third
 * party learns anything. A plain reverse proxy forwards no such header, and
 * the result is simply null — no location is guessed from the address.
 */
export function locationFromHeaders(headers: Headers): string | null {
  const city = headers.get("x-vercel-ip-city") ?? headers.get("cf-ipcity");
  const country =
    headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");

  const decodedCity = city?.trim() ? safeDecode(city.trim()) : null;
  const trimmedCountry = country?.trim() ?? null;

  if (decodedCity && trimmedCountry) return `${decodedCity}, ${trimmedCountry}`;
  if (decodedCity) return decodedCity;
  if (trimmedCountry) return trimmedCountry;
  return null;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
