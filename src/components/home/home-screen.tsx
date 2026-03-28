"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Flame, MapPin, Users } from "lucide-react";

import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { EpisodeDiffCard } from "@/components/home/episode-diff-card";
import { HeroPanel } from "@/components/home/hero-panel";
import { PowerBalancePanel } from "@/components/home/power-balance-panel";
import { RecentEventsPanel } from "@/components/home/recent-events-panel";
import { StatsPanel } from "@/components/home/stats-panel";
import { Panel } from "@/components/ui/panel";
import {
  characters,
  episodeIndex,
  factions,
  locations,
  mapRegistry,
  timelineEvents,
} from "@/data/seed";
import { resolveMapLocationController } from "@/lib/map-presentation";
import {
  getEpisodeFactionRankings,
  getVisibleCharacterSnapshots,
  getVisibleEvents,
  getVisibleLocationSnapshots,
  getVisibleMapPins,
} from "@/lib/timeline";
import { isDefined } from "@/lib/utils";
import { useEpisode } from "@/providers/episode-provider";

/* ─── Leaflet mini-map (SSR-disabled — Leaflet requires browser APIs) ─────── */
const HomeMiniMapCanvas = dynamic(
  () =>
    import("@/components/home/home-mini-map-canvas").then(
      (m) => m.HomeMiniMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-xs text-muted">
        טוען מפה…
      </div>
    ),
  },
);

const MAP_IMAGE_WIDTH = 1409;
const MAP_IMAGE_HEIGHT = 944;

function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [
    (MAP_IMAGE_HEIGHT * topPercent) / 100,
    (MAP_IMAGE_WIDTH * leftPercent) / 100,
  ];
}

