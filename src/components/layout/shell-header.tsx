"use client";

import Image from "next/image";

import { useEpisode } from "@/providers/episode-provider";

export function ShellHeader() {
  const { currentEpisode } = useEpisode();

  return (
    <header className="mb-6 flex items-center justify-between gap-4">

      {/* Left — logo + wordmark */}
      <div className="flex items-center gap-3">
        {/* Logo tile */}
        <div
          className="relative h-12 w-12 overflow-hidden rounded-2xl border border-amber-700/25 shadow-[0_8px_28px_rgba(203,165,92,0.14),inset_0_1px_0_rgba(255,245,215,0.08)]"
          style={{ background: "linear-gradient(160deg, rgba(42,33,23,0.95), rgba(16,12,9,1))" }}
        >
          <Image
            src="/icon.png"
            alt="לוגו gotspoil"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
          {/* Subtle top-sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
        </div>

        {/* Wordmark */}
        <div className="space-y-0.5">
          <p className="text-caption">מלווה צפייה</p>
          <p
            className="font-display leading-none text-ink"
            style={{
              fontSize: "1.55rem",
              textShadow: "0 1px 12px rgba(203,165,92,0.18)",
            }}
          >
            gotspoil
          </p>
        </div>
      </div>

      {/* Right — current episode badge */}
      <div
        className="rounded-full border border-amber-700/30 px-3.5 py-2 text-sm font-semibold text-amber-200 backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(203,165,92,0.13), rgba(130,90,42,0.08))",
          boxShadow: "0 4px 16px rgba(203,165,92,0.10), inset 0 1px 0 rgba(255,245,215,0.07)",
        }}
      >
        {currentEpisode.code}
      </div>
    </header>
  );
}
