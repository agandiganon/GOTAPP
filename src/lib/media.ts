/**
 * Returns a safe image URL for the given input:
 *
 * - Local paths (starting with / or ./) → returned as-is.
 * - data: URIs                           → returned as-is.
 * - External http/https URLs             → routed through /api/image-proxy
 *   so the browser never directly contacts the originating host.
 *   This defeats Wikia / Fandom hotlink-protection (403 Forbidden).
 */
export function getProxiedExternalImageUrl(url: string | null | undefined): string {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return "";
  }

  // Already local or data URI — use directly
  if (
    /^data:/i.test(normalizedUrl) ||
    normalizedUrl.startsWith("/") ||
    normalizedUrl.startsWith("./")
  ) {
    return normalizedUrl;
  }

  // Route all external http/https URLs through the server-side proxy
  if (/^https?:\/\//i.test(normalizedUrl)) {
    return `/api/image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }

  return normalizedUrl;
}