export function HomeScreen() {
  const { availableEpisodes, currentEpisode, currentEpisodeId, setCurrentEpisodeId } =
    useEpisode();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  /* ── Anti-spoiler data — DO NOT TOUCH ─────────────────────────────────── */
  const visibleCharacters = useMemo(
    () => getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );
  const visibleLocations = useMemo(
    () => getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );
  const factionRankings = useMemo(
    () => getEpisodeFactionRankings(factions, currentEpisode),
    [currentEpisode],
  );
  const visibleEvents = useMemo(
    () => getVisibleEvents(timelineEvents, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );
  const visiblePins = useMemo(
    () => getVisibleMapPins(mapRegistry, currentEpisodeId, episodeIndex),
    [currentEpisodeId],
  );

  const focusCharacters = useMemo(
    () =>
      currentEpisode.focusCharacterIds
        .map((id) => visibleCharacters.find((c) => c.id === id))
        .filter(isDefined),
    [currentEpisode.focusCharacterIds, visibleCharacters],
  );

  const mainLocations = useMemo(
    () =>
      currentEpisode.mainLocationIds
        .map((id) => visibleLocations.find((l) => l.id === id))
        .filter(isDefined),
    [currentEpisode.mainLocationIds, visibleLocations],
  );

  const primaryLocation = useMemo(
    () => visibleLocations.find((l) => l.id === currentEpisode.primaryLocationId) ?? null,
    [currentEpisode.primaryLocationId, visibleLocations],
  );
  const primaryPin = useMemo(
    () => visiblePins.find((p) => p.storyLocationId === currentEpisode.primaryLocationId) ?? null,
    [currentEpisode.primaryLocationId, visiblePins],
  );
  const primaryControllerFaction = useMemo(
    () =>
      currentEpisode.primaryLocationId
        ? resolveMapLocationController(currentEpisode.primaryLocationId, factionRankings)
        : null,
    [currentEpisode.primaryLocationId, factionRankings],
  );
  const hasPrimaryPinCoordinates =
    primaryPin?.imagePositionPercent.top != null && primaryPin.imagePositionPercent.left != null;

  const recentEvents = useMemo(
    () =>
      visibleEvents
        .filter((e) => currentEpisode.recentEventIds.includes(e.id))
        .slice(-3)
        .reverse(),
    [currentEpisode.recentEventIds, visibleEvents],
  );
  const mainLocationLabels = useMemo(
    () =>
      currentEpisode.mainLocationLabels.length > 0
        ? currentEpisode.mainLocationLabels
        : mainLocations.map((l) => l.name),
    [currentEpisode.mainLocationLabels, mainLocations],
  );

  const primarySummary = useMemo(
    () =>
      primaryLocation?.latestHistory?.summary ??
      "המיקום הטקסטואלי מסונכרן לפרק הנוכחי — קואורדינטות מפה טרם הוגדרו.",
    [primaryLocation],
  );

  const applyEpisode = (id: typeof currentEpisodeId) => {
    setCurrentEpisodeId(id);
    setIsSelectorOpen(false);
  };
  /* ── End anti-spoiler block ───────────────────────────────────────────── */

  const focalColor = primaryControllerFaction?.themeColor ?? "rgb(205,164,94)";

  return (
    <>
      <section className="space-y-5 pb-24 md:pb-6" dir="rtl">
      {/* Hero panel with episode selector and progress */}
      <HeroPanel
        currentEpisode={currentEpisode}
        currentEpisodeId={currentEpisodeId}
        availableEpisodes={availableEpisodes}
        isSelectorOpen={isSelectorOpen}
        onSelectorToggle={setIsSelectorOpen}
        onEpisodeSelect={applyEpisode}
        focusCharacters={focusCharacters}
      />

      {/* Map widget */}
      <Panel
        key={`map-${currentEpisodeId}`}
        className="overflow-hidden episode-content-fade"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-700/35 px-5 py-4">
          <div className="space-y-1.5">
            <p className="text-caption">זירת הפרק</p>
            <h2 className="font-display text-2xl leading-tight text-ink">
              {primaryLocation?.name
                ? `${primaryLocation.name} — מוקד הפרק`
                : "מוקד הפרק"}
            </h2>
            {primaryLocation?.region && (
              <p className="text-xs text-stone-400">
                {primaryLocation.region}
                {primaryControllerFaction
                  ? ` · בשליטת ${primaryControllerFaction.displayName}`
                  : ""}
              </p>
            )}
          </div>
          {primaryControllerFaction ? (
            <FactionSigilBadge
              name={primaryControllerFaction.displayName}
              sigilUrl={
                primaryControllerFaction.factionSigilUrl ??
                primaryControllerFaction.sigil
              }
              themeColor={primaryControllerFaction.themeColor}
              className="h-11 w-11 shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-700/30 bg-amber-500/[0.10] text-amber-300">
              <MapPin className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="p-4 pb-0">
          <div
            className="overflow-hidden rounded-[22px] border border-[#3c4664]/38"
            style={{
              background: "linear-gradient(180deg, rgba(16,20,32,0.97), rgba(8,10,16,1))",
              boxShadow: `0 20px 56px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(203,165,92,0.06)`,
            }}
          >
            <div className="p-2">
              <div dir="ltr" className="relative h-56 overflow-hidden rounded-[18px] sm:h-64">
                {hasPrimaryPinCoordinates ? (
                  <HomeMiniMapCanvas
                    center={toMapPoint(
                      primaryPin.imagePositionPercent.top!,
                      primaryPin.imagePositionPercent.left!,
                    )}
                    markerColor={focalColor}
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center text-center"
                    style={{ background: "rgba(8,10,16,0.92)" }}
                  >
                    <div className="space-y-2 px-6">
                      <MapPin className="mx-auto h-6 w-6 text-amber-500/40" />
                      <p className="text-xs text-muted">
                        קואורדינטות מפה טרם הוגדרו למיקום זה
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className="pointer-events-none absolute inset-0 rounded-[18px]"
                  style={{
                    background:
                      "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 48%, rgba(4,6,14,0.55) 82%, rgba(4,6,14,0.80) 100%)",
                  }}
                />

                <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-[#3c4664]/42 bg-[#080a10]/78 px-2.5 py-1.5 backdrop-blur-md">
                  <Flame className="h-3 w-3 text-amber-400/80" />
                  <span className="text-[0.62rem] font-semibold tracking-wide text-amber-200/80">
                    זירת הפרק
                  </span>
                </div>

                {primaryLocation && (
                  <div
                    className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-[8px] border px-2 py-1 backdrop-blur-sm"
                    style={{
                      borderColor: `${focalColor}45`,
                      background: "rgba(8,10,16,0.82)",
                    }}
                  >
                    <p className="text-[0.68rem] font-semibold" style={{ color: focalColor }}>
                      {primaryLocation.name}
                    </p>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-amber-700/[0.12]" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-3">
          <div
            className="rounded-[20px] border border-[#3c4664]/40 p-4 backdrop-blur-sm"
            style={{ background: "rgba(14,18,28,0.72)" }}
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent/50">
              תיאור המיקום
            </p>
            <p className="mt-2 text-sm leading-7 text-ink">{primarySummary}</p>
            {!hasPrimaryPinCoordinates && (
              <p className="mt-2 text-xs text-muted">
                ※ קואורדינטות מפה טרם הוגדרו למיקום זה — הסמן יופיע לאחר עדכון הנתונים.
              </p>
            )}
          </div>
        </div>
      </Panel>

      {/* Statistics dashboard */}
      <StatsPanel
        visibleCharacters={visibleCharacters}
        visibleLocations={visibleLocations}
        factions={factions}
      />

      {/* Episode diff card */}
      <EpisodeDiffCard />

      {/* Power balance panel */}
      <PowerBalancePanel
        factionRankings={factionRankings}
        currentEpisodeId={currentEpisodeId}
      />

      {/* Recent events panel */}
      <RecentEventsPanel
        recentEvents={recentEvents}
        currentEpisodeId={currentEpisodeId}
      />

      {/* Episode context panel */}
      <Panel key={`context-${currentEpisodeId}`} className="p-5 episode-content-fade">
        <p className="text-caption">הקשר הפרק</p>
        <h2 className="mt-1.5 font-display text-2xl text-ink">מוקדי הפרק הפעיל</h2>

        <div className="mt-4 grid gap-3">
          <div
            className="rounded-[20px] border border-stone-700/35 p-4"
            style={{ background: "rgba(16,20,32,0.68)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-amber-400/70" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
                דמויות מרכזיות
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusCharacters.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-stone-700/38 bg-stone-900/60 px-3 py-1.5 text-xs font-medium text-stone-200"
                >
                  {c.name}
                </span>
              ))}
              {focusCharacters.length === 0 && (
                <span className="text-xs text-muted">לא הוגדרו דמויות ממוקדות.</span>
              )}
            </div>
          </div>

          <div
            className="rounded-[20px] border border-stone-700/35 p-4"
            style={{ background: "rgba(16,20,32,0.68)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-amber-400/70" />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
                מיקומים ראשיים
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {mainLocationLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-stone-700/38 bg-stone-900/60 px-3 py-1.5 text-xs font-medium text-stone-200"
                >
                  {label}
                </span>
              ))}
              {mainLocationLabels.length === 0 && (
                <span className="text-xs text-muted">לא הוגדרו מיקומים.</span>
              )}
            </div>
          </div>
        </div>
      </Panel>
      </section>
    </>
  );
}
