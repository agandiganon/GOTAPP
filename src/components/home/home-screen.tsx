"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, MapPinned, Shield, Sparkles, Swords } from "lucide-react";

import { EpisodeSelectorSheet } from "@/components/home/episode-selector-sheet";
import { Panel } from "@/components/ui/panel";
import {
  characters,
  episodeIndex,
  factions,
  locations,
  mapRegistry,
  timelineEvents,
} from "@/data/seed";
import { formatEpisodeLabel, getEpisodeHomeSummary } from "@/lib/episodes";
import {
  getVisibleCharacterSnapshots,
  getVisibleEvents,
  getVisibleFactionRankings,
  getVisibleLocationSnapshots,
  getVisibleMapPins,
} from "@/lib/timeline";
import { cn, isDefined } from "@/lib/utils";
import { useEpisode } from "@/providers/episode-provider";

const toneClasses = {
  neutral: "border-white/10 bg-white/5 text-ink",
  shift: "border-accent/20 bg-accent/10 text-accent",
  alert: "border-danger/20 bg-danger/10 text-[#f2c0c7]",
} as const;

export function HomeScreen() {
  const { availableEpisodes, currentEpisode, currentEpisodeId, setCurrentEpisodeId } = useEpisode();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);
  const visibleLocations = getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex);
  const factionRankings = getVisibleFactionRankings(factions, currentEpisodeId, episodeIndex);
  const visibleEvents = getVisibleEvents(timelineEvents, currentEpisodeId, episodeIndex);
  const visiblePins = getVisibleMapPins(mapRegistry, currentEpisodeId, episodeIndex);

  const focusCharacters = currentEpisode.focusCharacterIds
    .map((characterId) => visibleCharacters.find((character) => character.id === characterId))
    .filter(isDefined);

  const mainLocations = currentEpisode.mainLocationIds
    .map((locationId) => visibleLocations.find((location) => location.id === locationId))
    .filter(isDefined);

  const primaryLocation =
    visibleLocations.find((location) => location.id === currentEpisode.primaryLocationId) ?? null;

  const primaryPin =
    visiblePins.find((pin) => pin.storyLocationId === currentEpisode.primaryLocationId) ?? null;
  const hasPrimaryPinCoordinates =
    primaryPin?.imagePositionPercent.top != null && primaryPin.imagePositionPercent.left != null;

  const leadingFaction =
    factionRankings.find((entry) => entry.faction.id === currentEpisode.powerLeaderId) ??
    factionRankings[0];

  const recentEvents = visibleEvents
    .filter((event) => currentEpisode.recentEventIds.includes(event.id))
    .slice(-3)
    .reverse();

  const mainLocationLabels =
    currentEpisode.mainLocationLabels.length > 0
      ? currentEpisode.mainLocationLabels
      : mainLocations.map((location) => location.name);

  const applyEpisodeSelection = (episodeId: typeof currentEpisodeId) => {
    setCurrentEpisodeId(episodeId);
    setIsSelectorOpen(false);
  };

  const homeSummary = getEpisodeHomeSummary(currentEpisode);

  return (
    <>
      <section className="space-y-4">
        <Panel className="relative overflow-hidden p-5">
          <div className="absolute inset-0 bg-hero-glow opacity-70" />
          <div className="relative space-y-5">
            <div className="space-y-2">
              <p className="text-caption">לוח צפייה</p>
              <h1 className="max-w-[16ch] font-display text-3xl leading-tight text-ink">
                מלווה הצפייה של gotspoil
              </h1>
              <p className="text-sm leading-7 text-muted">
                בחר/י את נקודת הצפייה שלך, וקבלי תמונת מצב מדויקת, נקייה ונטולת ספוילרים.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/[0.08] bg-canvas/[0.32] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.25)]">
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isSelectorOpen}
                  aria-haspopup="dialog"
                  onClick={() => setIsSelectorOpen((current) => !current)}
                  className="group w-full rounded-[24px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 text-right transition duration-300 hover:border-accent/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-muted">בחירת פרק</p>
                      <p className="text-lg font-semibold text-ink">{formatEpisodeLabel(currentEpisode)}</p>
                      <p className="text-sm text-muted">
                        עונה {currentEpisode.season} · פרק {currentEpisode.episode}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-accent/20 bg-accent/[0.12] px-3 py-1 text-[0.68rem] font-medium text-accent">
                        מצב בטוח
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line/10 bg-white/[0.05] text-accent transition group-hover:bg-accent/[0.12]">
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 transition",
                            isSelectorOpen ? "rotate-180" : "group-hover:translate-y-0.5",
                          )}
                        />
                      </span>
                    </div>
                  </div>
                </button>

                <EpisodeSelectorSheet
                  isOpen={isSelectorOpen}
                  episodes={availableEpisodes}
                  currentEpisodeId={currentEpisodeId}
                  onClose={() => setIsSelectorOpen(false)}
                  onConfirm={applyEpisodeSelection}
                />
              </div>

              <div className="mt-3 rounded-[24px] border border-white/[0.06] bg-panel-strong/[0.68] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-caption">תקציר הפרק</p>
                    <h2 className="font-display text-2xl text-ink">{formatEpisodeLabel(currentEpisode)}</h2>
                    <p className="text-sm text-muted">
                      עונה {currentEpisode.season} · פרק {currentEpisode.episode}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 rounded-[20px] border border-white/[0.05] bg-canvas/[0.4] px-4 py-4">
                  <p className="text-sm leading-8 text-ink">{homeSummary}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {focusCharacters.map((character) => (
                    <span
                      key={character.id}
                      className="rounded-full border border-line/10 bg-white/5 px-3 py-1.5 text-xs text-muted"
                    >
                      {character.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-caption">מוקד מפה</p>
              <h2 className="font-display text-2xl text-ink">מוקד המפה</h2>
              <p className="text-sm leading-7 text-muted">
                {primaryLocation?.latestHistory?.summary ??
                  "לא הוגדר עדיין תיאור גלוי למיקום הזה בנקודת הזמן הנבחרת."}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/10 bg-white/5 text-accent">
              <MapPinned className="h-5 w-5" />
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-line/10">
            <Image
              src="/images/world-map.jpg"
              alt="מפת עולם מותאמת להצגת מוקדי עלילה"
              fill
              sizes="(max-width: 768px) 100vw, 430px"
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />

            {hasPrimaryPinCoordinates ? (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `${primaryPin.imagePositionPercent.top}%`,
                  left: `${primaryPin.imagePositionPercent.left}%`,
                }}
              >
                <div className="absolute inset-0 animate-pulse-soft rounded-full bg-accent/[0.35] blur-md" />
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-accent/25 bg-accent text-canvas shadow-accent">
                  <span className="block h-2.5 w-2.5 rounded-full bg-canvas" />
                </div>
              </div>
            ) : (
              <div className="absolute inset-x-4 top-4 rounded-[18px] border border-line/10 bg-canvas/60 px-4 py-2 text-xs text-muted backdrop-blur-md">
                כיול הסמן יתווסף לאחר מיקום ידני של הנקודה על המפה.
              </div>
            )}

            <div className="absolute inset-x-4 bottom-4 rounded-[18px] border border-line/10 bg-canvas/70 px-4 py-3 backdrop-blur-md">
              <p className="text-sm font-semibold text-ink">{primaryLocation?.name ?? "מיקום ראשי"}</p>
              <p className="mt-1 text-xs text-muted">
                {primaryLocation?.region ?? "האזור יוצג כאן לאחר קישור מלא לנתונים."}
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-caption">מאזן כוח</p>
              <h2 className="font-display text-2xl text-ink">מאזן הכוח הנוכחי</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          {leadingFaction ? (
            <div className="rounded-[24px] border border-accent/[0.15] bg-accent/[0.08] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">הכוח המוביל כרגע</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{leadingFaction.faction.displayName}</p>
                </div>
                <div className="rounded-full border border-accent/20 bg-canvas/[0.45] px-3 py-1 text-xs text-accent">
                  {leadingFaction.latestPower.power}%
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-accent to-[#f6dba4]"
                  style={{ width: `${leadingFaction.latestPower.power}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">{leadingFaction.latestPower.summary}</p>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {factionRankings.slice(0, 3).map((entry, index) => (
              <div
                key={entry.faction.id}
                className="rounded-[20px] border border-line/10 bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line/10 bg-canvas/60 text-xs text-muted">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{entry.faction.displayName}</p>
                      <p className="text-xs text-muted">{entry.latestPower.summary}</p>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-accent">{entry.latestPower.power}%</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-caption">אירועים אחרונים</p>
              <h2 className="font-display text-2xl text-ink">אירועים בולטים עד כאן</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-[#f2c0c7]">
              <Swords className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "rounded-[20px] border px-4 py-3",
                  toneClasses[event.tone],
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{event.title}</p>
                  <ArrowUpRight className="h-4 w-4 opacity-75" />
                </div>
                {event.description !== event.title ? (
                  <p className="mt-2 text-sm leading-7 text-muted">{event.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-caption">הקשר הפרק</p>
          <h2 className="mt-3 font-display text-2xl text-ink">מוקדי הפרק הפעיל</h2>

          <div className="mt-4 grid gap-4">
            <div className="rounded-[22px] border border-line/10 bg-white/5 p-4">
              <p className="text-xs text-muted">דמויות מרכזיות</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {focusCharacters.map((character) => (
                  <span
                    key={character.id}
                    className="rounded-full border border-line/10 bg-canvas/50 px-3 py-1.5 text-xs text-ink"
                  >
                    {character.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-line/10 bg-white/5 p-4">
              <p className="text-xs text-muted">מיקומים ראשיים</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mainLocationLabels.map((locationLabel) => (
                  <span
                    key={locationLabel}
                    className="rounded-full border border-line/10 bg-canvas/50 px-3 py-1.5 text-xs text-ink"
                  >
                    {locationLabel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </section>

    </>
  );
}
