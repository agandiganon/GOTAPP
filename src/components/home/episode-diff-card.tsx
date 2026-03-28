"use client";
import { Skull, Swords, ArrowRightLeft } from "lucide-react";
import { characters, episodeIndex, factions } from "@/data/seed";
import { getVisibleCharacterSnapshots } from "@/lib/timeline";
import { getVisibleRelationshipWeb } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

export function EpisodeDiffCard() {
  const { currentEpisodeId, availableEpisodes } = useEpisode();

  const currentIdx = availableEpisodes.findIndex(e => e.id === currentEpisodeId);
  if (currentIdx <= 0) return null; // No previous episode to compare

  const prevEpisodeId = availableEpisodes[currentIdx - 1].id;

  const currentChars = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);
  const prevChars = getVisibleCharacterSnapshots(characters, prevEpisodeId, episodeIndex);

  // Find newly dead characters
  const newDeaths = currentChars.filter(c => {
    const prev = prevChars.find(p => p.id === c.id);
    return c.latestState.status === "dead" && prev?.latestState.status !== "dead";
  });

  // Find new characters that appeared
  const newAppearances = currentChars.filter(c => !prevChars.find(p => p.id === c.id));

  // Find changed relationships
  const currentRels = getVisibleRelationshipWeb(factions, currentEpisodeId, episodeIndex).filter(r => r.state !== "neutral");
  const prevRels = getVisibleRelationshipWeb(factions, prevEpisodeId, episodeIndex).filter(r => r.state !== "neutral");

  const changedRels = currentRels.filter(cr => {
    const key = [cr.sourceFactionId, cr.targetFactionId].sort().join("::");
    const prev = prevRels.find(pr => [pr.sourceFactionId, pr.targetFactionId].sort().join("::") === key);
    return !prev || prev.state !== cr.state;
  });

  if (newDeaths.length === 0 && newAppearances.length === 0 && changedRels.length === 0) return null;

  return (
    <div className="rounded-[22px] border border-amber-700/20 bg-amber-500/[0.04] p-4" dir="rtl">
      <p className="section-caption">
        מה השתנה מהפרק הקודם
      </p>
      <div className="space-y-2">
        {newDeaths.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#f7c4cb]">
            <Skull className="h-3.5 w-3.5" />
            <span>{newDeaths.map(c => c.name).join(", ")} — נפלו</span>
          </div>
        )}
        {newAppearances.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-200">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>{newAppearances.length} דמויות חדשות הופיעו</span>
          </div>
        )}
        {changedRels.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-[#cfe7f5]">
            <Swords className="h-3.5 w-3.5" />
            <span>{changedRels.length} שינויים ביחסי כוח</span>
          </div>
        )}
      </div>
    </div>
  );
}
