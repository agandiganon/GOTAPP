"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Flame,
  MapPin,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";

import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
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
import { resolveMapLocationController } from "@/lib/map-presentation";
import {
  getEpisodeFactionRankings,
  getVisibleCharacterSnapshots,
  getVisibleEvents,
  getVisibleLocationSnapshots,
  getVisibleMapPins,
} from "@/lib/timeline";
import { cn, isDefined } from "@/lib/utils";
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

/* ─── Convert percent coords to Leaflet CRS.Simple pixel coords ───────────── */
const MAP_IMAGE_WIDTH  = 1409;
const MAP_IMAGE_HEIGHT = 944;

function toMapPoint(topPercent: number, leftPercent: number): [number, number] {
  return [
    (MAP_IMAGE_HEIGHT * topPercent) / 100,
    (MAP_IMAGE_WIDTH  * leftPercent) / 100,
  ];
}

/* ─── Event tone map ──────────────────────────────────────────────────────── */
const toneStyles = {
  neutral: {
    wrapper: "border-stone-700/45 bg-stone-900/60",
    dot:     "bg-stone-500",
    title:   "text-ink",
  },
  shift: {
    wrapper: "border-amber-800/35 bg-amber-500/[0.08]",
    dot:     "bg-amber-400",
    title:   "text-amber-200",
  },
  alert: {
    wrapper: "border-danger/30 bg-danger/[0.12]",
    dot:     "bg-rose-400",
    title:   "text-[#f2c0c7]",
  },
} as const;

