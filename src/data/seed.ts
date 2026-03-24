import charactersData from "@/data/json/characters.json";
import episodesData from "@/data/json/episodes.json";
import factionsData from "@/data/json/factions.json";
import locationsData from "@/data/json/locations.json";
import mapRegistryData from "@/data/json/map-registry.json";
import type {
  CharacterRecord,
  EpisodeRecord,
  FactionRecord,
  LocationRecord,
  MapRegistryEntry,
  TimelineEventRecord,
} from "@/data/schemas";
import { createEpisodeIndex } from "@/lib/episodes";

export const episodes = episodesData as EpisodeRecord[];
export const characters = charactersData as CharacterRecord[];
export const factions = factionsData as FactionRecord[];
export const locations = locationsData as LocationRecord[];
export const mapRegistry = mapRegistryData as MapRegistryEntry[];

export const timelineEvents: TimelineEventRecord[] = episodes.flatMap((episode) =>
  episode.turningPoints.map((turningPoint) => ({
    id: turningPoint.id,
    episodeId: episode.id,
    title: turningPoint.summary,
    description: turningPoint.summary,
    tone: turningPoint.tone,
  })),
);

export const defaultEpisodeId = episodes[0]?.id ?? "S01E01";
export const episodeIndex = createEpisodeIndex(episodes);
