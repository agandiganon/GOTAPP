"use client";

import { useMemo, useState } from "react";

import { getProxiedExternalImageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface CharacterPortraitProps {
  name: string;
  imageUrl: string | null;
  factionColor?: string | null;
  className?: string;
}

/**
 * Heraldic crown SVG — shown whenever a real portrait is unavailable.
 * The crown is faction-tinted so each "unknown" character still feels
 * thematically grounded in their house.
 */
function HeraldicCrestFallback({ factionColor }: { factionColor: string }) {
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 65% 55% at 50% 28%, ${factionColor}28, transparent 68%),
          radial-gradient(ellipse 100% 80% at 50% 100%, rgba(0,0,0,0.55), transparent 70%),
          linear-gradient(160deg, rgba(18,22,36,0.98) 0%, rgba(8,10,16,1) 100%)
        `,
      }}
    >
      {/* Subtle radial texture ring */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            repeating-conic-gradient(
              from 0deg at 50% 42%,
              transparent 0deg,
              transparent 12deg,
              rgba(255,240,200,0.018) 13deg,
              transparent 14deg
            )
          `,
        }}
      />

      {/* Crown SVG — centred, faction-tinted */}
      <svg
        viewBox="0 0 64 72"
        width="60"
        height="68"
        fill="none"
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
        style={{
          color: `color-mix(in srgb, ${factionColor} 55%, rgba(230,215,185,0.55))`,
          filter: `drop-shadow(0 0 14px ${factionColor}40)`,
        }}
      >
        {/* Crown — five-pointed */}
        <path
          d="M10 46 L10 35 L17 23 L24 33 L32 14 L40 33 L47 23 L54 35 L54 46 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill={`${factionColor}14`}
          opacity="0.75"
        />
        {/* Crown base band */}
        <rect
          x="10" y="46" width="44" height="5" rx="2.5"
          stroke="currentColor"
          strokeWidth="1.3"
          fill={`${factionColor}10`}
          opacity="0.65"
        />
        {/* Centre jewel */}
        <circle cx="32" cy="22" r="3.2" fill="currentColor" opacity="0.45" />
        {/* Left jewel */}
        <circle cx="18" cy="33" r="2.2" fill="currentColor" opacity="0.32" />
        {/* Right jewel */}
        <circle cx="46" cy="33" r="2.2" fill="currentColor" opacity="0.32" />

        {/* Decorative horizontal divider beneath crown */}
        <line x1="16" y1="56" x2="48" y2="56" stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
        <line x1="20" y1="59" x2="44" y2="59" stroke="currentColor" strokeWidth="0.5" opacity="0.14" />
      </svg>

      {/* Name initial — large, ghosted */}
      {/* Deliberately omitted so it doesn't compete with real portraits */}
    </div>
  );
}

export function CharacterPortrait({
  name,
  imageUrl,
  factionColor = "#a07840",
  className,
}: CharacterPortraitProps) {
  const safeFactionColor = factionColor ?? "#a07840";

  const candidateSrc = useMemo(() => getProxiedExternalImageUrl(imageUrl), [imageUrl]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(!candidateSrc);

  const showImage = Boolean(candidateSrc) && !hasLoadError;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Fallback — always rendered; hidden by the real image once loaded */}
      <HeraldicCrestFallback factionColor={safeFactionColor} />

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidateSrc}
          alt={name}
          loading="lazy"
          draggable={false}
          className={cn(
            "character-portrait-img absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition: "center 18%" }}
          onLoad={() => {
            setIsLoaded(true);
            setHasLoadError(false);
          }}
          onError={() => {
            setIsLoaded(false);
            setHasLoadError(true);
          }}
        />
      )}
    </div>
  );
}
