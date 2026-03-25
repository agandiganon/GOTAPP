"use client";

import Link from "next/link";
import { ArrowUpLeft, MapPin, Search, Shield, SlidersHorizontal, Sparkles } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { CharacterPortrait } from "@/components/characters/character-portrait";
import { FactionSigilBadge } from "@/components/factions/faction-sigil-badge";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { characters, episodeIndex, factions, locations, mapRegistry } from "@/data/seed";
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

interface CharacterInfoRowProps {
  icon: typeof Shield;
  label: string;
  value: string;
  toneClassName: string;
  href?: string;
  trailing?: ReactNode;
}

function CharacterInfoRow({
  icon: Icon,
  label,
  value,
  toneClassName,
  href,
  trailing,
}: CharacterInfoRowProps) {
  const content = (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border bg-white/[0.03] ${toneClassName}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted/65">{label}</p>
          <p className="text-sm leading-7 text-ink">{value}</p>
        </div>
      </div>
      {trailing ? <div className="shrink-0 pt-0.5">{trailing}</div> : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-[18px] border border-white/[0.05] bg-white/[0.02] px-3 py-3 transition hover:border-accent/20 hover:bg-accent/[0.06]"
    >
      {content}
      <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-canvas/70 text-muted transition group-hover:text-accent">
        <ArrowUpLeft className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function CharactersScreen() {
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("importance");

  const visibleCharacters = getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex);
  const mappedLocationIds = useMemo(
    () =>
      new Set(
        mapRegistry
          .filter(
            (pin) =>
              pin.imagePositionPercent.top != null && pin.imagePositionPercent.left != null,
          )
          .map((pin) => pin.storyLocationId),
      ),
    [],
  );

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
        <div className="absolute inset-0 bg-hero-glow opacity-55" />
        <div className="relative space-y-5">
          <div className="space-y-2">
            <p className="text-caption">דמויות</p>
            <h1 className="font-display text-3xl text-ink">מי גלוי לצופה עד {currentEpisode.code}</h1>
            <p className="max-w-[36ch] text-sm leading-7 text-muted">
              כל כרטיס מציג רק מצב, שיוך ומיקום שכבר נחשפו לצופה. אין קפיצה קדימה מעבר לפרק
              שבחרת.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="text-xs text-muted">דמויות גלויות</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{visibleCharacters.length}</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="text-xs text-muted">מסוננות כעת</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{sortedCharacters.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-[20px] border border-white/[0.06] bg-canvas/35 px-4 py-3">
              <p className="text-[0.72rem] text-muted">פעילות</p>
              <p className="mt-1 text-lg font-semibold text-ink">{statusSummary.active}</p>
            </div>
            <div className="rounded-[20px] border border-danger/20 bg-danger/[0.12] px-4 py-3">
              <p className="text-[0.72rem] text-[#f3c3ca]">מתות / מתים</p>
              <p className="mt-1 text-lg font-semibold text-ink">{statusSummary.dead}</p>
            </div>
            <div className="rounded-[20px] border border-[#c18b4d]/20 bg-[#c18b4d]/10 px-4 py-3">
              <p className="text-[0.72rem] text-[#f0cfaa]">שבויים</p>
              <p className="mt-1 text-lg font-semibold text-ink">{statusSummary.captive}</p>
            </div>
            <div className="rounded-[20px] border border-[#7e97b3]/20 bg-[#7e97b3]/10 px-4 py-3">
              <p className="text-[0.72rem] text-[#d8e3ef]">נעדרים</p>
              <p className="mt-1 text-lg font-semibold text-ink">{statusSummary.missing}</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-[22px] border border-white/[0.06] bg-canvas/40 px-4 py-3 backdrop-blur-md">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="חיפוש לפי שם, בית, מיקום או סטטוס"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs text-muted">
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
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "border-accent/20 bg-accent/[0.12] text-accent"
                      : "border-white/[0.06] bg-white/[0.04] text-muted hover:text-ink"
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
            נסה/י לחפש בשם, בבית, במיקום או בסטטוס כפי שהם גלויים עד הפרק הנבחר.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedCharacters.map((character) => {
            const faction = factions.find((item) => item.id === character.latestState.affiliationId);
            const location = locations.find((item) => item.id === character.latestState.locationId);
            const locationHref =
              location && mappedLocationIds.has(location.id) ? `/map?location=${location.id}` : undefined;

            return (
              <Panel
                key={character.id}
                className="group overflow-hidden border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-0 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.1] hover:shadow-[0_26px_72px_rgba(0,0,0,0.34)]"
              >
                <div className="relative aspect-[11/12.8] overflow-hidden">
                  <CharacterPortrait
                    name={character.name}
                    imageUrl={character.characterImageUrl ?? character.portrait}
                    factionColor={faction?.themeColor}
                    className="transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,14,0.08),rgba(7,9,17,0.12)_32%,rgba(7,9,17,0.85)_72%,rgba(7,9,17,0.97))]" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <StatusPill
                      status={character.latestState.status}
                      label={character.latestState.statusLabel}
                    />
                    <div className="rounded-full border border-white/[0.08] bg-canvas/[0.66] px-3 py-1 text-[0.68rem] font-medium text-muted backdrop-blur-md">
                      עוצמה {character.latestState.importance}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="min-w-0 space-y-2">
                      <p className="text-[0.72rem] text-muted">גלוי עד {currentEpisode.code}</p>
                      <h2 className="font-display text-[1.95rem] leading-none text-ink">
                        {character.name}
                      </h2>
                      <p className="max-w-[24ch] text-sm leading-6 text-[#ddd3c5]">
                        {character.baseDescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid gap-3">
                    <CharacterInfoRow
                      icon={Sparkles}
                      label="סטטוס נוכחי"
                      value={character.latestState.statusLabel}
                      toneClassName="border-accent/18 text-accent"
                    />
                    <CharacterInfoRow
                      icon={Shield}
                      label="שיוך"
                      value={faction?.displayName ?? "שיוך לא זמין"}
                      toneClassName="border-[#7e97b3]/20 text-[#cfe1f1]"
                      trailing={
                        faction ? (
                          <FactionSigilBadge
                            name={faction.displayName}
                            sigilUrl={faction.factionSigilUrl ?? faction.sigil}
                            themeColor={faction.themeColor}
                            className="h-10 w-10"
                          />
                        ) : null
                      }
                    />
                    <CharacterInfoRow
                      icon={MapPin}
                      label="מיקום נוכחי"
                      value={location?.name ?? "מיקום לא זמין"}
                      toneClassName="border-[#b38957]/20 text-[#eed1a9]"
                      href={locationHref}
                    />
                  </div>

                  <div className="rounded-[20px] border border-white/[0.05] bg-white/[0.03] px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted/65">
                      מצב אחרון גלוי
                    </p>
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
