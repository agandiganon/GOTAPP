"use client";

import { useEffect, useRef } from "react";
import { MapPin, X, Clock, Shield } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { factions, locations, episodeIndex, episodes } from "@/data/seed";
import type { CharacterRecord, CharacterTimelineEntry } from "@/data/schemas";
import { getVisibleTimelineEntries } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

type CharacterSnapshot = CharacterRecord & { latestState: CharacterTimelineEntry };

interface CharacterDetailDrawerProps {
  character: CharacterSnapshot | null;
  onClose: () => void;
}

export function CharacterDetailDrawer({ character, onClose }: CharacterDetailDrawerProps) {
  const { currentEpisodeId } = useEpisode();
  const drawerRef = useRef<HTMLDivElement>(null);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Prevent body scroll when open */
  useEffect(() => {
    if (character) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [character]);

  if (!character) return null;

  const faction   = factions.find(f => f.id === character.latestState.affiliationId);
  const location  = locations.find(l => l.id === character.latestState.locationId);
  const accentColor = faction?.themeColor ?? "#d2a85a";

  /* All timeline entries visible up to current episode */
  const visibleTimeline = getVisibleTimelineEntries(
    character.timeline,
    currentEpisodeId,
    episodeIndex,
  ).reverse(); /* newest first */

  const episodeTitleMap = Object.fromEntries(episodes.map(e => [e.id, e.title]));

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: "fadeIn 180ms ease" }}
      />

      {/* ── Drawer ────────────────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`פרטי ${character.name}`}
        className="fixed inset-x-0 bottom-0 z-[201] mx-auto max-w-[520px] md:max-w-[680px]"
        style={{ animation: "slideUp 260ms cubic-bezier(0.34,1.12,0.64,1)" }}
      >
        <div
          className="relative flex max-h-[88vh] flex-col overflow-hidden rounded-t-[32px]"
          style={{
            background: "linear-gradient(180deg, rgba(20,24,38,0.99), rgba(8,10,16,1))",
            border: "1px solid rgba(60,70,100,0.50)",
            borderBottom: "none",
            boxShadow: "0 -24px 80px rgba(0,0,0,0.75)",
          }}
        >
          {/* ── Drag handle ──────────────────────────────────────────────── */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="h-1 w-10 rounded-full"
              style={{ background: "rgba(210,168,90,0.25)" }}
            />
          </div>

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex items-start gap-4 px-5 py-3">

            {/* Portrait */}
            {character.characterImageUrl && (
              <div
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl"
                style={{
                  border: `1px solid ${accentColor}30`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px ${accentColor}18`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/image-proxy?url=${encodeURIComponent(character.characterImageUrl)}`}
                  alt={character.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center 15%" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${accentColor}22 0%, transparent 60%)`,
                  }}
                />
              </div>
            )}

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <h2
                className="text-xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-display), serif", color: "rgb(232,220,200)" }}
              >
                {character.name}
              </h2>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusPill
                  status={character.latestState.status}
                  label={character.latestState.statusLabel}
                />
                {faction && (
                  <span
                    className="rounded-full px-2.5 py-1 text-[0.65rem] font-semibold"
                    style={{
                      background: `${accentColor}14`,
                      border: `1px solid ${accentColor}28`,
                      color: accentColor,
                    }}
                  >
                    {faction.displayName}
                  </span>
                )}
              </div>

              {location && (
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted" />
                  <span className="text-xs text-muted">{location.name}</span>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ border: "1px solid rgba(60,70,100,0.45)" }}
              aria-label="סגור"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>

          {/* ── Description ──────────────────────────────────────────────── */}
          {character.baseDescription && (
            <div
              className="mx-5 mb-3 rounded-[16px] px-4 py-3"
              style={{
                background: `linear-gradient(135deg, ${accentColor}0a, rgba(14,18,26,0.70))`,
                border: `1px solid ${accentColor}18`,
              }}
            >
              <p className="text-sm leading-7 text-ink/85">{character.baseDescription}</p>
            </div>
          )}

          {/* ── Current status summary ────────────────────────────────────── */}
          {character.latestState.summary && (
            <div className="mx-5 mb-3 flex items-start gap-3">
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(210,168,90,0.10)", border: "1px solid rgba(210,168,90,0.22)" }}
              >
                <Shield className="h-3.5 w-3.5 text-accent" />
              </div>
              <p className="text-sm leading-7 text-muted">{character.latestState.summary}</p>
            </div>
          )}

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div
            className="mx-5 mb-3"
            style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(60,70,100,0.55) 40%, rgba(60,70,100,0.55) 60%, transparent)" }}
          />

          {/* ── Timeline (scrollable) ─────────────────────────────────────── */}
          <div className="overflow-y-auto px-5 pb-8">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted" />
              <p
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.56rem",
                  fontWeight: 700,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "rgba(210,168,90,0.50)",
                }}
              >
                היסטוריה עד הפרק הנוכחי
              </p>
            </div>

            {visibleTimeline.length === 0 ? (
              <p className="text-sm text-muted">אין רשומות היסטוריה זמינות עדיין.</p>
            ) : (
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div
                  className="absolute right-[11px] top-2 bottom-2 w-px"
                  style={{ background: "linear-gradient(to bottom, rgba(210,168,90,0.25), rgba(60,70,100,0.30) 60%, transparent)" }}
                />

                {visibleTimeline.map((entry, i) => (
                  <div key={`${entry.episodeId}-${i}`} className="relative flex gap-4 pb-4">
                    {/* Dot */}
                    <div className="relative z-10 mt-1 shrink-0">
                      <div
                        className="h-[10px] w-[10px] rounded-full"
                        style={{
                          background: i === 0 ? accentColor : "rgba(60,70,100,0.70)",
                          border: i === 0 ? `2px solid ${accentColor}60` : "1px solid rgba(60,70,100,0.50)",
                          boxShadow: i === 0 ? `0 0 8px ${accentColor}40` : "none",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="rounded-full px-2 py-0.5 text-[0.60rem] font-semibold"
                          style={{
                            background: "rgba(210,168,90,0.10)",
                            border: "1px solid rgba(210,168,90,0.20)",
                            color: "rgb(220,180,105)",
                            fontFamily: "var(--font-cinzel), serif",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {entry.episodeId}
                        </span>
                        {episodeTitleMap[entry.episodeId] && (
                          <span className="text-[0.65rem] text-muted truncate max-w-[160px]">
                            {episodeTitleMap[entry.episodeId]}
                          </span>
                        )}
                        {i === 0 && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold"
                            style={{
                              background: `${accentColor}18`,
                              border: `1px solid ${accentColor}30`,
                              color: accentColor,
                              fontFamily: "var(--font-cinzel), serif",
                              letterSpacing: "0.1em",
                            }}
                          >
                            עדכני
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-5 text-ink/80">{entry.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
