"use client";

import { BookOpenText, ChevronDown, MapPinned, Sparkles, UsersRound } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, locations } from "@/data/seed";
import { getVisibleCharacterSnapshots, getVisibleLocationSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

export function SummaryScreen() {
  const { availableEpisodes, currentEpisode, currentEpisodeId } = useEpisode();

  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);
  const visibleLocations = getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex);

  const focusCharacters = currentEpisode.focusCharacters
    .map((entry) => ({
      ...entry,
      character: visibleCharacters.find((character) => character.id === entry.characterId) ?? null,
    }));

  const mainLocations = currentEpisode.mainLocationIds.map((locationId) =>
    visibleLocations.find((location) => location.id === locationId) ?? null,
  );

  const archiveEpisodes = availableEpisodes
    .filter((episode) => (episodeIndex[episode.id] ?? -1) < (episodeIndex[currentEpisodeId] ?? -1))
    .slice()
    .reverse();

  return (
    <section className="space-y-4">
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-60" />
        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-caption">תקציר</p>
            <h1 className="font-display text-3xl text-ink">
              {currentEpisode.code} · {currentEpisode.title}
            </h1>
            <p className="text-sm leading-7 text-muted">{currentEpisode.summaries.snapshot}</p>
          </div>

          <div className="rounded-[24px] border border-line/10 bg-canvas/45 p-4">
            <p className="text-xs text-muted">התקציר המלא</p>
            <p className="mt-3 text-sm leading-8 text-ink">{currentEpisode.summaries.full}</p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">מבט ממוקד</p>
            <h2 className="font-display text-2xl text-ink">דמויות במוקד</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <UsersRound className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {focusCharacters.map((entry) => (
            <div key={entry.characterId} className="rounded-[24px] border border-line/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-ink">
                    {entry.character?.name ?? entry.characterId}
                  </p>
                  <p className="text-sm leading-7 text-muted">{entry.summary}</p>
                </div>
                {entry.character ? (
                  <StatusPill
                    status={entry.character.latestState.status}
                    label={entry.character.latestState.statusLabel}
                  />
                ) : null}
              </div>

              {entry.character ? (
                <p className="mt-3 text-sm leading-7 text-muted">{entry.character.latestState.summary}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">זירות הפרק</p>
            <h2 className="font-display text-2xl text-ink">מיקומים ראשיים</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/10 bg-white/5 text-accent">
            <MapPinned className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {currentEpisode.mainLocationLabels.map((label, index) => {
            const location = mainLocations[index];

            return (
              <div key={label} className="rounded-[24px] border border-line/10 bg-white/5 p-4">
                <p className="text-lg font-semibold text-ink">{label}</p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {location?.latestHistory?.summary ??
                    "הפרק מציין את המיקום הזה במפורש, אך טרם חוברה לו היסטוריה טקסטואלית נפרדת."}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">נקודות מפנה</p>
            <h2 className="font-display text-2xl text-ink">נקודות מפנה</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-[#f7c4cb]">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {currentEpisode.turningPoints.map((turningPoint, index) => (
            <div key={turningPoint.id} className="rounded-[24px] border border-line/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line/10 bg-canvas/60 text-xs text-muted">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-ink">{turningPoint.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">ארכיון בטוח</p>
            <h2 className="font-display text-2xl text-ink">ארכיון פרקים קודמים</h2>
            <p className="text-sm leading-7 text-muted">
              הרשימה כוללת רק פרקים שקודמים לפרק הפעיל. שום תוכן עתידי לא נכלל כאן.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <BookOpenText className="h-5 w-5" />
          </div>
        </div>

        {archiveEpisodes.length === 0 ? (
          <div className="rounded-[24px] border border-line/10 bg-white/5 p-4 text-sm leading-7 text-muted">
            אין עדיין ארכיון קודם לפני {currentEpisode.code}.
          </div>
        ) : (
          <div className="space-y-3">
            {archiveEpisodes.map((episode) => (
              <details
                key={episode.id}
                className="group rounded-[24px] border border-line/10 bg-white/5 p-4 open:bg-canvas/45"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-ink">
                      {episode.code} · {episode.title}
                    </p>
                    <p className="text-sm leading-7 text-muted">{episode.summaries.snapshot}</p>
                  </div>
                  <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" />
                </summary>

                <div className="mt-4 space-y-4 border-t border-line/10 pt-4">
                  <p className="text-sm leading-8 text-ink">{episode.summaries.full}</p>

                  <div className="flex flex-wrap gap-2">
                    {episode.turningPoints.map((turningPoint) => (
                      <span
                        key={turningPoint.id}
                        className="rounded-full border border-line/10 bg-white/5 px-3 py-1.5 text-xs text-muted"
                      >
                        {turningPoint.summary}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}
