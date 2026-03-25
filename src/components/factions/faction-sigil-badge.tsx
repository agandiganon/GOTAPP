"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

import { getProxiedExternalImageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface FactionSigilBadgeProps {
  name: string;
  sigilUrl?: string | null;
  themeColor?: string | null;
  className?: string;
}

export function FactionSigilBadge({
  name,
  sigilUrl,
  themeColor = "#b28b53",
  className,
}: FactionSigilBadgeProps) {
  const resolvedSigilUrl = getProxiedExternalImageUrl(sigilUrl);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(!resolvedSigilUrl);

  useEffect(() => {
    if (!resolvedSigilUrl) {
      setIsLoaded(false);
      setHasImageError(true);
      return;
    }

    let cancelled = false;
    const probe = new window.Image();

    setIsLoaded(false);
    setHasImageError(false);

    probe.onload = () => {
      if (cancelled) {
        return;
      }

      setIsLoaded(true);
      setHasImageError(false);
    };

    probe.onerror = () => {
      if (cancelled) {
        return;
      }

      setIsLoaded(false);
      setHasImageError(true);
    };

    probe.src = resolvedSigilUrl;

    return () => {
      cancelled = true;
    };
  }, [resolvedSigilUrl]);

  const showImage = Boolean(resolvedSigilUrl) && !hasImageError;

  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-md",
        className,
      )}
      style={{
        borderColor: `${themeColor}55`,
        backgroundColor: `${themeColor}14`,
      }}
      title={name}
      aria-label={`סמל הבית של ${name}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSigilUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          draggable={false}
          className={cn(
            "h-full w-full object-contain p-1.5 transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          onError={() => {
            setIsLoaded(false);
            setHasImageError(true);
          }}
        />
      ) : null}

      <span
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          showImage && isLoaded ? "hidden" : "flex",
        )}
      >
        <Shield className="h-4.5 w-4.5 text-ink/85" strokeWidth={1.8} />
      </span>
    </span>
  );
}
