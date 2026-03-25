export function getProxiedExternalImageUrl(url: string | null | undefined) {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return "";
  }

  if (/^data:/i.test(normalizedUrl) || normalizedUrl.startsWith("/") || normalizedUrl.startsWith("./")) {
    return normalizedUrl;
  }

  if (/^https?:\/\//i.test(normalizedUrl)) {
    return `https://wsrv.nl/?url=${encodeURIComponent(normalizedUrl)}`;
  }

  return normalizedUrl;
}
