"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

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
  const [hasImageError, setHasImageError] = useState(false);
  const shouldRenderImage = Boolean(sigilUrl) && !hasImageError;
  const resolvedSigilUrl = shouldRenderImage ? (sigilUrl ?? undefined) : undefined;

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
      {resolvedSigilUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSigilUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          draggable={false}
          className="h-full w-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : null}

      <span
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center",
          shouldRenderImage ? "hidden" : "flex",
        )}
      >
        <Shield className="h-4.5 w-4.5 text-ink/85" strokeWidth={1.8} />
      </span>
    </span>
  );
}
