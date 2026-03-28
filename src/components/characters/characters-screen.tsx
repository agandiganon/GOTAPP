"use client";

import { MapPin, Search, Shield, SlidersHorizontal, User, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { CharacterDetailDrawer } from "@/components/characters/character-detail-drawer";
import { CharacterPortrait } from "@/components/characters/character-portrait";
import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations } from "@/data/seed";
import type { CharacterRecord, CharacterStatus, CharacterTimelineEntry } from "@/data/schemas";
import { getVisibleCharacterSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

type CharacterSnapshot = CharacterRecord & { latestState: CharacterTimelineEntry };

/* ─── Fuzzy Search Helper ────────────────────────────────────────────────── */
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  // Exact substring match
  if (t.includes(q)) return true;
  // Character-by-character fuzzy
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

/* ─── Sort ──────────────────────────────────────────────────────────────── */
type SortMode = "importance" | "status" | "name";

const sortLabels: Record<SortMode, string> = {
  importance: "לפי חשיבות",
  status:     "לפי סטטוס",
  name:       "א-ת",
};

const statusSortOrder: Record<CharacterStatus, number> = {
  dead:         0,
  captive:      1,
  incapacitated:2,
  injured:      3,
  missing:      4,
  disguised:    5,
  recovering:   6,
  away:         7,
  dismissed:    8,
  recruit:      9,
  training:     10,
  pregnant:     11,
  sworn:        12,
  appointed:    13,
  ruler:        14,
  transformed:  15,
  released:     16,
  active:       17,
};

/* ─────────────────────────────────────────────────────────────────────────
   SCREEN
   ───────────────────────────────────────────────────────────────────────── */
export function CharactersScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const [query, setQuery]               = useState("");
  const [sortMode, setSortMode]         = useState<SortMode>("importance");
  const [factionFilter, setFactionFilter] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSnapshot | null>(null);
  const [visibleCount, setVisibleCount]  = useState(20);

  /* ── Anti-spoiler logic — DO NOT TOUCH ────────────────────────────────── */
  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);

  /* Factions that actually appear in the visible set */
  const activeFactionIds = Array.from(
    new Set(visibleCharacters.map((c) => c.latestState.affiliationId).filter(Boolean))
  ) as string[];
  const activeFactions = factions
    .filter((f) => activeFactionIds.includes(f.id))
    .sort((a, b) => {
      // sort by character count descending
      const countA = visibleCharacters.filter(c => c.latestState.affiliationId === a.id).length;
      const countB = visibleCharacters.filter(c => c.latestState.affiliationId === b.id).length;
      return countB - countA;
    });

  const factionCounts = new Map<string, number>();
  visibleCharacters.forEach(c => {
    const id = c.latestState.affiliationId;
    if (id) factionCounts.set(id, (factionCounts.get(id) ?? 0) + 1);
  });

  const filteredCharacters = visibleCharacters.filter((character) => {
    const faction = factions.find((f) => f.id === character.latestState.affiliationId);
    const factionName = faction?.displayName ?? "";
    const locationName =
      locations.find((location) => location.id === character.latestState.locationId)?.name ?? "";
    const haystack = [
      character.name,
      factionName,
      locationName,
      character.baseDescription,
      character.latestState.statusLabel,
      character.latestState.summary,
    ]
      .join(" ");

    const matchesQuery = fuzzyMatch(haystack, query);
    const matchesFaction = factionFilter === null || character.latestState.affiliationId === factionFilter;
    return matchesQuery && matchesFaction;
  });

  const sortedCharacters = [...filteredCharacters].sort((characterA, characterB) => {
    if (sortMode === "name") {
      return characterA.name.localeCompare(characterB.name, "he");
    }
    if (sortMode === "status") {
      const statusDelta =
        statusSortOrder[characterA.latestState.status] -
        statusSortOrder[characterB.latestState.status];
      if (statusDelta !== 0) return statusDelta;
      return characterB.latestState.importance - characterA.latestState.importance;
    }
    return characterB.latestState.importance - characterA.latestState.importance;
  });

  /* Reset visible count when filters, sort, or episode changes */
  useEffect(() => {
    setVisibleCount(20);
  }, [query, sortMode, factionFilter, currentEpisodeId]);

  const statusSummary = {
    dead:    visibleCharacters.filter((c) => c.latestState.status === "dead").length,
    captive: visibleCharacters.filter((c) => c.latestState.status === "captive").length,
    missing: visibleCharacters.filter((c) => c.latestState.status === "missing").length,
    active:  visibleCharacters.filter((c) =>
      ["active","appointed","ruler","sworn","transformed","released"].includes(c.latestState.status)
    ).length,
  };
  /* ── End anti-spoiler block ───────────────────────────────────────────── */

  return (
    <section
      key={`characters-${currentEpisodeId}`}
      className="space-y-5 pb-24 md:pb-6 episode-content-fade"
      style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      dir="rtl"
    >

      {/* ── Hero stats panel ─────────────────────────────────────────── */}
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-60" />

        <div className="relative space-y-5">
          <div className="space-y-2">
            <p className="text-caption">דמויות</p>
            <h1 className="font-display text-[2rem] text-ink sm:text-3xl leading-tight">
              מי גלוי לצופה עד {currentEpisode.code}
            </h1>
            <p className="max-w-[36ch] text-sm leading-7 text-muted">
              כל כרטיס מציג רק מצב, שיוך ומיקום שכבר נחשפו לצופה. אין קפיצה קדימה מעבר לפרק שבחרת.
            </p>
          </div>

          {/* Visible / filtered count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-stone-700/35 bg-stone-900/55 p-3.5 backdrop-blur-md
                            shadow-[inset_0_1px_0_rgba(255,245,215,0.05)]">
              <p className="text-[0.7rem] text-stone-400">דמויות גלויות</p>
              <p className="mt-1.5 text-[1.75rem] font-display font-semibold text-amber-100 leading-none">
                {visibleCharacters.length}
              </p>
            </div>
            <div className="rounded-[20px] border border-stone-700/35 bg-stone-900/55 p-3.5 backdrop-blur-md
                            shadow-[inset_0_1px_0_rgba(255,245,215,0.05)]">
              <p className="text-[0.7rem] text-stone-400">מסוננות כעת</p>
              <p className="mt-1.5 text-[1.75rem] font-display font-semibold text-amber-100 leading-none">
                {sortedCharacters.length}
              </p>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-[18px] border border-stone-700/35 bg-stone-950/55 px-3 py-3">
              <p className="text-[0.66rem] text-stone-400">פעילות</p>
              <p className="mt-1 text-base font-semibold text-stone-100">{statusSummary.active}</p>
            </div>
            <div className="rounded-[18px] border border-danger/25 bg-danger/[0.12] px-3 py-3">
              <p className="text-[0.66rem] text-[#f3c3ca]">מתות / מתים</p>
              <p className="mt-1 text-base font-semibold text-stone-100">{statusSummary.dead}</p>
            </div>
            <div className="rounded-[18px] border border-[#c18b4d]/22 bg-[#c18b4d]/10 px-3 py-3">
              <p className="text-[0.66rem] text-[#f0cfaa]">שבויים</p>
              <p className="mt-1 text-base font-semibold text-stone-100">{statusSummary.captive}</p>
            </div>
            <div className="rounded-[18px] border border-[#7e97b3]/20 bg-[#7e97b3]/10 px-3 py-3">
              <p className="text-[0.66rem] text-[#d8e3ef]">נעדרים</p>
              <p className="mt-1 text-base font-semibold text-stone-100">{statusSummary.missing}</p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Search & sort ────────────────────────────────────────────── */}
      <Panel className="p-4">
        <div className="space-y-3.5">
          {/* Search input */}
          <label className="flex items-center gap-3 rounded-[22px] border border-stone-700/35 bg-stone-950/60 px-4 py-3.5 backdrop-blur-md
                            focus-within:border-amber-800/40 focus-within:bg-stone-900/70 transition">
            <Search className="h-4 w-4 shrink-0 text-stone-500" />
            <input
              type="search"
              dir="rtl"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לפי שם, בית, מיקום או סטטוס"
              className="w-full bg-transparent text-[0.9rem] text-stone-100 outline-none placeholder:text-stone-500"
              aria-label="חיפוש דמויות"
            />
          </label>

          {/* Sort pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-stone-700/35 bg-stone-950/50 px-3 py-2 text-[0.72rem] text-stone-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              מיון
            </div>

            {(["importance", "status", "name"] as SortMode[]).map((mode) => {
              const isActive = sortMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[0.72rem] font-medium transition-all duration-200 ${
                    isActive
                      ? "border-amber-700/35 bg-amber-500/[0.12] text-amber-200 shadow-[0_0_20px_rgba(203,165,92,0.08)]"
                      : "border-stone-700/35 bg-stone-950/50 text-stone-400 hover:border-stone-600/45 hover:text-stone-200"
                  }`}
                >
                  {sortLabels[mode]}
                </button>
              );
            })}
          </div>

          {/* Faction filter — horizontal scroll */}
          <div className="-mx-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center gap-2 px-1" style={{ width: "max-content" }}>
              {/* "All" pill */}
              <button
                type="button"
                onClick={() => setFactionFilter(null)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.70rem] font-medium transition-all duration-200 ${
                  factionFilter === null
                    ? "border-[#3c4664]/60 bg-[#2a3050]/70 text-[#c8d8f0]"
                    : "border-stone-700/30 bg-stone-950/40 text-stone-500 hover:text-stone-300"
                }`}
              >
                הכל
              </button>
              {activeFactions.slice(0, 12).map((faction) => {
                const isActive = factionFilter === faction.id;
                const color = faction.themeColor ?? "#a07840";
                const count = factionCounts.get(faction.id) ?? 0;
                return (
                  <button
                    key={faction.id}
                    type="button"
                    onClick={() => setFactionFilter(isActive ? null : faction.id)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.70rem] font-medium transition-all duration-200"
                    style={{
                      background: isActive ? `${color}15` : "rgba(8,10,16,0.60)",
                      border: isActive ? `1px solid ${color}38` : "1px solid rgba(60,70,100,0.30)",
                      color: isActive ? color : "rgb(130,130,150)",
                    }}
                  >
                    {faction.displayName}
                    <span style={{ opacity: 0.5, marginRight: 4, fontSize: "0.62rem" }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {sortedCharacters.length === 0 && (
        <Panel className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-700/40 bg-stone-900/60">
              <User className="h-5 w-5 text-stone-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">לא נמצאו דמויות לחיפוש הזה</p>
              <p className="mt-1 text-sm leading-7 text-muted">
                נסה/י לחפש בשם, בבית, במיקום או בסטטוס כפי שהם גלויים עד הפרק הנבחר.
              </p>
            </div>
          </div>
        </Panel>
      )}

      {/* ── Character cards grid ─────────────────────────────────────── */}
      {sortedCharacters.length > 0 && (
        <>
          <div className="character-grid-desktop grid grid-cols-1 gap-5 sm:grid-cols-2">
            {sortedCharacters.slice(0, visibleCount).map((character) => {
            const faction = factions.find((item) => item.id === character.latestState.affiliationId);
            const locationName = locations.find((l) => l.id === character.latestState.locationId)?.name ?? null;
            const factionColor = faction?.themeColor ?? "#a07840";

            return (
              <article
                key={character.id}
                dir="rtl"
                className="character-card-frame group overflow-hidden rounded-[26px] cursor-pointer"
                style={{
                  border: `1px solid ${factionColor}28`,
                  background: "linear-gradient(175deg, rgba(14,18,30,0.99), rgba(8,10,18,1))",
                  boxShadow: `0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 ${factionColor}0a, 0 0 0 0 ${factionColor}00`,
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
                onClick={() => setSelectedCharacter(character)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedCharacter(character); }}
                aria-label={`פרטי ${character.name}`}
              >

                {/* ── Portrait zone ────────────────────────────── */}
                <div className="relative h-72 w-full sm:h-80 overflow-hidden">
                  <CharacterPortrait
                    name={character.name}
                    imageUrl={character.characterImageUrl ?? character.portrait}
                    factionColor={factionColor}
                    className="h-full w-full"
                  />

                  {/* Cinematic bottom gradient — name lives here */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `
                        linear-gradient(to top,
                          rgba(8,10,16,1)   0%,
                          rgba(8,10,16,0.85) 20%,
                          rgba(8,10,16,0.18) 46%,
                          transparent       72%
                        ),
                        linear-gradient(to right,
                          rgba(8,10,16,0.22) 0%,
                          transparent       55%
                        )
                      `,
                    }}
                  />

                  {/* Top-right faction sigil badge */}
                  {faction && (
                    <FactionSigilBadge
                      name={faction.displayName}
                      sigilUrl={faction.factionSigilUrl || faction.sigil}
                      themeColor={factionColor}
                      className="absolute right-3.5 top-3.5 h-9 w-9"
                    />
                  )}

                  {/* Character name + status — floated on bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
                    <h2
                      className="leading-tight text-amber-100"
                      style={{
                        fontFamily: "var(--font-display), serif",
                        fontSize: "clamp(1.25rem, 4vw, 1.55rem)",
                        textShadow: "0 2px 20px rgba(0,0,0,0.80), 0 0 30px rgba(200,158,82,0.15)",
                      }}
                    >
                      {character.name}
                    </h2>
                    <div className="mt-2">
                      <StatusPill
                        status={character.latestState.status}
                        label={character.latestState.statusLabel}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Info body ────────────────────────────────── */}
                <div className="flex flex-col gap-2.5 p-4 pt-3.5 sm:p-5 sm:pt-4">

                  {/* Faction row */}
                  <div
                    className="flex items-center justify-between gap-3 rounded-[16px] px-3.5 py-2.5 backdrop-blur-sm"
                    style={{
                      background: "rgba(14,18,28,0.82)",
                      border: "1px solid rgba(50,60,90,0.55)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-3.5 w-3.5 shrink-0 text-accent/50" strokeWidth={1.7} />
                      <span className="text-[0.82rem] text-ink/80">
                        <span className="text-muted">שיוך: </span>
                        {faction?.displayName ?? "לא זמין בנקודת הזמן הזו"}
                      </span>
                    </div>
                    {faction && (
                      <FactionSigilBadge
                        name={faction.displayName}
                        sigilUrl={faction.factionSigilUrl || faction.sigil}
                        themeColor={factionColor}
                        className="h-7 w-7 shrink-0"
                      />
                    )}
                  </div>

                  {/* Location row */}
                  {locationName && (
                    <div
                      className="flex items-center gap-2.5 rounded-[16px] px-3.5 py-2.5 backdrop-blur-sm"
                      style={{
                        background: "rgba(14,18,28,0.82)",
                        border: "1px solid rgba(50,60,90,0.55)",
                      }}
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.7} />
                      <span className="text-[0.82rem] text-ink/80">
                        <span className="text-muted">מיקום: </span>
                        {locationName}
                      </span>
                    </div>
                  )}

                  {/* First appearance row */}
                  {character.timeline.length > 0 && (
                    <div
                      className="flex items-center gap-2.5 rounded-[16px] px-3.5 py-2.5 backdrop-blur-sm"
                      style={{
                        background: "rgba(14,18,28,0.82)",
                        border: "1px solid rgba(50,60,90,0.55)",
                      }}
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.7} />
                      <span className="text-[0.82rem] text-ink/80">
                        <span className="text-muted">הופעה ראשונה: </span>
                        {character.timeline[0].episodeId.replace('S0','S').replace('E0','E')}
                      </span>
                    </div>
                  )}

                  {/* Base character description */}
                  {character.baseDescription && (
                    <p className="text-[0.81rem] leading-[1.8] text-stone-400/90 px-1">
                      {character.baseDescription}
                    </p>
                  )}

                  {/* Episode-aware current state */}
                  {character.latestState.summary && (
                    <div
                      className="rounded-[14px] px-4 py-3"
                      style={{
                        border: `1px solid ${factionColor}18`,
                        borderTop: `1.5px solid ${factionColor}30`,
                        background: "linear-gradient(165deg, rgba(14,18,30,0.94), rgba(8,11,20,0.98))",
                        boxShadow: `inset 0 1px 0 ${factionColor}06`,
                      }}
                    >
                      <p
                        className="mb-1.5"
                        style={{
                          fontFamily: "var(--font-cinzel), serif",
                          fontSize: "0.55rem",
                          fontWeight: 700,
                          letterSpacing: "0.28em",
                          textTransform: "uppercase",
                          color: `${factionColor}88`,
                        }}
                      >
                        עד פרק {character.latestState.episodeId.replace('S0','S').replace('E0','E')}
                      </p>
                      <p className="text-[0.82rem] leading-[1.75] text-ink/80">
                        {character.latestState.summary}
                      </p>
                    </div>
                  )}

                  {/* Tap hint */}
                  <p
                    className="text-center text-[0.60rem] opacity-40"
                    style={{
                      fontFamily: "var(--font-cinzel), serif",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: factionColor,
                    }}
                  >
                    לחץ לפרטים מלאים
                  </p>

                </div>
              </article>
            );
          })}
          </div>

          {/* Show-more buttons */}
          {visibleCount < sortedCharacters.length && (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 20, sortedCharacters.length))}
                className="rounded-[22px] border border-amber-700/35 bg-amber-500/[0.12] px-6 py-3 text-[0.9rem] font-semibold text-amber-200 transition-all duration-200 hover:border-amber-600/50 hover:bg-amber-500/[0.18] hover:text-amber-100 shadow-[0_0_20px_rgba(203,165,92,0.08)]"
              >
                הצג עוד
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(sortedCharacters.length)}
                className="rounded-[22px] border border-stone-700/35 bg-stone-950/50 px-6 py-3 text-[0.9rem] font-semibold text-stone-400 transition-all duration-200 hover:border-stone-600/45 hover:bg-stone-900/70 hover:text-stone-200"
              >
                הצג הכל
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Character detail drawer ───────────────────────────────────── */}
      <CharacterDetailDrawer
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </section>
  );
}
