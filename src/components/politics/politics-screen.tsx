"use client";

import { ArrowLeftRight, Castle, Crown, Flame, Search, Sparkles, Swords, Castle as CastleEmpty } from "lucide-react";
import { useState } from "react";

import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { FactionHeatMap } from "@/components/politics/faction-heat-map";
import { Panel } from "@/components/ui/panel";
import { episodeIndex, factions } from "@/data/seed";
import { getEpisodeFactionRankings, getVisibleRelationshipWeb } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

/* ─── Relationship visual config ─────────────────────────────────────────── */
const relationshipLabels = {
  alliance: "ברית",
  war:      "מלחמה",
  tension:  "מתח",
  neutral:  "ניטרלי",
} as const;

const relationshipConfig = {
  alliance: {
    border: "rgba(110,164,199,0.22)",
    bg:     "rgba(110,164,199,0.08)",
    badge:  "border-[#6ea4c7]/25 bg-[#6ea4c7]/[0.12] text-[#cfe7f5]",
    bar:    "#6ea4c7",
  },
  war: {
    border: "rgba(108,30,35,0.38)",
    bg:     "rgba(108,30,35,0.12)",
    badge:  "border-danger/28 bg-danger/[0.14] text-[#f7c4cb]",
    bar:    "#c15560",
  },
  tension: {
    border: "rgba(193,139,77,0.28)",
    bg:     "rgba(193,139,77,0.08)",
    badge:  "border-[#c18b4d]/28 bg-[#c18b4d]/[0.12] text-[#f3cfaa]",
    bar:    "#c18b4d",
  },
  neutral: {
    border: "rgba(255,255,255,0.08)",
    bg:     "rgba(255,255,255,0.03)",
    badge:  "border-white/10 bg-white/[0.05] text-stone-400",
    bar:    "#6b7280",
  },
} as const;

