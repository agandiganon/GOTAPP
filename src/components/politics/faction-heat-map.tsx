"use client";
import { factions as allFactions } from "@/data/seed";
import type { FactionRecord } from "@/data/schemas";
import { Panel } from "@/components/ui/panel";

interface RelationshipWeb {
  sourceFactionId: string;
  targetFactionId: string;
  state: "alliance" | "war" | "tension" | "neutral";
  intensity: number;
}

interface FactionHeatMapProps {
  relationshipWeb: RelationshipWeb[];
  activeFactions: FactionRecord[];
}

const stateColors = {
  alliance: "#6ea4c7",  // Blue
  war: "#c15560",       // Red
  tension: "#c18b4d",   // Orange
  neutral: "#6b7280",   // Gray
};

const stateNames = {
  alliance: "ברית",
  war: "מלחמה",
  tension: "מתח",
  neutral: "ניטרלי",
};

export function FactionHeatMap({ relationshipWeb, activeFactions }: FactionHeatMapProps) {
  if (activeFactions.length === 0) return null;

  // Build a map of relationships for quick lookup
  const relationMap = new Map<string, RelationshipWeb>();
  relationshipWeb.forEach(rel => {
    const key1 = `${rel.sourceFactionId}|${rel.targetFactionId}`;
    const key2 = `${rel.targetFactionId}|${rel.sourceFactionId}`;
    if (!relationMap.has(key1)) relationMap.set(key1, rel);
    if (!relationMap.has(key2)) relationMap.set(key2, rel);
  });

  const getRelationship = (factionId1: string, factionId2: string): RelationshipWeb | undefined => {
    return relationMap.get(`${factionId1}|${factionId2}`);
  };

  const getInitials = (displayName: string): string => {
    return displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Panel className="p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-caption">מטריצת יחסים</p>
          <h2 className="font-display text-2xl text-ink">מפת חום הפקשנות</h2>
          <p className="text-sm leading-7 text-muted">
            ויזואליזציה מהירה של יחסי כוח בין הגורמים הפעילים.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap gap-3">
        {(["alliance", "war", "tension", "neutral"] as const).map(state => (
          <div key={state} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ background: stateColors[state] }}
            />
            <span className="text-xs text-muted">{stateNames[state]}</span>
          </div>
        ))}
      </div>

      {/* Heat map grid */}
      <div className="overflow-x-auto rounded-[16px] border border-white/[0.07]" style={{ background: "rgba(10,13,20,0.50)" }}>
        <div className="inline-block min-w-full">
          {/* Header row with faction names */}
          <div className="flex">
            <div className="w-24 flex-shrink-0 border-r border-white/[0.05] bg-white/[0.02] p-2" />
            {activeFactions.map(faction => (
              <div
                key={`header-${faction.id}`}
                className="flex w-12 flex-shrink-0 items-center justify-center border-r border-white/[0.05] p-2 text-[0.60rem] font-bold text-stone-400"
                title={faction.displayName}
              >
                {getInitials(faction.displayName)}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {activeFactions.map(rowFaction => (
            <div key={`row-${rowFaction.id}`} className="flex border-t border-white/[0.05]">
              {/* Row label */}
              <div
                className="w-24 flex-shrink-0 border-r border-white/[0.05] bg-white/[0.02] p-2 text-[0.60rem] font-semibold text-stone-300"
                title={rowFaction.displayName}
                style={{ maxHeight: "3rem", overflow: "hidden" }}
              >
                <div className="line-clamp-2 text-right">{rowFaction.displayName}</div>
              </div>

              {/* Cell data */}
              {activeFactions.map(colFaction => {
                const rel = getRelationship(rowFaction.id, colFaction.id);
                const cellColor = rel ? stateColors[rel.state] : stateColors.neutral;

                return (
                  <div
                    key={`cell-${rowFaction.id}-${colFaction.id}`}
                    className="flex w-12 flex-shrink-0 items-center justify-center border-r border-white/[0.05] p-2"
                    style={{
                      background: rowFaction.id === colFaction.id
                        ? "rgba(255,255,255,0.04)"
                        : `${cellColor}18`,
                      cursor: rel ? "pointer" : "default",
                    }}
                    title={rel ? `${rowFaction.displayName} ↔ ${colFaction.displayName}: ${stateNames[rel.state]} (${rel.intensity}%)` : undefined}
                  >
                    {rowFaction.id !== colFaction.id && rel && (
                      <div
                        className="h-8 w-8 flex items-center justify-center rounded-full text-[0.50rem] font-bold"
                        style={{
                          background: `${cellColor}35`,
                          color: cellColor,
                          border: `1px solid ${cellColor}50`,
                        }}
                      >
                        {rel.intensity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-4 text-xs leading-6 text-muted">
        ※ כל תא מציג את עוצמת הקשר (1-100). צבע התא משקף את סוג היחס: כחול = ברית, אדום = מלחמה, כתום = מתח.
      </p>
    </Panel>
  );
}
