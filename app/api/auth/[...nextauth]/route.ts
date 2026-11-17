import { NextRequest } from "next/server";

import { handlers } from "@/lib/auth";
import { env } from "@/lib/env";

/**
 * Pins every auth redirect to the site's own origin.
 *
 * The route handler sees whatever origin the platform handed the request to,
 * and behind a reverse proxy that is not always the public one — Next.js then
 * reports `localhost:3000` as the origin, and NextAuth answers sign-out with
 * it, sending the browser to the internal address. Rewriting the request URL
 * to the configured `APP_URL` keeps sign-out (and any other auth redirect) on
 * the site itself. It is the app's own validated setting, never something a
 * client could spoof, so no host header is trusted here.
 */
function withAppOrigin(request: NextRequest): NextRequest {
  const appOrigin = new URL(env().APP_URL).origin;
  const { origin, href } = request.nextUrl;
  if (origin === appOrigin) return request;
  return new NextRequest(href.replace(origin, appOrigin), request);
}

export async function GET(request: NextRequest): Promise<Response> {
  return handlers.GET(withAppOrigin(request));
}

export async function POST(request: NextRequest): Promise<Response> {
  return handlers.POST(withAppOrigin(request));
}