/* ─────────────────────────────────────────────────────────────────────────── */
export function PoliticsScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const [relationFilter, setRelationFilter] = useState<string | null>(null);
  const [factionSearch, setFactionSearch] = useState<string | null>(null);

  /* ── Anti-spoiler data — DO NOT TOUCH ─────────────────────────────────── */
  const factionRankings  = getEpisodeFactionRankings(factions, currentEpisode);
  const relationshipWeb  = getVisibleRelationshipWeb(factions, currentEpisodeId, episodeIndex)
    .filter((rel) => rel.state !== "neutral");
  const leadingFaction   = factionRankings[0] ?? null;
  /* ── End anti-spoiler block ───────────────────────────────────────────── */

  /* Get unique factions that appear in relationship web */
  const activeFactionIds = Array.from(
    new Set(
      relationshipWeb.flatMap((rel) => [rel.sourceFactionId, rel.targetFactionId])
    )
  );
  const activeFactions = factions.filter((f) => activeFactionIds.includes(f.id));

  /* Filter relationships by type and faction */
  const filteredRelationships = relationshipWeb.filter((rel) => {
    if (relationFilter && rel.state !== relationFilter) return false;
    if (factionSearch && rel.sourceFactionId !== factionSearch && rel.targetFactionId !== factionSearch) return false;
    return true;
  });

  return (
    <section key={`politics-${currentEpisodeId}`} className="space-y-5 pb-24 md:pb-6 episode-content-fade" dir="rtl">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — LEADING POWER
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-55" />

        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-caption">פוליטיקה</p>
            <h1 className="font-display text-3xl text-ink">
              מאזן הכוח ב-{currentEpisode.code}
            </h1>
            <p className="text-sm leading-7 text-muted">
              מוקדי כוח, בריתות, מתחים ומלחמות שהצופה כבר פגש עד הפרק הנבחר.
            </p>
          </div>

          {leadingFaction && (
            <div
              className="rounded-[24px] border p-4"
              style={{
                borderColor: `${leadingFaction.faction.themeColor}30`,
                background:  `linear-gradient(135deg, ${leadingFaction.faction.themeColor}14, ${leadingFaction.faction.themeColor}06)`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FactionSigilBadge
                    name={leadingFaction.faction.displayName}
                    sigilUrl={leadingFaction.faction.factionSigilUrl ?? leadingFaction.faction.sigil}
                    themeColor={leadingFaction.faction.themeColor}
                    className="h-11 w-11 shrink-0"
                  />
                  <div>
                    <p className="text-xs text-stone-400">הגורם החזק ביותר כרגע</p>
                    <p className="mt-1 text-xl font-semibold text-ink">
                      {leadingFaction.faction.displayName}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-muted">
                      {leadingFaction.latestPower.summary}
                    </p>
                  </div>
                </div>
                <div
                  className="shrink-0 rounded-full border px-3 py-1 text-sm font-bold"
                  style={{
                    borderColor: `${leadingFaction.faction.themeColor}35`,
                    color:       leadingFaction.faction.themeColor,
                    background:  `${leadingFaction.faction.themeColor}14`,
                  }}
                >
                  {leadingFaction.latestPower.power}%
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          POWER METER — faction-colored bars
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-caption">מד הכוח</p>
            <h2 className="font-display text-2xl text-ink">מד העוצמה</h2>
            <p className="text-sm leading-7 text-muted">
              דירוג הבתים הפעילים נשען על תמונת הכוח של {currentEpisode.code}.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.10] text-accent">
            <Castle className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {factionRankings.map((entry, index) => (
            <div
              key={entry.faction.id}
              className="rounded-[22px] border p-4"
              style={{
                borderColor: `${entry.faction.themeColor}22`,
                background:  `linear-gradient(135deg, ${entry.faction.themeColor}0a, rgba(14,18,28,0.78))`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Rank badge — faction-tinted */}
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      border:     `1px solid ${entry.faction.themeColor}30`,
                      color:      entry.faction.themeColor,
                      background: `${entry.faction.themeColor}14`,
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FactionSigilBadge
                        name={entry.faction.displayName}
                        sigilUrl={entry.faction.factionSigilUrl ?? entry.faction.sigil}
                        themeColor={entry.faction.themeColor}
                        className="h-7 w-7"
                      />
                      <p className="text-base font-semibold text-ink">
                        {entry.faction.displayName}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-muted">{entry.latestPower.summary}</p>
                  </div>
                </div>
                <div
                  className="shrink-0 rounded-full border px-3 py-1 text-sm font-bold"
                  style={{
                    borderColor: `${entry.faction.themeColor}30`,
                    color:       entry.faction.themeColor,
                    background:  `${entry.faction.themeColor}10`,
                  }}
                >
                  {entry.latestPower.power}%
                </div>
              </div>

              {/* Power bar — faction color */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${entry.latestPower.power}%`,
                    background: `linear-gradient(90deg, ${entry.faction.themeColor}70, ${entry.faction.themeColor})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          RELATIONSHIP WEB — type-colored cards
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-caption">רשת הכוח</p>
            <h2 className="font-display text-2xl text-ink">רשת הכוח</h2>
            <p className="text-sm leading-7 text-muted">
              יחסי כוח בין הגורמים הפעילים, ללא כפילויות.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] text-accent">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>

        {/* Relationship type filter pills */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRelationFilter(null)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.70rem] font-medium transition-all duration-200 ${
              relationFilter === null
                ? "border-[#3c4664]/60 bg-[#2a3050]/70 text-[#c8d8f0]"
                : "border-stone-700/30 bg-stone-950/40 text-stone-500 hover:text-stone-300"
            }`}
          >
            הכל
          </button>
          {(["alliance", "war", "tension"] as const).map((type) => {
            const isActive = relationFilter === type;
            const cfg = relationshipConfig[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setRelationFilter(isActive ? null : type)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.70rem] font-medium transition-all duration-200 ${cfg.badge}`}
                style={{
                  background: isActive ? `${cfg.bar}18` : cfg.bg,
                  borderColor: isActive ? cfg.border : "rgba(60,70,100,0.30)",
                }}
              >
                {relationshipLabels[type]}
              </button>
            );
          })}
        </div>

        {/* Faction filter — horizontal scroll */}
        {activeFactions.length > 0 && (
          <div className="-mx-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center gap-2 px-2" style={{ width: "max-content" }}>
              <button
                type="button"
                onClick={() => setFactionSearch(null)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.70rem] font-medium transition-all duration-200 ${
                  factionSearch === null
                    ? "border-[#3c4664]/60 bg-[#2a3050]/70 text-[#c8d8f0]"
                    : "border-stone-700/30 bg-stone-950/40 text-stone-500 hover:text-stone-300"
                }`}
              >
                הכל
              </button>
              {activeFactions.map((faction) => {
                const isActive = factionSearch === faction.id;
                const color = faction.themeColor ?? "#a07840";
                return (
                  <button
                    key={faction.id}
                    type="button"
                    onClick={() => setFactionSearch(isActive ? null : faction.id)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.70rem] font-medium transition-all duration-200"
                    style={{
                      background: isActive ? `${color}15` : "rgba(8,10,16,0.60)",
                      border: isActive ? `1px solid ${color}38` : "1px solid rgba(60,70,100,0.30)",
                      color: isActive ? color : "rgb(130,130,150)",
                    }}
                  >
                    {faction.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {relationshipWeb.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-stone-700/40 bg-stone-900/60">
              <Castle className="h-7 w-7 text-stone-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-ink">אין יחסי כוח גלויים</p>
              <p className="max-w-[32ch] text-sm leading-7 text-muted">
                עדיין לא נוצרו יחסי כוח מוגדרים בין הבתים עד נקודת הזמן הנוכחית. נסה/י לעבור לפרק מאוחר יותר.
              </p>
            </div>
          </div>
        ) : filteredRelationships.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.04] p-4 text-sm leading-7 text-muted">
            לא נמצאו יחסי כוח התואמים לסינון הנבחר.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredRelationships.map((rel) => {
              const srcFaction = factions.find((f) => f.id === rel.sourceFactionId);
              const tgtFaction = factions.find((f) => f.id === rel.targetFactionId);
              const cfg = relationshipConfig[rel.state];

              return (
                <div
                  key={`${rel.sourceFactionId}-${rel.targetFactionId}`}
                  className="rounded-[22px] border p-4"
                  style={{ borderColor: cfg.border, background: cfg.bg }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      {/* Faction pair */}
                      <div className="flex items-center gap-2 text-sm font-medium text-ink">
                        {srcFaction && (
                          <FactionSigilBadge
                            name={srcFaction.displayName}
                            sigilUrl={srcFaction.factionSigilUrl ?? srcFaction.sigil}
                            themeColor={srcFaction.themeColor}
                            className="h-6 w-6"
                          />
                        )}
                        <span>{srcFaction?.displayName ?? rel.sourceFactionId}</span>
                        <ArrowLeftRight className="h-3.5 w-3.5 text-stone-500" />
                        {tgtFaction && (
                          <FactionSigilBadge
                            name={tgtFaction.displayName}
                            sigilUrl={tgtFaction.factionSigilUrl ?? tgtFaction.sigil}
                            themeColor={tgtFaction.themeColor}
                            className="h-6 w-6"
                          />
                        )}
                        <span>{tgtFaction?.displayName ?? rel.targetFactionId}</span>
                      </div>
                      <p className="text-sm leading-6 text-muted">{rel.summary}</p>
                    </div>

                    {/* State badge */}
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${cfg.badge}`}
                    >
                      {relationshipLabels[rel.state]}
                    </span>
                  </div>

                  {/* Intensity bar */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[0.65rem] text-stone-500">
                      <span>עוצמת הקשר</span>
                      <span>{rel.intensity}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${rel.intensity}%`,
                          background: `linear-gradient(90deg, ${cfg.bar}80, ${cfg.bar})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          FACTION HEAT MAP
          ═══════════════════════════════════════════════════════════════ */}
      {relationshipWeb.length > 0 && (
        <FactionHeatMap
          relationshipWeb={relationshipWeb}
          activeFactions={activeFactions}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════
          POLITICAL SHIFTS THIS EPISODE
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-caption">תמונת הפרק</p>
            <h2 className="font-display text-2xl text-ink">שינויים פוליטיים בפרק הנבחר</h2>
            <p className="text-sm leading-7 text-muted">
              מהלכים שהפרק הפעיל מוסיף לתמונה, ללא ספוילרים קדימה.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/22 bg-danger/[0.10] text-[#f7c4cb]">
            <Swords className="h-5 w-5" />
          </div>
        </div>

        {currentEpisode.politicalShifts.length === 0 ? (
          <p className="text-sm text-muted">אין שינויים פוליטיים מוגדרים לפרק זה.</p>
        ) : (
          <div className="space-y-2.5">
            {currentEpisode.politicalShifts.map((shift, index) => (
              <div
                key={shift.id}
                className="flex items-start gap-3.5 rounded-[20px] border border-stone-700/35 p-4"
                style={{ background: "rgba(14,18,28,0.70)" }}
              >
                {/* Index indicator */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-700/28 bg-amber-500/[0.10] text-[0.7rem] font-bold text-amber-300">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-7 text-stone-200">{shift.summary}</p>
                  {shift.factionsInvolved.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {shift.factionsInvolved.map((factionId) => {
                        const faction = factions.find((f) => f.id === factionId);
                        return (
                          <span
                            key={factionId}
                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.66rem] font-medium"
                            style={{
                              borderColor: faction ? `${faction.themeColor}30` : "rgba(255,255,255,0.08)",
                              color:       faction?.themeColor ?? "rgb(160,150,138)",
                              background:  faction ? `${faction.themeColor}10` : "rgba(255,255,255,0.04)",
                            }}
                          >
                            {faction?.displayName ?? factionId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Flame className="mt-1 h-4 w-4 shrink-0 text-amber-400/50" />
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ══════════════════════════════════════════════════════════════════
          POWER ANALYSIS THIS EPISODE
          ═══════════════════════════════════════════════════════════════ */}
      <Panel className="p-5">
        <div className="mb-4 flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.10] text-accent">
            <Crown className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-caption">קריאת הכוח</p>
            <h2 className="font-display text-2xl text-ink">פענוח מאזן הפרק</h2>
          </div>
        </div>

        {currentEpisode.housePowerUpdates.length === 0 ? (
          <p className="text-sm text-muted">אין עדיין פענוח כוח לפרק זה.</p>
        ) : (
          <div className="space-y-2.5">
            {currentEpisode.housePowerUpdates.map((entry) => {
              const faction = factions.find((f) => f.id === entry.factionId);
              return (
                <div
                  key={entry.factionId}
                  className="rounded-[20px] border p-4"
                  style={{
                    borderColor: faction ? `${faction.themeColor}20` : "rgba(255,255,255,0.07)",
                    background:  faction
                      ? `linear-gradient(135deg, ${faction.themeColor}08, rgba(14,18,28,0.78))`
                      : "rgba(14,18,28,0.70)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {faction && (
                        <FactionSigilBadge
                          name={faction.displayName}
                          sigilUrl={faction.factionSigilUrl ?? faction.sigil}
                          themeColor={faction.themeColor}
                          className="h-8 w-8"
                        />
                      )}
                      <p className="font-medium text-ink">
                        {faction?.displayName ?? entry.factionId}
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-3 py-1 text-xs font-bold"
                      style={{
                        borderColor: faction ? `${faction.themeColor}30` : "rgba(255,255,255,0.10)",
                        color:       faction?.themeColor ?? "rgb(163,153,140)",
                        background:  faction ? `${faction.themeColor}10` : "rgba(255,255,255,0.04)",
                      }}
                    >
                      {entry.power}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted">{entry.summary}</p>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

    </section>
  );
}
