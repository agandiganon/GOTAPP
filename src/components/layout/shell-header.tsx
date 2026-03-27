"use client";

import Image from "next/image";

import { useEpisode } from "@/providers/episode-provider";

export function ShellHeader() {
  const { currentEpisode } = useEpisode();

  return (
    <header className="shell-header-bar mb-7 flex items-center justify-between gap-4 pb-5">

      {/* Left — logo + wordmark ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3.5">

        {/* Logo tile */}
        <div className="shell-logo-tile h-12 w-12">
          <Image
            src="/icon.png"
            alt="לוגו gotspoil"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>

        {/* Wordmark */}
        <div>
          <p className="text-caption mb-0.5">מלווה צפייה</p>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.55rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              lineHeight: 1,
              color: "rgba(225,190,110,0.96)",
              textShadow:
                "0 1px 14px rgba(200,158,82,0.32), 0 0 40px rgba(200,158,82,0.12)",
            }}
          >
            gotspoil
          </p>
        </div>
      </div>

      {/* Right — current episode badge ─────────────────────────────────── */}
      <div className="episode-badge">
        {currentEpisode.code}
      </div>

    </header>
  );
}
