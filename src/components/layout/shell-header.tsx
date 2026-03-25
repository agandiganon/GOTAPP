"use client";

import Image from "next/image";

import { useEpisode } from "@/providers/episode-provider";

export function ShellHeader() {
  const { currentEpisode } = useEpisode();

  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-line/10 bg-panel-strong/80 shadow-accent">
          <Image
            src="/icon.png"
            alt="לוגו gotspoil"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-1">
          <p className="text-caption">מלווה צפייה</p>
          <p className="font-display text-[1.55rem] leading-none text-ink">gotspoil</p>
        </div>
      </div>

      <div className="rounded-full border border-accent/25 bg-accent/10 px-3.5 py-2 text-sm font-medium text-accent">
        {currentEpisode.code}
      </div>
    </header>
  );
}
