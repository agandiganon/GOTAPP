"use client";

import { useState } from "react";
import { Crown, MapPin, Search, Shield, SlidersHorizontal } from "lucide-react";

import { CharacterPortrait } from "@/components/characters/character-portrait";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations } from "@/data/seed";
import type { CharacterStatus } from "@/data/schemas";
import { getVisibleCharacterSnapshots } from "@/lib/timeline";
import { useEpisode } from "@/providers/episode-provider";

type SortMode = "importance" | "status" | "name";

const sortLabels: Record<SortMode, string> = {
  importance: "לפי חשיבות",
  status: "לפי סטטוס",
  name: "א-ת",
};

const statusSortOrder: Record<CharacterStatus, number> = {
  dead: 0,
  captive: 1,
  incapacitated: 2,
  injured: 3,
  missing: 4,
  disguised: 5,
  recovering: 6,
  away: 7,
  dismissed: 8,
  recruit: 9,
  training: 10,
  pregnant: 11,
  sworn: 12,
  appointed: 13,
  ruler: 14,
  transformed: 15,
  released: 16,
  active: 17,
};

export function CharactersScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("importance");

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
        statusSortOrder[characterA.latestState.status] - statusSortOrder[characterB.latestState.status];

      if (statusDelta !== 0) {
        return statusDelta;
      }

      return characterB.latestState.importance - characterA.latestState.importance;
    }

    return characterB.latestState.importance - characterA.latestState.importance;
  });

  const statusSummary = {
    dead: visibleCharacters.filter((character) => character.latestState.status === "dead").length,
    captive: visibleCharacters.filter((character) => character.latestState.status === "captive").length,
    missing: visibleCharacters.filter((character) => character.latestState.status === "missing").length,
    active: visibleCharacters.filter((character) =>
      ["active", "appointed", "ruler", "sworn", "transformed", "released"].includes(
        character.latestState.status,
      ),
    ).length,
  };

  return (
    <section className="space-y-4">
      <Panel className="relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-hero-glow opacity-60" />
        <div className="relative space-y-5">
          <div className="space-y-2">
            <p className="text-caption">דמויות</p>
            <h1 className="font-display text-3xl text-ink">מי גלוי לצופה עד {currentEpisode.code}</h1>
            <p className="text-sm leading-7 text-muted">
              כל כרטיס משקף את המצב האחרון הידוע בלבד. אם שינוי עוד לא קרה בפרק שבחרת, הוא לא
              יופיע כאן.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-line/10 bg-white/5 p-4">
              <p className="text-xs text-muted">דמויות גלויות</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{visibleCharacters.length}</p>
            </div>
            <div className="rounded-[22px] border border-line/10 bg-white/5 p-4">
              <p className="text-xs text-muted">מסוננות כעת</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{sortedCharacters.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-danger/20 bg-danger/10 p-4">
              <p className="text-xs text-[#f3c3ca]">מתים</p>
              <p className="mt-2 text-xl font-semibold text-ink">{statusSummary.dead}</p>
            </div>
            <div className="rounded-[22px] border border-[#c18b4d]/20 bg-[#c18b4d]/10 p-4">
              <p className="text-xs text-[#f3cfaa]">שבויים / נעדרים</p>
              <p className="mt-2 text-xl font-semibold text-ink">
                {statusSummary.captive + statusSummary.missing}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-[20px] border border-line/10 bg-canvas/50 px-4 py-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לפי שם, בית, מיקום או סטטוס"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 rounded-full border border-line/10 bg-white/5 px-3 py-2 text-xs text-muted">
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
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "border-accent/25 bg-accent/[0.12] text-accent"
                      : "border-line/10 bg-white/[0.05] text-muted hover:text-ink"
                  }`}
                >
                  {sortLabels[mode]}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      {sortedCharacters.length === 0 ? (
        <Panel className="p-5">
          <p className="text-lg font-semibold text-ink">לא נמצאו דמויות לחיפוש הזה</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            נסה/י לחפש בשם עברי, בבית, בסטטוס או במיקום שגלוי עד הפרק הנבחר.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sortedCharacters.map((character) => {
            const faction = factions.find((item) => item.id === character.latestState.affiliationId);
            const location = locations.find((item) => item.id === character.latestState.locationId);

            return (
              <Panel
                key={character.id}
                className="group overflow-hidden border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-0 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
              >
                <div className="relative aspect-[5/5.85] overflow-hidden">
                  <CharacterPortrait
                    name={character.name}
                    portrait={character.portrait}
                    factionColor={faction?.themeColor}
                    className="transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,16,0.06),rgba(8,9,16,0.18)_34%,rgba(8,9,16,0.92)_82%,rgba(8,9,16,0.98))]" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <div className="rounded-full border border-line/10 bg-canvas/[0.56] px-3 py-1 text-[0.68rem] font-medium text-muted backdrop-blur-md">
                      חשיבות {character.latestState.importance}
                    </div>
                    <StatusPill
                      status={character.latestState.status}
                      label={character.latestState.statusLabel}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted">גלוי עד {currentEpisode.code}</p>
                      <h2 className="text-2xl font-semibold text-ink">{character.name}</h2>
                      <p className="text-sm text-[#ddd3c5]">
                        {faction?.displayName ?? "שיוך לא זמין בנקודת הזמן הזו"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <p className="text-sm leading-7 text-muted">{character.baseDescription}</p>

                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 rounded-[20px] bg-white/[0.035] px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#7e97b3]/20 bg-[#7e97b3]/[0.12] text-[#cbd9e6]">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted">בית / שיוך</p>
                        <p className="text-sm text-ink">
                          {faction?.displayName ?? "שיוך לא זמין בנקודת הזמן הזו"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-[20px] bg-white/[0.035] px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#8e795f]/20 bg-[#8e795f]/[0.12] text-[#e0cdb1]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted">מיקום נראה אחרון</p>
                        <p className="text-sm text-ink">
                          {location?.name ?? "מיקום לא זמין בנקודת הזמן הזו"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-[20px] bg-white/[0.035] px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#caa25f]/20 bg-[#caa25f]/[0.12] text-[#f1ddb2]">
                        <Crown className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted">עוצמה עלילתית כרגע</p>
                        <p className="text-sm text-ink">{character.latestState.importance} / 100</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-white/[0.04] p-4 ring-1 ring-white/[0.08]">
                    <p className="text-xs text-muted">העדכון האחרון הידוע</p>
                    <p className="mt-2 text-sm leading-7 text-ink">{character.latestState.summary}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </section>
  );
}
