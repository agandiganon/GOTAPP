"use client";

import dynamic from "next/dynamic";
import { Compass, MapPinned, Sparkles } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { episodeIndex, locations, mapRegistry } from "@/data/seed";
import { getVisibleLocationSnapshots, getVisibleMapPins } from "@/lib/timeline";
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

  const visibleLocations = getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex);
  const visiblePins = getVisibleMapPins(mapRegistry, currentEpisodeId, episodeIndex);

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

      return {
        id: location.id,
        name: location.name,
        region: location.region,
        summary: location.latestHistory.summary,
        topPercent: pin.imagePositionPercent.top,
        leftPercent: pin.imagePositionPercent.left,
        isPrimary: location.id === currentEpisode.primaryLocationId,
      };
    })
    .filter(isDefined);

  const primaryLocationLabel =
    visibleLocations.find((location) => location.id === currentEpisode.primaryLocationId)?.name ??
    "לא זמין";

  return (
    <section className="space-y-4">
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-60" />
        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-caption">מפה</p>
            <h1 className="font-display text-3xl text-ink">מפת העולם האינטראקטיבית</h1>
            <p className="text-sm leading-7 text-muted">
              שכבת המפה מציגה את העולם הגלוי עד הפרק שנבחר, עם תנועה חלקה, zoom אינטראקטיבי
              וסמנים חיים לפי נקודת הזמן הפעילה.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[22px] border border-line/10 bg-white/5 p-4">
              <p className="text-xs text-muted">לוקיישנים גלויים</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{visiblePins.length}</p>
            </div>
            <div className="rounded-[22px] border border-accent/20 bg-accent/10 p-4">
              <p className="text-xs text-[#f1ddb2]">מופיעים על המפה</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{mapPins.length}</p>
            </div>
            <div className="rounded-[22px] border border-[#7e97b3]/20 bg-[#7e97b3]/10 p-4">
              <p className="text-xs text-[#d5e1ec]">מוקד הפרק</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{primaryLocationLabel}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="overflow-hidden p-0">
        <div className="flex items-start justify-between gap-4 border-b border-line/10 px-5 py-4">
          <div className="space-y-2">
            <p className="text-caption">שכבת מפה</p>
            <h2 className="font-display text-2xl text-ink">ווסטרוז ואסוס עד {currentEpisode.code}</h2>
            <p className="text-sm leading-7 text-muted">
              רחף/י או לחץ/י על סמן כדי לראות את פרטי המיקום, והשתמש/י ב־zoom ו־pan כדי לעבור בין
              מוקדי העלילה הגלויים עד הפרק הנבחר.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Compass className="h-5 w-5" />
          </div>
        </div>

        <div className="relative h-[26rem] bg-canvas/70 md:h-[34rem]">
          <FantasyMapCanvas pins={mapPins} />

          {mapPins.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[18px] border border-line/10 bg-canvas/75 px-4 py-3 text-xs leading-6 text-muted backdrop-blur-md">
              אין עדיין נקודות פעילות ממוקמות לפרק הזה. עבור/י לפרק אחר או השלם/י מיקומים נוספים כדי
              לראות את שכבת הסמנים.
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-caption">מקרא</p>
              <h2 className="font-display text-2xl text-ink">איך לקרוא את המפה</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/10 bg-white/5 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3 text-sm leading-7 text-muted">
            <p>הסמן הבהיר יותר מציין את מוקד הפרק הראשי; שאר הסמנים מציגים מוקדים גלויים נוספים.</p>
            <p>Tooltip מהיר מציג את שם הלוקיישן, ו־popup פותח תיאור קצר מתוך הטיימליין הגלוי בלבד.</p>
            <p>המפה מתעדכנת אוטומטית לפי הפרק שבחרת, כך שלא תראי לוקיישנים שעדיין לא נחשפו.</p>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-caption">מופיעים כעת</p>
              <h2 className="font-display text-2xl text-ink">המוקדים שעל המפה</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/10 bg-white/5 text-accent">
              <MapPinned className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {mapPins.slice(0, 8).map((location) => (
              <div key={location.id} className="rounded-[20px] border border-line/10 bg-white/5 px-4 py-3">
                <p className="font-medium text-ink">{location.name}</p>
                <p className="mt-1 text-xs text-muted">{location.region}</p>
              </div>
            ))}

            {mapPins.length === 0 ? (
              <p className="text-xs text-muted">עדיין אין לוקיישנים שמופו לפרק הזה.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </section>
  );
}
