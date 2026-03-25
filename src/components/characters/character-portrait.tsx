"use client";

import { useEffect, useMemo, useState } from "react";

import { getProxiedExternalImageUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface CharacterPortraitProps {
  name: string;
  imageUrl: string | null;
  factionColor?: string | null;
  className?: string;
}

function hashString(value: string) {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const hexValue =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const value = Number.parseInt(hexValue, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function shiftHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

  return `#${[r, g, b]
    .map((channel) => clamp(channel + amount).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${r},${g},${b},${alpha})`;
}

function buildPortraitSvg(name: string, accent: string) {
  const seed = hashString(name);
  const headX = 180 + ((seed % 7) - 3) * 4;
  const headY = 176 + ((seed >> 3) % 8);
  const headRx = 48 + ((seed >> 4) % 6);
  const headRy = 60 + ((seed >> 6) % 6);
  const shoulderY = 314 + ((seed >> 8) % 14);
  const shoulderWidth = 118 + ((seed >> 11) % 30);
  const chestCurve = 252 + ((seed >> 14) % 24);
  const haloX = 90 + ((seed >> 5) % 180);
  const haloY = 90 + ((seed >> 7) % 80);
  const secondaryHaloX = 260 - ((seed >> 9) % 110);
  const secondaryHaloY = 78 + ((seed >> 10) % 70);
  const hairLift = 22 + ((seed >> 12) % 16);

  const frame = rgba(shiftHex(accent, 34), 0.24);
  const glow = rgba(accent, 0.16);
  const glowSoft = rgba(shiftHex(accent, 24), 0.08);
  const backgroundTop = shiftHex(accent, -128);
  const backgroundMid = shiftHex(accent, -168);
  const backgroundBottom = "#080910";
  const silhouette = shiftHex(accent, -184);
  const silhouetteSoft = shiftHex(accent, -150);
  const highlight = rgba(shiftHex(accent, 32), 0.22);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 460" fill="none">
      <defs>
        <linearGradient id="bg" x1="180" y1="0" x2="180" y2="460" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${backgroundTop}" />
          <stop offset="52%" stop-color="${backgroundMid}" />
          <stop offset="100%" stop-color="${backgroundBottom}" />
        </linearGradient>
        <linearGradient id="mist" x1="180" y1="120" x2="180" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="${rgba("#ffffff", 0.10)}" />
          <stop offset="100%" stop-color="${rgba("#ffffff", 0)}" />
        </linearGradient>
      </defs>

      <rect width="360" height="460" rx="34" fill="url(#bg)" />
      <circle cx="${haloX}" cy="${haloY}" r="102" fill="${glow}" />
      <circle cx="${secondaryHaloX}" cy="${secondaryHaloY}" r="74" fill="${glowSoft}" />
      <path d="M0 378C72 342 136 334 194 352C248 368 304 388 360 360V460H0V378Z" fill="${rgba(
        silhouetteSoft,
        0.5,
      )}" />
      <path d="M${180 - shoulderWidth} ${shoulderY}C${120 - shoulderWidth / 3} ${chestCurve} 116 ${chestCurve - 34} ${headX} ${
        headY + headRy - 4
      }C244 ${chestCurve - 34} ${240 + shoulderWidth / 3} ${chestCurve} ${180 + shoulderWidth} ${shoulderY}L332 460H28L${
        180 - shoulderWidth
      } ${shoulderY}Z" fill="${silhouetteSoft}" />
      <ellipse cx="${headX}" cy="${headY}" rx="${headRx}" ry="${headRy}" fill="${silhouette}" />
      <path d="M${headX - headRx} ${headY - 4}C${headX - headRx + 10} ${headY - hairLift} ${headX - 8} ${
        headY - headRy - 10
      } ${headX + 6} ${headY - headRy + 4}C${headX + headRx - 8} ${headY - headRy + 12} ${headX + headRx} ${
        headY - 6
      } ${headX + headRx} ${headY + 8}V${headY + 22}C${headX + 18} ${headY + 8} ${headX - 10} ${headY + 10} ${
        headX - headRx
      } ${headY + 16}V${headY - 4}Z" fill="${silhouetteSoft}" />
      <path d="M${headX - headRx - 22} ${shoulderY - 30}C${headX - headRx - 10} ${shoulderY - 88} ${headX - 16} ${
        headY + 62
      } ${headX} ${headY + 72}C${headX + 18} ${headY + 62} ${headX + headRx + 8} ${shoulderY - 92} ${headX + headRx + 24} ${
        shoulderY - 26
      }L${headX + shoulderWidth - 12} ${shoulderY + 32}C${headX + 64} ${shoulderY + 6} ${headX - 62} ${
        shoulderY + 6
      } ${headX - shoulderWidth + 12} ${shoulderY + 34}L${headX - headRx - 22} ${shoulderY - 30}Z" fill="${silhouette}" />
      <path d="M46 54C92 36 138 26 182 26C230 26 274 36 314 54" stroke="${frame}" stroke-width="1.5" stroke-linecap="round" />
      <rect x="18" y="18" width="324" height="424" rx="28" stroke="${frame}" />
      <path d="M34 378C102 396 164 406 220 406C272 406 310 398 326 392" stroke="${highlight}" stroke-width="1.5" stroke-linecap="round" />
      <rect y="0" width="360" height="460" rx="34" fill="url(#mist)" opacity="0.32" />
    </svg>
  `.trim();
}

function getPortraitSrc(name: string, accent: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildPortraitSvg(name, accent))}`;
}

export function CharacterPortrait({
  name,
  imageUrl,
  factionColor = "#8ea7cf",
  className,
}: CharacterPortraitProps) {
  const fallbackSrc = useMemo(
    () => getPortraitSrc(name, factionColor ?? "#8ea7cf"),
    [factionColor, name],
  );
  const candidateSrc = useMemo(
    () => getProxiedExternalImageUrl(imageUrl),
    [imageUrl],
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(!candidateSrc);

  useEffect(() => {
    if (!candidateSrc) {
      setIsLoaded(false);
      setHasLoadError(true);
      return;
    }

    let cancelled = false;
    const probe = new window.Image();

    setIsLoaded(false);
    setHasLoadError(false);

    probe.onload = () => {
      if (cancelled) {
        return;
      }

      setIsLoaded(true);
      setHasLoadError(false);
    };

    probe.onerror = () => {
      if (cancelled) {
        return;
      }

      setIsLoaded(false);
      setHasLoadError(true);
    };

    probe.src = candidateSrc;

    return () => {
      cancelled = true;
    };
  }, [candidateSrc]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        alt={`דיוקן סמלי של ${name}`}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-cover"
      />
      {!hasLoadError && candidateSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidateSrc}
          alt=""
          loading="lazy"
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
          onError={() => {
            setIsLoaded(false);
            setHasLoadError(true);
          }}
        />
      ) : null}
    </div>
  );
}
