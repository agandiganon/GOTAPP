"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Compass, Crown, MapPinned } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { episodeIndex, factions, locations, mapRegistry } from "@/data/seed";
import { getMapPinKind, resolveMapLocationController } from "@/lib/map-presentation";
import { getEpisodeFactionRankings, getVisibleLocationSnapshots, getVisibleMapPins } from "@/lib/timeline";
import { isDefined } from "@/lib/utils";
import { useEpisode } from "@/providers/episode-provider";

const FantasyMapCanvas = dynamic(
  () => import("@/components/map/fantasy-map-canvas").then((module) => module.FantasyMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        טוען שכבת מפה אינטראקטיבית…
      </div>
    ),
  },
);

export function MapScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const [requestedLocationId, setRequestedLocationId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestedLocationId(params.get("location"));
  }, []);

  const visibleLocations = getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex);
  const visiblePins = getVisibleMapPins(mapRegistry, currentEpisodeId, episodeIndex);
  const factionRankings = getEpisodeFactionRankings(factions, currentEpisode);

  const mapPins = visiblePins
    .map((pin) => {
      const location = visibleLocations.find((candidate) => candidate.id === pin.storyLocationId);

      if (
        !location ||
        pin.imagePositionPercent.top == null ||
        pin.imagePositionPercent.left == null
      ) {
        return null;
      }

      const controllerFaction = resolveMapLocationController(location.id, factionRankings);

      return {
        id: location.id,
        name: location.name,
        region: location.region,
        summary: location.latestHistory.summary,
        topPercent: pin.imagePositionPercent.top,
        leftPercent: pin.imagePositionPercent.left,
        isPrimary: location.id === currentEpisode.primaryLocationId,
        isFocused: location.id === requestedLocationId,
        kind: getMapPinKind(location.id),
        controllerFaction: controllerFaction
          ? {
              id: controllerFaction.id,
              name: controllerFaction.displayName,
              themeColor: controllerFaction.themeColor,
              sigilUrl: controllerFaction.factionSigilUrl ?? controllerFaction.sigil,
            }
          : null,
      };
    })
    .filter(isDefined);

  const primaryLocationLabel =
    visibleLocations.find((location) => location.id === currentEpisode.primaryLocationId)?.name ??
    "לא זמין";

  const focusedLocation = requestedLocationId
    ? mapPins.find((pin) => pin.id === requestedLocationId) ?? null
    : null;

  return (
    <section className="space-y-4 pb-24 md:pb-6">
      <Panel className="relative overflow-hidden p-5 md:p-6">
        <div className="absolute inset-0 bg-hero-glow opacity-55" />
        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-caption">מפה</p>
            <h1 className="font-display text-3xl text-ink">אטלס ווסטרוז ואסוס</h1>
            <p className="max-w-[42ch] text-sm leading-7 text-muted">
              המפה מגיבה לפרק הפעיל בלבד, עם סמנים דינמיים, שליטה חלקה, וחיווי עדין על מוקדי כוח
              מרכזיים בעולם.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="text-xs text-muted">לוקיישנים גלויים</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{visiblePins.length}</p>
            </div>
            <div className="rounded-[24px] border border-accent/15 bg-accent/[0.08] p-4 backdrop-blur-md">
              <p className="text-xs text-[#f1ddb2]">מופיעים על המפה</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{mapPins.length}</p>
            </div>
            <div className="rounded-[24px] border border-[#7e97b3]/[0.18] bg-[#7e97b3]/[0.10] p-4 backdrop-blur-md">
              <p className="text-xs text-[#d5e1ec]">מוקד הפרק</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{primaryLocationLabel}</p>
            </div>
          </div>

          {focusedLocation ? (
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-muted">פוקוס מהמפה או מכרטיס דמות</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-ink">{focusedLocation.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{focusedLocation.summary}</p>
                </div>
                {focusedLocation.controllerFaction ? (
                  <span className="rounded-full border border-accent/15 bg-accent/[0.08] px-3 py-1 text-xs text-accent">
                    בשליטת {focusedLocation.controllerFaction.name}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel className="p-0">
        <div className="flex items-start justify-between gap-4 border-b border-stone-700/35 px-5 py-4">
          <div className="space-y-2">
            <p className="text-caption">שכבת מפה</p>
            <h2 className="font-display text-2xl text-ink">ווסטרוז ואסוס עד {currentEpisode.code}</h2>
            <p className="max-w-[42ch] text-sm leading-7 text-muted">
              רחף/י או לחץ/י על סמן כדי לראות פרטי מקום, והשתמש/י ב־zoom ו־pan כדי לנוע בין מושבים,
              ערים ומבצרים לפי ציר הזמן הנוכחי.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-700/35 bg-amber-500/[0.12] text-amber-100">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 pt-0 pb-5">
          <div className="rounded-[30px] border border-[#3c4664]/38 bg-[linear-gradient(180deg,rgba(18,22,36,0.96),rgba(8,10,16,0.99))] p-3 shadow-[0_28px_70px_rgba(0,0,0,0.42)] ring-1 ring-inset ring-amber-800/10">
            <div className="relative h-[21.5rem] overflow-hidden rounded-[24px] border border-stone-700/35 bg-stone-950 shadow-[inset_0_1px_0_rgba(255,244,217,0.04)] sm:h-[25rem] md:h-[34rem]">
              <FantasyMapCanvas pins={mapPins} focusLocationId={focusedLocation?.id ?? null} />

              {mapPins.length === 0 ? (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[18px] border border-stone-700/35 bg-stone-950/82 px-4 py-3 text-xs leading-6 text-stone-300 backdrop-blur-md">
                  עדיין אין נקודות ממופות לפרק הזה. עבור/י לפרק אחר או השלימי מיקומים נוספים כדי לראות
                  את הסמנים.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">מופיעים כעת</p>
            <h2 className="font-display text-2xl text-ink">לוקיישנים פעילים על המפה</h2>
            <p className="max-w-[42ch] text-sm leading-7 text-muted">
              המקומות שמופיעים כאן הם רק כאלה שמופו וגלויים לצופה עד הפרק הפעיל.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-accent">
            <MapPinned className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {mapPins.slice(0, 8).map((location) => (
            <div key={location.id} className="rounded-[20px] border border-white/[0.06] bg-white/[0.04] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{location.name}</p>
                  <p className="mt-1 text-xs text-muted">{location.region}</p>
                </div>
                {location.controllerFaction ? (
                  <span className="rounded-full border border-accent/15 bg-accent/[0.08] px-2.5 py-1 text-[0.68rem] text-accent">
                    {location.controllerFaction.name}
                  </span>
                ) : null}
              </div>
            </div>
          ))}

          {mapPins.length === 0 ? (
            <p className="text-xs text-muted">עדיין אין לוקיישנים שמופו לפרק הזה.</p>
          ) : null}
        </div>
      </Panel>

      {factionRankings[0] ? (
        <Panel className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/15 bg-accent/[0.08] text-accent">
              <Crown className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-caption">כוח שולט</p>
              <h2 className="font-display text-2xl text-ink">
                {factionRankings[0].faction.displayName} מוביל/ה את תמונת הפרק
              </h2>
              <p className="text-sm leading-7 text-muted">{factionRankings[0].latestPower.summary}</p>
            </div>
          </div>
        </Panel>
      ) : null}
    </section>
  );
}
