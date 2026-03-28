"use client";

import { Users, Sparkles } from "lucide-react";

import type { EpisodeRecord, CharacterRecord, CharacterTimelineEntry } from "@/data/schemas";
import { getEpisodeHomeSummary } from "@/lib/episodes";
import { useMemo } from "react";

type CharacterSnapshot = CharacterRecord & { latestState: CharacterTimelineEntry };

interface EpisodeSummaryCardProps {
  currentEpisode: EpisodeRecord;
  focusCharacters: CharacterSnapshot[];
}

export function EpisodeSummaryCard({
  currentEpisode,
  focusCharacters,
}: EpisodeSummaryCardProps) {
  const homeSummary = useMemo(() => getEpisodeHomeSummary(currentEpisode), [currentEpisode]);

  return (
    <div className="rounded-[26px] border border-stone-700/38 bg-stone-950/42 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-700/35 bg-amber-500/[0.10] text-amber-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-caption">תקציר הפרק</p>
        </div>
        <span className="rounded-full border border-stone-700/35 bg-stone-900/55 px-2.5 py-0.5 text-[0.65rem] text-stone-400">
          {currentEpisode.code}
        </span>
      </div>

      <p className="text-sm leading-8 text-stone-200">{homeSummary}</p>

      {/* Focus character chips */}
      {focusCharacters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {focusCharacters.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-700/35 bg-stone-900/55 px-3 py-1.5 text-xs font-medium text-ink"
            >
              <Users className="h-3 w-3 text-amber-400/60" />
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
