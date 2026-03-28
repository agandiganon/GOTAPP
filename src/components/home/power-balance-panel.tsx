"use client";

import { Shield } from "lucide-react";

import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { Panel } from "@/components/ui/panel";
import type { FactionRecord } from "@/data/schemas";

type FactionRanking = {
  faction: FactionRecord;
  latestPower: { episodeId: string; power: number; summary: string };
};

interface PowerBalancePanelProps {
  factionRankings: FactionRanking[];
  currentEpisodeId: string;
}

export function PowerBalancePanel({ factionRankings, currentEpisodeId }: PowerBalancePanelProps) {
  const leadingFaction = factionRankings[0];

  return (
    <Panel key={`power-${currentEpisodeId}`} className="p-5 episode-content-fade">
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
  );
}
