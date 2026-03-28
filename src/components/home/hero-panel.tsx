"use client";

import { ChevronDown } from "lucide-react";

import { EpisodeSelectorSheet } from "@/components/home/episode-selector-sheet";
import { EpisodeSummaryCard } from "@/components/home/episode-summary-card";
import { Panel } from "@/components/ui/panel";
import { formatEpisodeLabel } from "@/lib/episodes";
import { cn } from "@/lib/utils";
import type { EpisodeRecord, EpisodeId, CharacterRecord, CharacterTimelineEntry } from "@/data/schemas";

type CharacterSnapshot = CharacterRecord & { latestState: CharacterTimelineEntry };

interface HeroPanelProps {
  currentEpisode: EpisodeRecord;
  currentEpisodeId: EpisodeId;
  availableEpisodes: EpisodeRecord[];
  isSelectorOpen: boolean;
  onSelectorToggle: (isOpen: boolean) => void;
  onEpisodeSelect: (episodeId: EpisodeId) => void;
  focusCharacters: CharacterSnapshot[];
}

export function HeroPanel({
  currentEpisode,
  currentEpisodeId,
  availableEpisodes,
  isSelectorOpen,
  onSelectorToggle,
  onEpisodeSelect,
  focusCharacters,
}: HeroPanelProps) {

  return (
    <Panel
      key={`hero-${currentEpisodeId}`}
      className="relative overflow-hidden p-5 md:p-6 episode-content-fade"
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
            onClick={() => onSelectorToggle(!isSelectorOpen)}
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
            onClose={() => onSelectorToggle(false)}
            onConfirm={onEpisodeSelect}
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

          {/* Overall progress badge */}
          {(() => {
            const totalEpisodes = availableEpisodes.length;
            const currentIndex = availableEpisodes.findIndex(e => e.id === currentEpisodeId);
            const watchedPct = totalEpisodes > 0 ? Math.round(((currentIndex + 1) / totalEpisodes) * 100) : 0;
            return (
              <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-stone-700/30 bg-stone-900/40 px-3 py-2">
                <p className="text-[0.70rem] text-muted">התקדמות כוללת:</p>
                <span className="rounded-full border border-amber-700/30 bg-amber-500/[0.10] px-2.5 py-1 text-xs font-semibold text-amber-200">
                  {currentIndex + 1} / {totalEpisodes} · {watchedPct}%
                </span>
              </div>
            );
          })()}

          {/* Episode summary */}
          <EpisodeSummaryCard
            currentEpisode={currentEpisode}
            focusCharacters={focusCharacters}
          />
        </div>
      </div>
    </Panel>
  );
}
