"use client";

import { BookOpenText, ChevronDown, Crown, MapPin, Scroll, Swords, Users } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations } from "@/data/seed";
import { getVisibleCharacterSnapshots, getVisibleLocationSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

/* ─── tiny amber Roman-numeral-style index badge ─────────────────────────── */
function TurningPointBadge({ index }: { index: number }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{
        background: "linear-gradient(135deg, rgba(203,165,94,0.22), rgba(120,80,30,0.14))",
        border: "1px solid rgba(203,165,94,0.28)",
        color: "rgb(252,220,140)",
        boxShadow: "0 0 12px rgba(203,165,94,0.10)",
      }}
    >
      {index + 1}
    </div>
  );
}

/* ─── section icon tile ───────────────────────────────────────────────────── */
function SectionIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: "amber" | "rose" | "slate" | "teal";
}) {
  const palette = {
    amber: { border: "rgba(203,165,94,0.28)", bg: "rgba(203,165,94,0.10)", text: "rgb(252,220,140)" },
    rose:  { border: "rgba(160,50,60,0.35)",  bg: "rgba(140,35,45,0.14)",  text: "rgb(255,190,200)" },
    slate: { border: "rgba(120,120,140,0.30)", bg: "rgba(80,80,100,0.12)",  text: "rgb(190,190,210)" },
    teal:  { border: "rgba(70,140,120,0.30)",  bg: "rgba(50,110,90,0.12)",  text: "rgb(160,220,200)" },
  }[color];

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
      style={{ border: `1px solid ${palette.border}`, background: palette.bg, color: palette.text }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

/* ─── section header ──────────────────────────────────────────────────────── */
function SectionHeader({
  caption,
  title,
  icon,
  iconColor,
}: {
  caption: string;
  title: string;
  icon: React.ElementType;
  iconColor: "amber" | "rose" | "slate" | "teal";
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="space-y-1.5">
        <p className="text-caption">{caption}</p>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
      </div>
      <SectionIcon icon={icon} color={iconColor} />
    </div>
  );
}

/* ─── glassmorphism card surface ──────────────────────────────────────────── */
function CardSurface({
  children,
  className = "",
  accentColor,
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={`rounded-[22px] p-4 ${className}`}
      style={{
        border: `1px solid ${accentColor ? `${accentColor}20` : "rgba(255,255,255,0.07)"}`,
        background: accentColor
          ? `linear-gradient(135deg, ${accentColor}0d, rgba(14,11,8,0.78))`
          : "rgba(255,255,255,0.035)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export function SummaryScreen() {
  const { availableEpisodes, currentEpisode, currentEpisodeId } = useEpisode();

  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);
  const visibleLocations  = getVisibleLocationSnapshots(locations, currentEpisodeId, episodeIndex);

  const focusCharacters = currentEpisode.focusCharacters.map((entry) => ({
    ...entry,
    character: visibleCharacters.find((c) => c.id === entry.characterId) ?? null,
  }));

  const mainLocations = currentEpisode.mainLocationIds.map(
    (id) => visibleLocations.find((l) => l.id === id) ?? null,
  );

  const archiveEpisodes = availableEpisodes
    .filter((ep) => (episodeIndex[ep.id] ?? -1) < (episodeIndex[currentEpisodeId] ?? -1))
    .slice()
    .reverse();

  return (
    <section className="space-y-4">

      {/* ── HERO PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[28px] p-5"
        style={{
          background: "linear-gradient(160deg, rgba(30,23,16,0.95), rgba(12,9,7,0.98))",
          border: "1px solid rgba(203,165,94,0.14)",
          boxShadow: "0 20px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,245,215,0.06)",
        }}
      >
        {/* ambient hero glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(203,165,94,0.16), transparent 60%)",
          }}
        />

        <div className="relative space-y-4">
          {/* Episode badge row */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "linear-gradient(90deg, rgba(203,165,94,0.18), rgba(120,80,30,0.12))",
                border: "1px solid rgba(203,165,94,0.30)",
                color: "rgb(252,220,140)",
                boxShadow: "0 4px 14px rgba(203,165,94,0.10)",
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              {currentEpisode.code}
            </div>
            <p className="text-xs text-muted">תקציר</p>
          </div>

          {/* Episode title */}
          <h1
            className="font-display text-3xl leading-tight"
            style={{ color: "rgb(235,220,190)" }}
          >
            {currentEpisode.title}
          </h1>

          {/* Snapshot */}
          <p className="text-sm leading-7 text-muted">{currentEpisode.summaries.snapshot}</p>

          {/* Full summary collapsible */}
          <div
            className="rounded-[20px] p-4"
            style={{
              background: "rgba(14,11,8,0.55)",
              border: "1px solid rgba(203,165,94,0.10)",
              borderTop: "2px solid rgba(203,165,94,0.32)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs font-semibold tracking-wide text-accent/70">התקציר המלא</p>
            </div>
            <p className="text-sm leading-8 text-ink">{currentEpisode.summaries.full}</p>
          </div>
        </div>
      </div>

      {/* ── TURNING POINTS ─────────────────────────────────────────────────── */}
      <div
        className="rounded-[28px] p-5"
        style={{
          background: "linear-gradient(160deg, rgba(26,20,15,0.94), rgba(14,10,7,0.97))",
          border: "1px solid rgba(160,50,60,0.18)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,200,200,0.04)",
        }}
      >
        <SectionHeader
          caption="נקודות מפנה"
          title="רגעי שבר"
          icon={Swords}
          iconColor="rose"
        />

        <div className="space-y-3">
          {currentEpisode.turningPoints.map((tp, index) => (
            <CardSurface key={tp.id}>
              <div className="flex items-start gap-3">
                <TurningPointBadge index={index} />
                <p className="mt-0.5 text-sm leading-7 text-ink">{tp.summary}</p>
              </div>
            </CardSurface>
          ))}
        </div>
      </div>

      {/* ── FOCUS CHARACTERS ───────────────────────────────────────────────── */}
      {focusCharacters.length > 0 && (
        <div
          className="rounded-[28px] p-5"
          style={{
            background: "linear-gradient(160deg, rgba(24,19,14,0.94), rgba(14,10,7,0.97))",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 16px 50px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,245,215,0.04)",
          }}
        >
          <SectionHeader
            caption="מבט ממוקד"
            title="דמויות במוקד"
            icon={Users}
            iconColor="amber"
          />

          <div className="space-y-3">
            {focusCharacters.map((entry) => {
              const factionColor = factions.find(
                (f) => f.id === entry.character?.latestState.affiliationId,
              )?.themeColor;

              return (
                <CardSurface key={entry.characterId} accentColor={factionColor}>
                  {/* Name row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p
                      className="text-base font-semibold leading-snug"
                      style={{ color: factionColor ? `${factionColor}ee` : "rgb(232,224,210)" }}
                    >
                      {entry.character?.name ?? entry.characterId}
                    </p>
                    {entry.character ? (
                      <StatusPill
                        status={entry.character.latestState.status}
                        label={entry.character.latestState.statusLabel}
                      />
                    ) : null}
                  </div>

                  {/* Episode-specific summary */}
                  <p className="text-sm leading-7 text-muted">{entry.summary}</p>

                  {/* Character's latest state summary */}
                  {entry.character?.latestState.summary ? (
                    <p
                      className="mt-3 border-t pt-3 text-sm leading-7 text-ink/70"
                      style={{ borderColor: factionColor ? `${factionColor}18` : "rgba(255,255,255,0.06)" }}
                    >
                      {entry.character.latestState.summary}
                    </p>
                  ) : null}
                </CardSurface>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN LOCATIONS ─────────────────────────────────────────────────── */}
      {mainLocations.length > 0 && (
        <div
          className="rounded-[28px] p-5"
          style={{
            background: "linear-gradient(160deg, rgba(22,18,14,0.94), rgba(12,9,7,0.97))",
            border: "1px solid rgba(80,130,110,0.18)",
            boxShadow: "0 16px 50px rgba(0,0,0,0.38), inset 0 1px 0 rgba(160,220,200,0.03)",
          }}
        >
          <SectionHeader
            caption="זירות הפרק"
            title="מיקומים ראשיים"
            icon={MapPin}
            iconColor="teal"
          />

          <div className="space-y-3">
            {currentEpisode.mainLocationLabels.map((label, index) => {
              const location = mainLocations[index];

              return (
                <CardSurface key={label}>
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(50,110,90,0.14)",
                        border: "1px solid rgba(70,140,120,0.22)",
                        color: "rgb(160,220,200)",
                      }}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-ink">{label}</p>
                      <p className="mt-1.5 text-sm leading-7 text-muted">
                        {location?.latestHistory?.summary ??
                          "הפרק מציין את המיקום הזה במפורש, אך טרם חוברה לו היסטוריה טקסטואלית נפרדת."}
                      </p>
                    </div>
                  </div>
                </CardSurface>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EPISODE ARCHIVE ────────────────────────────────────────────────── */}
      <div
        className="rounded-[28px] p-5"
        style={{
          background: "linear-gradient(160deg, rgba(22,18,14,0.94), rgba(12,9,7,0.97))",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,245,215,0.04)",
        }}
      >
        <SectionHeader
          caption="ארכיון בטוח"
          title="ארכיון פרקים קודמים"
          icon={BookOpenText}
          iconColor="slate"
        />

        <p className="mb-4 text-xs leading-6 text-muted">
          הרשימה כוללת רק פרקים שקודמים לפרק הפעיל. שום תוכן עתידי לא נכלל.
        </p>

        {archiveEpisodes.length === 0 ? (
          <CardSurface>
            <p className="text-sm text-muted">אין עדיין ארכיון קודם לפני {currentEpisode.code}.</p>
          </CardSurface>
        ) : (
          <div className="space-y-2.5">
            {archiveEpisodes.map((episode) => (
              <details key={episode.id} className="group">
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[20px] p-4 transition-colors duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Episode code pill */}
                    <div
                      className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold"
                      style={{
                        background: "rgba(203,165,94,0.10)",
                        border: "1px solid rgba(203,165,94,0.22)",
                        color: "rgb(215,182,118)",
                      }}
                    >
                      {episode.code}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{episode.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                        {episode.summaries.snapshot}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>

                {/* Expanded content */}
                <div
                  className="mx-1 rounded-b-[20px] px-4 pb-4 pt-3"
                  style={{
                    background: "rgba(14,11,8,0.55)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: "none",
                  }}
                >
                  {/* Full summary */}
                  <p className="text-sm leading-8 text-ink">{episode.summaries.full}</p>

                  {/* Turning-point chips */}
                  {episode.turningPoints.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted">
                        רגעי שבר
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {episode.turningPoints.map((tp, i) => (
                          <div key={tp.id} className="flex items-start gap-2.5">
                            <span
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
                              style={{
                                background: "rgba(203,165,94,0.12)",
                                border: "1px solid rgba(203,165,94,0.22)",
                                color: "rgb(215,182,118)",
                              }}
                            >
                              {i + 1}
                            </span>
                            <p className="text-xs leading-5 text-muted">{tp.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