/* ─────────────────────────────────────────────────────────────────────────── */
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

  const leadingFaction = useMemo(
    () =>
      factionRankings.find((e) => e.faction.id === currentEpisode.powerLeaderId) ??
      factionRankings[0],
    [currentEpisode.powerLeaderId, factionRankings],
  );
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

  const homeSummary    = useMemo(() => getEpisodeHomeSummary(currentEpisode), [currentEpisode]);
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
    <section className="space-y-5 pb-24 md:pb-6" dir="rtl">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — EPISODE SELECTOR
          ═══════════════════════════════════════════════════════════════ */}
      <Panel
        key={`hero-${currentEpisodeId}`}
        className="relative overflow-hidden p-5 md:p-6"
      >
        {/* Background crown glow */}
        <div className="absolute inset-0 bg-hero-glow opacity-70" />

        <div className="relative space-y-5">
          {/* Label + title */}
          <div className="space-y-2">
            <p className="text-caption">לוח צפייה</p>
            <h1
              className="max-w-[16ch] leading-tight text-ink"
              style={{
                fontFamily: "var(--font-display), serif",
                fontSize: "clamp(1.6rem, 5vw, 2rem)",
                textShadow: "0 1px 18px rgba(200,158,82,0.14)",
              }}
            >
              gotspoil · מלווה הצפייה שלך
            </h1>
            <p className="text-sm leading-7 text-muted">
              בחר/י את נקודת הצפייה שלך וקבלי תמונת מצב מדויקת ונטולת ספוילרים.
            </p>
          </div>

          {/* Selector container */}
          <div
            className="rounded-[32px] border border-[#3c4664]/42 p-3 backdrop-blur-xl"
            style={{
              background: "linear-gradient(180deg, rgba(18,22,36,0.92), rgba(10,13,20,0.95))",
              boxShadow: "0 24px 64px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,245,215,0.05)",
            }}
          >
            {/* Trigger button */}
            <button
              type="button"
              aria-expanded={isSelectorOpen}
              aria-haspopup="listbox"
              onClick={() => setIsSelectorOpen((p) => !p)}
              className="group w-full cursor-pointer rounded-[26px] border border-[#3c4664]/40 bg-[#0a0d14]/55 p-4 text-right transition duration-300 hover:border-[#d2a85a]/35 hover:bg-[#0e1220]/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted">פרק פעיל</p>
                  <p className="text-xl font-semibold text-ink">
                    {formatEpisodeLabel(currentEpisode)}
                  </p>
                  <p className="text-sm text-muted">
                    עונה {currentEpisode.season} · פרק {currentEpisode.episode}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-[#7a9ec4]/28 bg-[#5a7ea8]/[0.13] px-3 py-1 text-[0.68rem] font-medium text-[#c2d8ef]">
                    מצב בטוח
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3c4664]/42 bg-[#0a0d14]/55 text-[#d2a85a] transition group-hover:border-[#d2a85a]/40 group-hover:bg-[#d2a85a]/[0.10]">
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition duration-300",
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
              onConfirm={applyEpisode}
            />

            {/* Season progress bar */}
            {(() => {
              const seasonEps = availableEpisodes.filter(e => e.season === currentEpisode.season);
              const epIndex = seasonEps.findIndex(e => e.id === currentEpisodeId);
              const progressPct = seasonEps.length > 0 ? ((epIndex + 1) / seasonEps.length) * 100 : 0;
              return (
                <div className="mt-3 px-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p
                      style={{
                        fontFamily: "var(--font-cinzel), serif",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(210,168,90,0.50)",
                      }}
                    >
                      עונה {currentEpisode.season} · פרק {epIndex + 1} מתוך {seasonEps.length}
                    </p>
                    <span className="text-[0.60rem] text-muted">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(60,70,100,0.35)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progressPct}%`,
                        background: "linear-gradient(90deg, rgba(150,120,60,0.70), rgba(210,168,90,0.90))",
                        boxShadow: "0 0 8px rgba(210,168,90,0.30)",
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex gap-px">
                    {seasonEps.map((ep, idx) => (
                      <div
                        key={ep.id}
                        className="h-1 flex-1 rounded-sm"
                        style={{
                          background: idx <= epIndex
                            ? `rgba(210,168,90,${0.25 + (idx === epIndex ? 0.55 : 0.20)})`
                            : "rgba(60,70,100,0.25)",
                          transition: "background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Episode summary */}
            <div className="mt-3 rounded-[26px] border border-stone-700/38 bg-stone-950/42 p-4 backdrop-blur-md">
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
          </div>
        </div>
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          MAP WIDGET — EPISODE BATTLEFIELD
          This panel's ENTIRE PURPOSE is to show WHERE the main action
          of this episode happens on the Westeros map. Every element
          reinforces that single message.
          ═══════════════════════════════════════════════════════════════ */}
      <Panel
        key={`map-${currentEpisodeId}`}
        className="overflow-hidden"
      >
        {/* Panel header — CLEARLY names the section's purpose */}
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

        {/* Interactive mini-map centred on the primary episode location */}
        <div className="p-4 pb-0">
          <div
            className="overflow-hidden rounded-[22px] border border-[#3c4664]/38"
            style={{
              background: "linear-gradient(180deg, rgba(16,20,32,0.97), rgba(8,10,16,1))",
              boxShadow: `0 20px 56px rgba(0,0,0,0.48), inset 0 0 0 1px rgba(203,165,92,0.06)`,
            }}
          >
            <div className="p-2">
              {/*
                dir="ltr" is required — Leaflet's internals expect LTR layout.
                The outer home screen uses dir="rtl", so we explicitly reset here.
              */}
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
                  /* Fallback when no coordinates exist for this episode's primary location */
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

                {/* Parchment vignette + bottom fade */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[18px]"
                  style={{
                    background:
                      "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 48%, rgba(4,6,14,0.55) 82%, rgba(4,6,14,0.80) 100%)",
                  }}
                />

                {/* Bottom-left episode badge */}
                <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-[#3c4664]/42 bg-[#080a10]/78 px-2.5 py-1.5 backdrop-blur-md">
                  <Flame className="h-3 w-3 text-amber-400/80" />
                  <span className="text-[0.62rem] font-semibold tracking-wide text-amber-200/80">
                    זירת הפרק
                  </span>
                </div>

                {/* Location name label — bottom-right */}
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

                {/* Inset frame ring */}
                <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-amber-700/[0.12]" />
              </div>
            </div>
          </div>
        </div>

        {/* Location detail card below map */}
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

      {/* ══════════════════════════════════════════════════════════════════
          POWER BALANCE
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-caption">מאזן כוח</p>
            <h2 className="font-display text-2xl text-ink">מאזן הכוח הנוכחי</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.10] text-accent">
            <Shield className="h-5 w-5" />
          </div>
        </div>

        {/* Leading faction highlight */}
        {leadingFaction && (
          <div
            className="mb-4 rounded-[22px] border p-4"
            style={{
              borderColor: `${leadingFaction.faction.themeColor}30`,
              background: `linear-gradient(135deg, ${leadingFaction.faction.themeColor}12, ${leadingFaction.faction.themeColor}06)`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FactionSigilBadge
                  name={leadingFaction.faction.displayName}
                  sigilUrl={
                    leadingFaction.faction.factionSigilUrl ?? leadingFaction.faction.sigil
                  }
                  themeColor={leadingFaction.faction.themeColor}
                  className="h-10 w-10"
                />
                <div>
                  <p className="text-[0.68rem] text-stone-400">הכוח המוביל כרגע</p>
                  <p className="text-base font-semibold text-ink">
                    {leadingFaction.faction.displayName}
                  </p>
                </div>
              </div>
              <div
                className="rounded-full border px-3 py-1 text-xs font-semibold"
                style={{
                  borderColor: `${leadingFaction.faction.themeColor}35`,
                  color: leadingFaction.faction.themeColor,
                  background: `${leadingFaction.faction.themeColor}12`,
                }}
              >
                {leadingFaction.latestPower.power}%
              </div>
            </div>
            {/* Power bar — faction-colored */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${leadingFaction.latestPower.power}%`,
                  background: `linear-gradient(90deg, ${leadingFaction.faction.themeColor}80, ${leadingFaction.faction.themeColor})`,
                }}
              />
            </div>
            <p className="mt-2 text-xs leading-6 text-muted">{leadingFaction.latestPower.summary}</p>
          </div>
        )}

        {/* Faction ranking list */}
        <div className="space-y-2.5">
          {factionRankings.slice(0, 3).map((entry, index) => (
            <div
              key={entry.faction.id}
              className="flex items-center gap-3 rounded-[18px] border px-3.5 py-3"
              style={{
                borderColor: `${entry.faction.themeColor}20`,
                background: `linear-gradient(135deg, ${entry.faction.themeColor}08, rgba(16,20,32,0.68))`,
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  border: `1px solid ${entry.faction.themeColor}30`,
                  color: entry.faction.themeColor,
                  background: `${entry.faction.themeColor}14`,
                }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{entry.faction.displayName}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${entry.latestPower.power}%`,
                      background: entry.faction.themeColor,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
              <span
                className="shrink-0 text-sm font-semibold"
                style={{ color: entry.faction.themeColor }}
              >
                {entry.latestPower.power}%
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          RECENT EVENTS — tone-matched glassmorphism
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-caption">אירועים אחרונים</p>
            <h2 className="font-display text-2xl text-ink">אירועים בולטים עד כאן</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/22 bg-danger/[0.10] text-[#f2c0c7]">
            <Swords className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-2.5">
          {recentEvents.map((event) => {
            const t = toneStyles[event.tone];
            return (
              <div
                key={event.id}
                className={cn(
                  "rounded-[20px] border px-4 py-3.5 backdrop-blur-md",
                  t.wrapper,
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Tone dot */}
                  <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", t.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={cn("text-sm font-semibold leading-6", t.title)}>
                        {event.title}
                      </p>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    </div>
                    {event.description !== event.title && (
                      <p className="mt-1 text-xs leading-6 text-stone-400">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {recentEvents.length === 0 && (
            <p className="text-sm text-muted">אין אירועים מוגדרים עד נקודת הזמן הנוכחית.</p>
          )}
        </div>
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          EPISODE CONTEXT — characters + locations
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <p className="text-caption">הקשר הפרק</p>
        <h2 className="mt-1.5 font-display text-2xl text-ink">מוקדי הפרק הפעיל</h2>

        <div className="mt-4 grid gap-3">
          {/* Characters */}
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

          {/* Locations */}
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
  );
}
