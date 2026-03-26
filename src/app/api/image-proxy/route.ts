import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Image Proxy API Route
 *
 * Fetches external images server-side so the browser never contacts the
 * originating host directly. This defeats Wikia / Fandom hotlink-protection
 * (403 Forbidden) because the request arrives with the expected Referer header
 * and a standard browser User-Agent, not an anonymous cross-origin fetch.
 *
 * Usage:  /api/image-proxy?url=<encoded-absolute-url>
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Deny requests that look like SSRF attempts against internal hosts. */
function isInternalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("172.") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".local")
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing required `url` query parameter.", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid URL.", { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return new NextResponse("Only http/https URLs are supported.", { status: 400 });
  }

  if (isInternalHost(parsed.hostname)) {
    return new NextResponse("Requests to internal hosts are not allowed.", { status: 403 });
  }

  /**
   * Wikia/Fandom CDN: bare image paths (e.g. /images/…/File.jpg) now require
   * the "/revision/latest" suffix to return the actual file.  Without it the
   * CDN returns a 404 WebP placeholder.  We patch the URL here transparently
   * so existing data URLs continue to work without any data-layer changes.
   */
  let fetchUrl = rawUrl;
  if (
    (parsed.hostname.endsWith("wikia.nocookie.net") ||
      parsed.hostname.endsWith("fandom.com")) &&
    !parsed.pathname.includes("/revision/") &&
    !parsed.pathname.includes("/scale-to-width")
  ) {
    fetchUrl = rawUrl.replace(/\.(jpe?g|png|gif|webp|svg)(\?|$)/i, ".$1/revision/latest$2");
  }

  try {
    const upstream = await fetch(fetchUrl, {
      headers: {
        /**
         * Wikia/Fandom checks the Referer header.
         * Sending their own domain as the referrer satisfies hotlink checks.
         */
        Referer: "https://gameofthrones.fandom.com/",
        Origin: "https://gameofthrones.fandom.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // Next.js fetch extension: cache for 24 hours on the server
      next: { revalidate: 86_400 },
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

    // Guard: only pass image content types
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Upstream response is not an image.", { status: 502 });
    }

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        // Cache aggressively: 24 h in browser, 7 days stale-while-revalidate
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800, immutable",
      },
    });
  } catch (error) {
    console.error("[image-proxy] upstream fetch failed:", error);
    return new NextResponse("Failed to fetch upstream image.", { status: 502 });
  }
}
