import type {
  CharacterRecord,
  CharacterTimelineEntry,
  EpisodeRecord,
  EpisodeId,
  FactionPowerEntry,
  FactionRecord,
  FactionRelationshipEntry,
  LocationHistoryEntry,
  LocationRecord,
  MapRegistryEntry,
  TimelineEventRecord,
} from "@/data/schemas";
import type { EpisodeIndexMap } from "@/lib/episodes";
import { isEpisodeVisible } from "@/lib/episodes";
import { isDefined } from "@/lib/utils";

type TimelineEntry =
  | CharacterTimelineEntry
  | FactionPowerEntry
  | FactionRelationshipEntry
  | LocationHistoryEntry
  | TimelineEventRecord;

export function getVisibleTimelineEntries<T extends TimelineEntry>(
  entries: T[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return entries
    .map((entry, originalIndex) => ({ entry, originalIndex }))
    .filter(({ entry }) => isEpisodeVisible(entry.episodeId, currentEpisodeId, episodeIndex))
    .sort((entryA, entryB) => {
      const episodeDelta =
        (episodeIndex[entryA.entry.episodeId] ?? -1) - (episodeIndex[entryB.entry.episodeId] ?? -1);

      if (episodeDelta !== 0) {
        return episodeDelta;
      }

      return entryA.originalIndex - entryB.originalIndex;
    })
    .map(({ entry }) => entry);
}

export function getLatestVisibleEntry<T extends TimelineEntry>(
  entries: T[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return getVisibleTimelineEntries(entries, currentEpisodeId, episodeIndex).at(-1) ?? null;
}

export function getVisibleCharacterSnapshots(
  characters: CharacterRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return characters
    .map((character) => {
      const latestState = getLatestVisibleEntry(character.timeline, currentEpisodeId, episodeIndex);

      if (!latestState) {
        return null;
      }

      return {
        ...character,
        latestState,
      };
    })
    .filter((character): character is CharacterRecord & { latestState: CharacterTimelineEntry } => Boolean(character));
}

export function getDeadCharacterCount(
  characters: CharacterRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return getVisibleCharacterSnapshots(characters, currentEpisodeId, episodeIndex).filter(
    (character) => character.latestState.status === "dead",
  ).length;
}

export function getVisibleLocationSnapshots(
  locations: LocationRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return locations
    .map((location) => {
      const latestHistory = getLatestVisibleEntry(location.history, currentEpisodeId, episodeIndex);

      return {
        ...location,
        latestHistory,
        visibleHistory: getVisibleTimelineEntries(location.history, currentEpisodeId, episodeIndex),
      };
    })
    .filter(
      (
        location,
      ): location is LocationRecord & {
        latestHistory: LocationHistoryEntry;
        visibleHistory: LocationHistoryEntry[];
      } => isDefined(location.latestHistory),
    );
}

export function getVisibleFactionRankings(
  factions: FactionRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return factions
    .map((faction) => {
      const latestPower = getLatestVisibleEntry(faction.powerTimeline, currentEpisodeId, episodeIndex);

      if (!latestPower) {
        return null;
      }

      return {
        faction,
        latestPower,
      };
    })
    .filter((entry): entry is { faction: FactionRecord; latestPower: FactionPowerEntry } => Boolean(entry))
    .sort((entryA, entryB) => entryB.latestPower.power - entryA.latestPower.power);
}

export function getEpisodeFactionRankings(
  factions: FactionRecord[],
  episode: EpisodeRecord,
) {
  return episode.housePowerUpdates
    .map((entry) => {
      const faction = factions.find((candidate) => candidate.id === entry.factionId);

      if (!faction) {
        return null;
      }

      return {
        faction,
        latestPower: {
          episodeId: episode.id,
          power: entry.power,
          summary: entry.summary,
        },
      };
    })
    .filter((entry): entry is { faction: FactionRecord; latestPower: FactionPowerEntry } => Boolean(entry))
    .sort((entryA, entryB) => entryB.latestPower.power - entryA.latestPower.power);
}

export function getVisibleFactionRelationships(
  factions: FactionRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return factions.flatMap((faction) =>
    faction.relationshipTimeline
      .map((relationship) => {
        const latestRelationship = getLatestVisibleEntry(
          faction.relationshipTimeline.filter(
            (candidate) => candidate.targetFactionId === relationship.targetFactionId,
          ),
          currentEpisodeId,
          episodeIndex,
        );

        if (!latestRelationship || latestRelationship !== relationship) {
          return null;
        }

        return {
          sourceFactionId: faction.id,
          ...latestRelationship,
        };
      })
      .filter(
        (
          relationship,
        ): relationship is FactionRelationshipEntry & {
          sourceFactionId: string;
        } => Boolean(relationship),
      ),
  );
}

export function getVisibleRelationshipWeb(
  factions: FactionRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  const relationshipMap = new Map<
    string,
    FactionRelationshipEntry & {
      sourceFactionId: string;
    }
  >();

  for (const relationship of getVisibleFactionRelationships(
    factions,
    currentEpisodeId,
    episodeIndex,
  )) {
    const pairKey = [relationship.sourceFactionId, relationship.targetFactionId].sort().join("::");
    const existingRelationship = relationshipMap.get(pairKey);
    const relationshipOrder = episodeIndex[relationship.episodeId] ?? -1;
    const existingOrder = existingRelationship
      ? (episodeIndex[existingRelationship.episodeId] ?? -1)
      : -1;

    if (
      !existingRelationship ||
      relationshipOrder > existingOrder ||
      (relationshipOrder === existingOrder &&
        relationship.intensity > existingRelationship.intensity)
    ) {
      relationshipMap.set(pairKey, relationship);
    }
  }

  return [...relationshipMap.values()].sort((entryA, entryB) => {
    const episodeDelta =
      (episodeIndex[entryB.episodeId] ?? -1) - (episodeIndex[entryA.episodeId] ?? -1);

    if (episodeDelta !== 0) {
      return episodeDelta;
    }

    return entryB.intensity - entryA.intensity;
  });
}

export function getVisibleMapPins(
  mapRegistry: MapRegistryEntry[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return mapRegistry.filter((pin) =>
    isEpisodeVisible(pin.revealEpisodeId, currentEpisodeId, episodeIndex),
  );
}

export function getVisibleEvents(
  events: TimelineEventRecord[],
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return getVisibleTimelineEntries(events, currentEpisodeId, episodeIndex);
}
