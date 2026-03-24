"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Clapperboard, Layers3, X } from "lucide-react";

import type { EpisodeId, EpisodeRecord } from "@/data/schemas";
import { formatEpisodeLabel } from "@/lib/episodes";
import { cn } from "@/lib/utils";

type SelectorStep = "season" | "episode" | "warning";

interface EpisodeSelectorSheetProps {
  isOpen: boolean;
  episodes: EpisodeRecord[];
  currentEpisodeId: EpisodeId;
  onClose: () => void;
  onConfirm: (episodeId: EpisodeId) => void;
}

export function EpisodeSelectorSheet({
  isOpen,
  episodes,
  currentEpisodeId,
  onClose,
  onConfirm,
}: EpisodeSelectorSheetProps) {
  const seasons = useMemo(
    () => Array.from(new Set(episodes.map((episode) => episode.season))).sort((a, b) => a - b),
    [episodes],
  );
  const currentEpisode = episodes.find((episode) => episode.id === currentEpisodeId) ?? episodes[0] ?? null;
  const [step, setStep] = useState<SelectorStep>("season");
  const [activeSeason, setActiveSeason] = useState<number | null>(currentEpisode?.season ?? seasons[0] ?? null);
  const [pendingEpisodeId, setPendingEpisodeId] = useState<EpisodeId | null>(null);

  const seasonGroups = useMemo(
    () =>
      seasons.map((season) => ({
        season,
        episodes: episodes.filter((episode) => episode.season === season),
      })),
    [episodes, seasons],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep("season");
    setActiveSeason(currentEpisode?.season ?? seasons[0] ?? null);
    setPendingEpisodeId(null);
  }, [currentEpisode, isOpen, seasons]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentEpisode) {
    return null;
  }

  const seasonEpisodes = episodes.filter((episode) => episode.season === activeSeason);
  const pendingEpisode =
    (pendingEpisodeId ? episodes.find((episode) => episode.id === pendingEpisodeId) : null) ?? null;

  const openSeason = (season: number) => {
    setActiveSeason(season);
    setStep("episode");
  };

  const openWarning = (episodeId: EpisodeId) => {
    setPendingEpisodeId(episodeId);
    setStep("warning");
  };

  const confirmSelection = () => {
    if (!pendingEpisode) {
      return;
    }

    onConfirm(pendingEpisode.id);
  };

  return (
    <div
      className="mt-3 w-full rounded-[22px] border border-white/[0.08] bg-canvas/[0.42] p-4 text-white backdrop-blur-xl"
      role="dialog"
      aria-labelledby="episode-selector-title"
      aria-modal="false"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-caption">בחירת פרק</p>
          <h3 id="episode-selector-title" className="font-display text-xl text-ink">
            {step === "season"
              ? "בחירת עונה"
              : step === "episode"
                ? `עונה ${activeSeason}`
                : "אזהרת ספוילר!"}
          </h3>
          <p className="text-sm leading-6 text-muted">
            {step === "season"
              ? "בחר/י עונה כדי לראות את הפרקים הזמינים."
              : step === "episode"
                ? "בחר/י פרק מתוך העונה שנפתחה."
                : "אזהרת ספוילר! לעדכן לפרק זה?"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600/80 bg-white/[0.04] text-muted transition hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {step === "season" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {seasonGroups.map(({ season, episodes: items }) => {
              const isCurrentSeason = currentEpisode.season === season;

              return (
                <button
                  key={season}
                  type="button"
                  onClick={() => openSeason(season)}
                  className="rounded-[20px] border border-white/[0.08] bg-white/[0.05] px-3 py-4 text-right transition hover:border-accent/20 hover:bg-white/[0.07]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.12] text-accent">
                        <Layers3 className="h-4 w-4" />
                      </span>
                      {isCurrentSeason ? (
                        <span className="rounded-full border border-[#6c9a78]/25 bg-[#6c9a78]/[0.14] px-2 py-1 text-[0.62rem] text-[#d9eadc]">
                          פעילה
                        </span>
                      ) : null}
                    </div>
                    <p className="text-base font-semibold text-ink">עונה {season}</p>
                    <p className="text-xs text-muted">{items.length} פרקים</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === "episode" ? (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("season")}
              className="flex items-center gap-2 rounded-full border border-line/10 bg-white/[0.05] px-3 py-2 text-xs text-muted transition hover:text-ink"
            >
              <ArrowRight className="h-4 w-4" />
              חזור
            </button>

            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.12] text-accent">
                <Clapperboard className="h-4 w-4" />
              </span>
              <span>עונה {activeSeason}</span>
            </div>
          </div>

          <div className="max-h-[18rem] space-y-2 overflow-y-auto pr-1">
            {seasonEpisodes.map((episode) => {
              const isCurrent = currentEpisodeId === episode.id;

              return (
                <button
                  key={episode.id}
                  type="button"
                  onClick={() => openWarning(episode.id)}
                  className={cn(
                    "w-full rounded-[16px] border px-3 py-3 text-right transition",
                    isCurrent
                      ? "border-[#6c9a78]/20 bg-[#6c9a78]/[0.08]"
                      : "border-line/10 bg-white/[0.05] hover:border-line/20 hover:bg-white/[0.07]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">פרק {episode.episode}</span>
                    {isCurrent ? (
                      <span className="rounded-full border border-[#6c9a78]/25 bg-[#6c9a78]/[0.14] px-2 py-1 text-[0.62rem] text-[#d9eadc]">
                        פעיל כעת
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === "warning" && pendingEpisode ? (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("episode")}
              className="flex items-center gap-2 rounded-full border border-line/10 bg-white/[0.05] px-3 py-2 text-xs text-muted transition hover:text-ink"
            >
              <ArrowRight className="h-4 w-4" />
              חזור
            </button>
          </div>

          <div className="rounded-[20px] border border-[#7b4d56]/30 bg-[#7b4d56]/[0.15] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#7b4d56]/35 bg-[#7b4d56]/[0.18] text-[#f0d5d9]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-ink">אזהרת ספוילר!</h4>
                <p className="text-sm leading-6 text-[#e7d7da]">
                  האם אתה בטוח שסיימת לצפות בפרק זה? האפליקציה תעדכן את כל המידע, הסטטוסים
                  והמפה עד לנקודה זו.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-3">
            <p className="text-xs text-muted">הפרק שנבחר</p>
            <p className="mt-1.5 text-sm font-semibold text-ink">{formatEpisodeLabel(pendingEpisode)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStep("episode")}
              className="flex items-center justify-center rounded-[18px] border border-line/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-white/[0.08]"
            >
              ביטול
            </button>

            <button
              type="button"
              onClick={confirmSelection}
              className="flex items-center justify-center gap-2 rounded-[18px] border border-accent/25 bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition hover:brightness-110"
            >
              <Check className="h-4 w-4" />
              אישור
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
