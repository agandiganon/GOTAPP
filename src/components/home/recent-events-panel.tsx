"use client";

import { ArrowUpRight, Swords } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { TimelineEventRecord } from "@/data/schemas";

type EventTone = "neutral" | "shift" | "alert";

const toneStyles = {
  neutral: {
    wrapper: "border-stone-700/45 bg-stone-900/60",
    dot: "bg-stone-500",
    title: "text-ink",
  },
  shift: {
    wrapper: "border-amber-800/35 bg-amber-500/[0.08]",
    dot: "bg-amber-400",
    title: "text-amber-200",
  },
  alert: {
    wrapper: "border-danger/30 bg-danger/[0.12]",
    dot: "bg-rose-400",
    title: "text-[#f2c0c7]",
  },
} as const;

interface RecentEventsPanelProps {
  recentEvents: TimelineEventRecord[];
  currentEpisodeId: string;
}

export function RecentEventsPanel({ recentEvents, currentEpisodeId }: RecentEventsPanelProps) {
  return (
    <Panel key={`events-${currentEpisodeId}`} className="p-5 episode-content-fade">
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
          const t = toneStyles[event.tone as EventTone];
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
  );
}
