"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { QuizContent } from "@/components/quiz/quiz-content";
import { Panel } from "@/components/ui/panel";
import {
  characters,
  episodeIndex,
  factions,
  locations,
} from "@/data/seed";
import {
  getVisibleCharacterSnapshots,
  getVisibleLocationSnapshots,
} from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

export default function QuizPage() {
  const { currentEpisode, currentEpisodeId } = useEpisode();

  /* ── Anti-spoiler data — DO NOT TOUCH ─────────────────────────────────── */
  const visibleCharacters = useMemo(
    () => getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );
  const visibleLocations = useMemo(
    () => getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );

  return (
    <section className="space-y-5 pb-24 md:pb-6" dir="rtl">
      {/* Header */}
      <Panel className="p-5 episode-content-fade">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption text-stone-500">מבחן ידע</p>
            <h1 className="font-display text-3xl text-ink">חידון הממלכות</h1>
            <p className="text-sm text-stone-300 mt-2">
              בחן את ידיעתך לגבי הפרק {currentEpisode.code}
            </p>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(210,168,90,0.15)",
              border: "1px solid rgba(210,168,90,0.3)",
            }}
          >
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
        </div>
      </Panel>

      {/* Quiz Content */}
      <div className="px-4">
        <QuizContent
          visibleCharacters={visibleCharacters}
          visibleLocations={visibleLocations}
          factions={factions}
          currentEpisode={currentEpisode}
        />
      </div>
    </section>
  );
}
