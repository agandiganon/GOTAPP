"use client";

import { BookOpenText, ChevronDown, Crown, MapPin, Scroll, Skull, Swords, Users } from "lucide-react";

import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations } from "@/data/seed";
import { getVisibleCharacterSnapshots, getVisibleLocationSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

/* ─── New design tokens (aligned with globals.css v3 "THE REALM") ─────────── */
// canvas:       rgb(8,10,16)
// panel:        rgb(20,24,36)
// panel-strong: rgb(28,33,50)
// accent:       rgb(210,168,90)
// border-gold:  rgba(210,168,90,0.22)

/* ─── Numbered badge ─────────────────────────────────────────────────────── */
function TurningPointBadge({ index }: { index: number }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{
        background: "linear-gradient(135deg, rgba(210,168,90,0.20), rgba(130,90,30,0.12))",
        border: "1px solid rgba(210,168,90,0.28)",
        color: "rgb(240,200,120)",
        boxShadow: "0 0 10px rgba(210,168,90,0.10)",
        fontFamily: "var(--font-cinzel), serif",
      }}
    >
      {index + 1}
    </div>
  );
}

/* ─── Section icon tile ───────────────────────────────────────────────────── */
function SectionIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType;
  color: "gold" | "blood" | "slate" | "ice";
}) {
  const palette = {
    gold:  { border: "rgba(210,168,90,0.30)", bg: "rgba(210,168,90,0.10)", text: "rgb(240,200,120)" },
    blood: { border: "rgba(140,30,42,0.40)",  bg: "rgba(110,24,34,0.16)",  text: "rgb(255,160,172)" },
    slate: { border: "rgba(90,105,140,0.32)", bg: "rgba(60,72,100,0.14)",  text: "rgb(170,180,210)" },
    ice:   { border: "rgba(100,140,185,0.30)", bg: "rgba(70,110,160,0.12)", text: "rgb(170,200,230)" },
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

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({
  caption,
  title,
  icon,
  iconColor,
}: {
  caption: string;
  title: string;
  icon: React.ElementType;
  iconColor: "gold" | "blood" | "slate" | "ice";
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

/* ─── Card surface — slate-navy glassmorphism ──────────────────────────────── */
function CardSurface({
  children,
  className = "",
  accentHex,
}: {
  children: React.ReactNode;
  className?: string;
  accentHex?: string;
}) {
  return (
    <div
      className={`rounded-[20px] p-4 ${className}`}
      style={{
        border: `1px solid ${accentHex ? `${accentHex}22` : "rgba(60,70,100,0.40)"}`,
        background: accentHex
          ? `linear-gradient(135deg, ${accentHex}0c, rgba(14,17,26,0.82))`
          : "rgba(20,24,36,0.70)",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main section panel ──────────────────────────────────────────────────── */
function SectionPanel({
  children,
  accentBorder = "rgba(60,70,100,0.45)",
  className = "",
}: {
  children: React.ReactNode;
  accentBorder?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] p-5 ${className}`}
      style={{
        background: "linear-gradient(160deg, rgba(20,24,36,0.97), rgba(10,13,20,0.99))",
        border: `1px solid ${accentBorder}`,
        boxShadow: "0 18px 54px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
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

  /* Notable deaths — characters with status "dead", sorted by importance */
  const notableDeaths = visibleCharacters
    .filter((c) => c.latestState.status === "dead" && (c.latestState.importance ?? 0) >= 55)
    .sort((a, b) => (b.latestState.importance ?? 0) - (a.latestState.importance ?? 0))
    .map((c) => {
      /* Find the episode when they first became dead */
      const deathEntry = c.timeline.find((t) => t.status === "dead");
      return { ...c, deathEpisodeId: deathEntry?.episodeId ?? c.latestState.episodeId };
    });

  return (
    <section className="space-y-4">

      {/* ══ HERO PANEL ════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-[28px] p-5"
        style={{
          background: "linear-gradient(160deg, rgba(22,26,42,0.97), rgba(8,10,16,0.99))",
          border: "1px solid rgba(210,168,90,0.16)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(210,168,90,0.08)",
        }}
      >
        {/* Ambient hero glow — gold at top */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(210,168,90,0.13), transparent 60%)",
          }}
        />

        <div className="relative space-y-4">
          {/* Episode badge row */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "linear-gradient(90deg, rgba(210,168,90,0.16), rgba(130,90,30,0.10))",
                border: "1px solid rgba(210,168,90,0.30)",
                color: "rgb(240,200,120)",
                boxShadow: "0 4px 14px rgba(210,168,90,0.10)",
                fontFamily: "var(--font-cinzel), serif",
                letterSpacing: "0.08em",
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              {currentEpisode.code}
            </div>
            <p
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.58rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(210,168,90,0.45)",
              }}
            >
              תקציר
            </p>
          </div>

          {/* Episode title */}
          <h1
            className="font-display text-3xl leading-tight"
            style={{ color: "rgb(225,215,195)" }}
          >
            {currentEpisode.title}
          </h1>

          {/* Snapshot */}
          <p className="text-sm leading-7 text-muted">{currentEpisode.summaries.snapshot}</p>

          {/* Full summary */}
          <div
            className="rounded-[18px] p-4"
            style={{
              background: "rgba(8,10,16,0.65)",
              border: "1px solid rgba(60,70,100,0.40)",
              borderTop: "2px solid rgba(210,168,90,0.28)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Scroll className="h-3.5 w-3.5 text-accent" />
              <p
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(210,168,90,0.60)",
                }}
              >
                התקציר המלא
              </p>
            </div>
            <p className="text-sm leading-8 text-ink">{currentEpisode.summaries.full}</p>
          </div>
        </div>
      </div>

      {/* ══ TURNING POINTS ════════════════════════════════════════════════════ */}
      <SectionPanel accentBorder="rgba(140,30,42,0.22)">
        <SectionHeader
          caption="נקודות מפנה"
          title="רגעי שבר"
          icon={Swords}
          iconColor="blood"
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
      </SectionPanel>

      {/* ══ NOTABLE DEATHS ════════════════════════════════════════════════════ */}
      {notableDeaths.length > 0 && (
        <SectionPanel accentBorder="rgba(100,20,30,0.30)">
          <SectionHeader
            caption="נפילות עיקריות"
            title={`${notableDeaths.length} דמויות שנפלו עד כאן`}
            icon={Skull}
            iconColor="blood"
          />
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {notableDeaths.map((char) => {
              const faction = factions.find(f => f.id === char.latestState.affiliationId);
              const accentColor = faction?.themeColor ?? "#8a3844";
              const shortEpId = char.deathEpisodeId.replace('S0', 'S').replace('E0', 'E');
              return (
                <div
                  key={char.id}
                  className="flex items-center gap-3 rounded-[18px] p-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(60,10,16,0.30), rgba(14,18,28,0.70))",
                    border: "1px solid rgba(100,20,30,0.28)",
                  }}
                >
                  {faction ? (
                    <FactionSigilBadge
                      name={faction.displayName}
                      sigilUrl={faction.factionSigilUrl ?? faction.sigil}
                      themeColor={accentColor}
                      className="h-8 w-8 shrink-0 opacity-70"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(100,20,30,0.18)",
                        border: "1px solid rgba(140,40,50,0.25)",
                      }}
                    >
                      <Skull className="h-3.5 w-3.5 text-[#f7c4cb]/60" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight text-ink/90">{char.name}</p>
                    <p className="mt-0.5 text-[0.68rem] text-muted">{faction?.displayName ?? "ללא שיוך"}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[0.60rem] font-semibold"
                    style={{
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.08em",
                      background: "rgba(100,20,30,0.22)",
                      border: "1px solid rgba(140,40,50,0.30)",
                      color: "rgb(242,165,172)",
                    }}
                  >
                    {shortEpId}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionPanel>
      )}

      {/* ══ FOCUS CHARACTERS ═════════════════════════════════════════════════ */}
      {focusCharacters.length > 0 && (
        <SectionPanel accentBorder="rgba(210,168,90,0.14)">
          <SectionHeader
            caption="מבט ממוקד"
            title="דמויות במוקד"
            icon={Users}
            iconColor="gold"
          />
          <div className="space-y-3">
            {focusCharacters.map((entry) => {
              const factionColor = factions.find(
                (f) => f.id === entry.character?.latestState.affiliationId,
              )?.themeColor;

              return (
                <CardSurface key={entry.characterId} accentHex={factionColor}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p
                      className="text-base font-semibold leading-snug"
                      style={{ color: factionColor ? `${factionColor}ee` : "rgb(225,215,195)" }}
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
                  <p className="text-sm leading-7 text-muted">{entry.summary}</p>
                  {entry.character?.latestState.summary ? (
                    <p
                      className="mt-3 border-t pt-3 text-sm leading-7 text-ink/70"
                      style={{
                        borderColor: factionColor
                          ? `${factionColor}18`
                          : "rgba(60,70,100,0.35)",
                      }}
                    >
                      {entry.character.latestState.summary}
                    </p>
                  ) : null}
                </CardSurface>
              );
            })}
          </div>
        </SectionPanel>
      )}

      {/* ══ MAIN LOCATIONS ════════════════════════════════════════════════════ */}
      {mainLocations.length > 0 && (
        <SectionPanel accentBorder="rgba(100,140,185,0.20)">
          <SectionHeader
            caption="זירות הפרק"
            title="מיקומים ראשיים"
            icon={MapPin}
            iconColor="ice"
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
                        background: "rgba(70,110,160,0.14)",
                        border: "1px solid rgba(100,140,185,0.24)",
                        color: "rgb(170,200,230)",
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
        </SectionPanel>
      )}

      {/* ══ EPISODE ARCHIVE ═══════════════════════════════════════════════════ */}
      <SectionPanel>
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
                  className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[18px] p-4 transition-colors duration-200 hover:bg-white/[0.025]"
                  style={{
                    background: "rgba(20,24,36,0.55)",
                    border: "1px solid rgba(60,70,100,0.38)",
                  }}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Episode code pill */}
                    <div
                      className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold"
                      style={{
                        background: "rgba(210,168,90,0.10)",
                        border: "1px solid rgba(210,168,90,0.22)",
                        color: "rgb(225,185,110)",
                        fontFamily: "var(--font-cinzel), serif",
                        letterSpacing: "0.06em",
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
                  className="mx-1 rounded-b-[18px] px-4 pb-4 pt-3"
                  style={{
                    background: "rgba(8,10,16,0.70)",
                    border: "1px solid rgba(60,70,100,0.30)",
                    borderTop: "none",
                  }}
                >
                  <p className="text-sm leading-8 text-ink">{episode.summaries.full}</p>

                  {episode.turningPoints.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p
                        style={{
                          fontFamily: "var(--font-cinzel), serif",
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          letterSpacing: "0.24em",
                          textTransform: "uppercase",
                          color: "rgba(210,168,90,0.45)",
                        }}
                      >
                        רגעי שבר
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {episode.turningPoints.map((tp, i) => (
                          <div key={tp.id} className="flex items-start gap-2.5">
                            <span
                              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
                              style={{
                                background: "rgba(210,168,90,0.12)",
                                border: "1px solid rgba(210,168,90,0.22)",
                                color: "rgb(225,185,110)",
                                fontFamily: "var(--font-cinzel), serif",
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
      </SectionPanel>
    </section>
  );
}
