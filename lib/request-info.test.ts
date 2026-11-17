import { describe, expect, it } from "vitest";

import { deviceLabel, locationFromHeaders } from "./request-info";

describe("deviceLabel", () => {
  it("names browser and version on desktop platforms", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      ),
    ).toBe("Chrome 126 on Windows 10/11");
    expect(
      deviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      ),
    ).toBe("Safari 17 on macOS");
    expect(
      deviceLabel(
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
      ),
    ).toBe("Firefox 125 on Ubuntu");
  });

  it("keeps Chromium forks apart", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
      ),
    ).toBe("Edge 126 on Windows 10/11");
  });

  it("names phones, including an iPad in desktop mode", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari 17 on iPhone");
    expect(
      deviceLabel(
        "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari 17 on iPad");
    expect(
      deviceLabel(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe("Chrome 126 on Android 14");
  });

  it("falls back quietly for unknown agents", () => {
    expect(deviceLabel("")).toBe("Unknown device");
    expect(deviceLabel("unknown device")).toBe("Unknown device");
    expect(deviceLabel("some-curl/8.1")).toBe("Unknown device");
  });
});

describe("locationFromHeaders", () => {
  it("reads the Vercel geo headers", () => {
    const headers = new Headers({
      "x-vercel-ip-city": "Nairobi",
      "x-vercel-ip-country": "KE",
    });
    expect(locationFromHeaders(headers)).toBe("Nairobi, KE");
  });

  it("falls back to the Cloudflare headers", () => {
    const headers = new Headers({ "cf-ipcountry": "KE" });
    expect(locationFromHeaders(headers)).toBe("KE");
  });

  it("decodes percent-encoded city names", () => {
    const headers = new Headers({
      "x-vercel-ip-city": "Frankfurt%20am%20Main",
      "x-vercel-ip-country": "DE",
    });
    expect(locationFromHeaders(headers)).toBe("Frankfurt am Main, DE");
  });

  it("returns null when no geo headers exist", () => {
    expect(locationFromHeaders(new Headers())).toBeNull();
  });
});
