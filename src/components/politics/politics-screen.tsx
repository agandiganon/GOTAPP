"use client";

import { ArrowLeftRight, Castle, Crown, Sparkles, Swords } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { episodeIndex, factions } from "@/data/seed";
import { getVisibleFactionRankings, getVisibleRelationshipWeb } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

const relationshipLabels = {
  alliance: "ברית",
  war: "מלחמה",
  tension: "מתח",
  neutral: "ניטרלי",
} as const;

const relationshipStyles = {
  alliance: "border-[#6ea4c7]/20 bg-[#6ea4c7]/10 text-[#cfe7f5]",
  war: "border-danger/25 bg-danger/[0.12] text-[#f7c4cb]",
  tension: "border-[#c18b4d]/25 bg-[#c18b4d]/[0.12] text-[#f3cfaa]",
  neutral: "border-line/10 bg-white/[0.05] text-muted",
} as const;

export function PoliticsScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();

  const factionRankings = getVisibleFactionRankings(factions, currentEpisodeId, episodeIndex);
  const relationshipWeb = getVisibleRelationshipWeb(factions, currentEpisodeId, episodeIndex);
  const leadingFaction = factionRankings[0] ?? null;

  return (
    <section className="space-y-4">
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-60" />
        <div className="relative space-y-4">
          <div className="space-y-2">
            <p className="text-caption">פוליטיקה</p>
            <h1 className="font-display text-3xl text-ink">מאזן הכוח ב-{currentEpisode.code}</h1>
            <p className="text-sm leading-7 text-muted">
              המסך הזה מציג רק מוקדי כוח, בריתות, מתחים ומלחמות שהצופה כבר פגש עד הפרק הנבחר.
            </p>
          </div>

          {leadingFaction ? (
            <div className="rounded-[24px] border border-accent/20 bg-accent/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted">הגורם החזק ביותר כרגע</p>
                  <p className="mt-2 text-xl font-semibold text-ink">{leadingFaction.faction.displayName}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{leadingFaction.latestPower.summary}</p>
                </div>
                <div className="rounded-full border border-accent/25 bg-canvas/50 px-3 py-1 text-sm font-semibold text-accent">
                  {leadingFaction.latestPower.power}%
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">מד הכוח</p>
            <h2 className="font-display text-2xl text-ink">מד העוצמה</h2>
            <p className="text-sm leading-7 text-muted">
              דירוג הבתים הפעילים נשען על ה-entry האחרון שגלוי עד {currentEpisode.code}.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Castle className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-4">
          {factionRankings.map((entry, index) => (
            <div key={entry.faction.id} className="rounded-[24px] border border-line/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line/10 bg-canvas/60 text-xs text-muted">
                      {index + 1}
                    </span>
                    <p className="text-lg font-semibold text-ink">{entry.faction.displayName}</p>
                  </div>
                  <p className="text-sm leading-7 text-muted">{entry.latestPower.summary}</p>
                </div>
                <div className="rounded-full border border-accent/20 bg-canvas/50 px-3 py-1 text-sm font-semibold text-accent">
                  {entry.latestPower.power}%
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-accent to-[#f3d18a]"
                  style={{ width: `${entry.latestPower.power}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">רשת הכוח</p>
            <h2 className="font-display text-2xl text-ink">רשת הכוח</h2>
            <p className="text-sm leading-7 text-muted">
              כל קשר מוצג לפי הצמד האחרון הגלוי בלבד, אחרי דידופ של יחסים דו-כיווניים.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/10 bg-white/5 text-accent">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>

        {relationshipWeb.length === 0 ? (
          <div className="rounded-[24px] border border-line/10 bg-white/5 p-4 text-sm leading-7 text-muted">
            עדיין אין יחסי כוח מוגדרים עד נקודת הזמן הנוכחית.
          </div>
        ) : (
          <div className="space-y-3">
            {relationshipWeb.map((relationship) => {
              const sourceFaction = factions.find((entry) => entry.id === relationship.sourceFactionId);
              const targetFaction = factions.find((entry) => entry.id === relationship.targetFactionId);

              return (
                <div
                  key={`${relationship.sourceFactionId}-${relationship.targetFactionId}`}
                  className="rounded-[24px] border border-line/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-ink">
                        <span>{sourceFaction?.displayName ?? relationship.sourceFactionId}</span>
                        <ArrowLeftRight className="h-4 w-4 text-muted" />
                        <span>{targetFaction?.displayName ?? relationship.targetFactionId}</span>
                      </div>
                      <p className="text-sm leading-7 text-muted">{relationship.summary}</p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${relationshipStyles[relationship.state]}`}
                    >
                      {relationshipLabels[relationship.state]}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted">
                      <span>עוצמת הקשר</span>
                      <span>{relationship.intensity}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-accent to-[#f1d59a]"
                        style={{ width: `${relationship.intensity}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-caption">תמונת הפרק</p>
            <h2 className="font-display text-2xl text-ink">שינויים פוליטיים בפרק הנבחר</h2>
            <p className="text-sm leading-7 text-muted">
              אלה המהלכים שהפרק הפעיל עצמו מוסיף לתמונה, בלי לחשוף דבר מעבר לו.
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10 text-[#f7c4cb]">
            <Swords className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          {currentEpisode.politicalShifts.map((shift) => (
            <div key={shift.id} className="rounded-[24px] border border-line/10 bg-canvas/45 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-7 text-ink">{shift.summary}</p>
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-line/10 bg-white/5 text-accent">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {shift.factionsInvolved.map((factionId) => {
                  const faction = factions.find((entry) => entry.id === factionId);

                  return (
                    <span
                      key={factionId}
                      className="rounded-full border border-line/10 bg-white/5 px-3 py-1.5 text-xs text-muted"
                    >
                      {faction?.displayName ?? factionId}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Crown className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-caption">קריאת הכוח</p>
            <h2 className="font-display text-2xl text-ink">פענוח מאזן הפרק</h2>
            <p className="text-sm leading-7 text-muted">
              {currentEpisode.housePowerUpdates[0]?.summary ??
                "אין עדיין תיאור מילולי למד הכוח של הפרק הזה."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {currentEpisode.housePowerUpdates.map((entry) => {
            const faction = factions.find((item) => item.id === entry.factionId);

            return (
              <div key={entry.factionId} className="rounded-[22px] border border-line/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{faction?.displayName ?? entry.factionId}</p>
                  <span className="rounded-full border border-line/10 bg-canvas/50 px-3 py-1 text-xs text-muted">
                    {entry.power}%
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted">{entry.summary}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}
