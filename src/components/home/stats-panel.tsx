"use client";

import type { CharacterRecord, FactionRecord, LocationRecord, LocationHistoryEntry } from "@/data/schemas";
import type { CharacterTimelineEntry } from "@/data/schemas";

interface StatsPanelProps {
  visibleCharacters: (CharacterRecord & { latestState: CharacterTimelineEntry })[];
  visibleLocations: (LocationRecord & { latestHistory: LocationHistoryEntry })[];
  factions: FactionRecord[];
}

function BarChart({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.75rem] font-medium text-stone-400">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {value} / {max}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

function PercentageBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.75rem] font-medium text-stone-400">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export function StatsPanel({
  visibleCharacters,
  visibleLocations,
  factions,
}: StatsPanelProps) {
  // Calculate stats
  const totalCharacters = visibleCharacters.length;
  const aliveCharacters = visibleCharacters.filter(
    (c) => !["dead", "missing"].includes(c.latestState.status),
  ).length;
  const deadCharacters = totalCharacters - aliveCharacters;

  const totalLocations = visibleLocations.length;
  const activeFactions = factions.length;

  return (
    <div
      className="rounded-[20px] border border-stone-700/35 p-5 space-y-5"
      style={{ background: "rgba(16,20,32,0.68)" }}
    >
      {/* Header */}
      <div>
        <p className="text-caption text-stone-500">סטטיסטיקות</p>
        <h3 className="font-display text-xl text-ink mt-1">עולם המשחק</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Characters */}
        <div className="rounded-[16px] border border-stone-700/25 p-3.5 space-y-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            דמויות
          </p>
          <p className="text-2xl font-bold text-accent">{totalCharacters}</p>
        </div>

        {/* Alive vs Dead */}
        <div className="rounded-[16px] border border-stone-700/25 p-3.5 space-y-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            חיים / מתים
          </p>
          <p className="text-sm font-semibold text-stone-300">
            <span style={{ color: "rgb(100,200,130)" }}>{aliveCharacters}</span>
            <span className="text-stone-500 mx-1">/</span>
            <span style={{ color: "rgb(255,100,100)" }}>{deadCharacters}</span>
          </p>
        </div>

        {/* Locations */}
        <div className="rounded-[16px] border border-stone-700/25 p-3.5 space-y-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            מיקומים
          </p>
          <p className="text-2xl font-bold text-accent">{totalLocations}</p>
        </div>

        {/* Active Factions */}
        <div className="rounded-[16px] border border-stone-700/25 p-3.5 space-y-2.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-stone-500">
            בתים פעילים
          </p>
          <p className="text-2xl font-bold text-accent">{activeFactions}</p>
        </div>
      </div>

      {/* Chart bars */}
      <div className="space-y-4 pt-2">
        <PercentageBar
          label="חיים מסך הדמויות"
          value={aliveCharacters}
          total={totalCharacters}
          color="rgb(100,200,130)"
        />
        <PercentageBar
          label="מתים מסך הדמויות"
          value={deadCharacters}
          total={totalCharacters}
          color="rgb(255,100,100)"
        />
      </div>
    </div>
  );
}
