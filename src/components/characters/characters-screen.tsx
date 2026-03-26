"use client";

import { Activity, Search, Shield, SlidersHorizontal, User } from "lucide-react";
import { useMemo, useState } from "react";

import { CharacterPortrait } from "@/components/characters/character-portrait";
import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations } from "@/data/seed";
import type { CharacterStatus } from "@/data/schemas";
import { getVisibleCharacterSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

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
  const [query, setQuery]       = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("importance");

  /* ── Anti-spoiler logic — DO NOT TOUCH ────────────────────────────────── */
  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);

  const filteredCharacters = visibleCharacters.filter((character) => {
    const factionName =
      factions.find((faction) => faction.id === character.latestState.affiliationId)?.displayName ?? "";
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
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.trim().toLowerCase());
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
    <section className="space-y-5 pb-24 md:pb-6" dir="rtl">

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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לפי שם, בית, מיקום או סטטוס"
              className="w-full bg-transparent text-[0.9rem] text-stone-100 outline-none placeholder:text-stone-500"
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {sortedCharacters.map((character) => {
            const faction = factions.find((item) => item.id === character.latestState.affiliationId);
            const factionColor = faction?.themeColor ?? "#a07840";

            return (
              <article
                key={character.id}
                dir="rtl"
                className="character-card-frame group overflow-hidden rounded-[26px] border border-stone-800/65 hover:border-amber-900/45"
                style={{
                  background: "linear-gradient(170deg, rgba(26,21,16,0.99), rgba(10,8,6,1))",
                  boxShadow: "0 28px 72px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,245,215,0.04)",
                }}
              >

                {/* ── Portrait zone ────────────────────────────── */}
                <div className="relative h-64 w-full sm:h-72 overflow-hidden">
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
                          rgba(10,8,6,1)   0%,
                          rgba(10,8,6,0.85) 20%,
                          rgba(10,8,6,0.18) 46%,
                          transparent       72%
                        ),
                        linear-gradient(to right,
                          rgba(10,8,6,0.22) 0%,
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

                  {/* Top-left episode badge */}
                  <div className="absolute left-3.5 top-3.5 rounded-full border border-stone-600/35 bg-stone-950/72 px-2.5 py-1 text-[0.62rem] font-medium text-stone-400 backdrop-blur-md">
                    עד {currentEpisode.code}
                  </div>

                  {/* Character name + status — floated on bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
                    <h2
                      className="font-display leading-tight text-amber-100"
                      style={{
                        fontSize: "clamp(1.3rem, 4vw, 1.6rem)",
                        textShadow: "0 2px 16px rgba(0,0,0,0.75)",
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
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-stone-800/65 px-3.5 py-2.5 backdrop-blur-sm"
                    style={{ background: "rgba(22,17,13,0.80)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-3.5 w-3.5 shrink-0 text-amber-400/60" strokeWidth={1.7} />
                      <span className="text-[0.82rem] text-stone-300">
                        <span className="text-stone-500">שיוך: </span>
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

                  {/* Summary block */}
                  <div
                    className="rounded-[16px] border border-stone-800/60 px-4 py-3.5"
                    style={{ background: "rgba(18,14,10,0.75)" }}
                  >
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-amber-300/45 mb-2">
                      תיאור נוכחי
                    </p>
                    <p className="text-[0.82rem] leading-[1.8] text-stone-300">
                      {character.latestState.summary}
                    </p>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
