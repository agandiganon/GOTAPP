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

  return (
    <div className="relative z-[70] mt-3 overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(14,18,30,0.92),rgba(10,13,22,0.88))] shadow-[0_28px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-4 py-4">
        <div className="space-y-1.5">
          <p className="text-caption">בחירת פרק</p>
          <h3 className="font-display text-xl text-ink">
            {step === "season"
              ? "בחירת עונה"
              : step === "episode"
                ? `עונה ${activeSeason}`
                : "אישור מעבר לפרק"}
          </h3>
          <p className="text-sm leading-6 text-muted">
            {step === "season"
              ? "פתח/י עונה כדי לבחור פרק בלי לצאת ממסך הבית."
              : step === "episode"
                ? "בחר/י פרק ספציפי. המעבר יעדכן את כל המסכים מיידית."
                : "אישור אחד אחרון לפני שהאפליקציה תעדכן את כל שכבות הספוילר."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted transition hover:text-ink"
          aria-label="סגירת בחירת פרק"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {step === "season" ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {seasonGroups.map(({ season, episodes: items }) => {
            const isCurrentSeason = currentEpisode.season === season;

            return (
              <button
                key={season}
                type="button"
                onClick={() => openSeason(season)}
                className="rounded-[22px] border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-right transition hover:border-accent/20 hover:bg-accent/[0.08]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.12] text-accent">
                      <Layers3 className="h-4 w-4" />
                    </span>
                    {isCurrentSeason ? (
                      <span className="rounded-full border border-[#6c9a78]/25 bg-[#6c9a78]/[0.14] px-2 py-1 text-[0.62rem] text-[#d9eadc]">
                        פעילה
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-base font-semibold text-ink">עונה {season}</p>
                    <p className="mt-1 text-xs text-muted">{items.length} פרקים</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {step === "episode" ? (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("season")}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-muted transition hover:text-ink"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לעונות
            </button>

            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.12] text-accent">
                <Clapperboard className="h-4 w-4" />
              </span>
              עונה {activeSeason}
            </div>
          </div>

          <div className="grid max-h-[19rem] gap-2 overflow-y-auto pr-1">
            {seasonEpisodes.map((episode) => {
              const isCurrent = currentEpisodeId === episode.id;

              return (
                <button
                  key={episode.id}
                  type="button"
                  onClick={() => openWarning(episode.id)}
                  className={cn(
                    "rounded-[18px] border px-4 py-3 text-right transition",
                    isCurrent
                      ? "border-[#6c9a78]/20 bg-[#6c9a78]/[0.08]"
                      : "border-white/[0.08] bg-white/[0.04] hover:border-accent/20 hover:bg-white/[0.06]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">{formatEpisodeLabel(episode)}</p>
                      <p className="text-xs text-muted">עונה {episode.season} · פרק {episode.episode}</p>
                    </div>
                    {isCurrent ? (
                      <span className="rounded-full border border-[#6c9a78]/25 bg-[#6c9a78]/[0.14] px-2 py-1 text-[0.62rem] text-[#d9eadc]">
                        פעיל
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {step === "warning" && pendingEpisode ? (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("episode")}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-muted transition hover:text-ink"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לפרקים
            </button>
          </div>

          <div className="rounded-[22px] border border-[#7b4d56]/30 bg-[#7b4d56]/[0.12] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#7b4d56]/35 bg-[#7b4d56]/[0.18] text-[#f0d5d9]">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-ink">אזהרת ספוילר</h4>
                <p className="text-sm leading-6 text-[#e8d9dc]">
                  המעבר יעדכן את הדמויות, הפוליטיקה, המפה והתקציר עד לפרק שבחרת בלבד.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-muted">יעודכן אל</p>
            <p className="mt-2 text-sm font-semibold text-ink">{formatEpisodeLabel(pendingEpisode)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStep("episode")}
              className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-ink transition hover:bg-white/[0.07]"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={() => onConfirm(pendingEpisode.id)}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-accent/20 bg-accent/[0.14] px-4 py-3 text-sm font-semibold text-accent transition hover:bg-accent/[0.2]"
            >
              <Check className="h-4 w-4" />
              אישור ועדכון
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
