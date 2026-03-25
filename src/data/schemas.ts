export type EpisodeId = string;

export type CharacterStatus =
  | "active"
  | "dead"
  | "injured"
  | "incapacitated"
  | "recovering"
  | "captive"
  | "released"
  | "missing"
  | "away"
  | "pregnant"
  | "training"
  | "appointed"
  | "recruit"
  | "sworn"
  | "dismissed"
  | "ruler"
  | "disguised"
  | "transformed";
export type RelationshipState = "alliance" | "war" | "tension" | "neutral";
export type TimelineTone = "neutral" | "alert" | "shift";

export interface EpisodeSummary {
  snapshot: string;
  full: string;
}

export interface EpisodeNarrativePoint {
  id: string;
  summary: string;
  tone: TimelineTone;
}

export interface EpisodeFocusCharacter {
  characterId: string;
  summary: string;
}

export interface EpisodeLocationReveal {
  locationId: string;
  summary: string;
}

export interface EpisodeCharacterUpdate {
  characterId: string;
  status: CharacterStatus;
  statusLabel: string;
  summary: string;
}

export interface EpisodePoliticalShift {
  id: string;
  summary: string;
  factionsInvolved: string[];
}

export interface EpisodeHousePowerUpdate {
  factionId: string;
  power: number;
  summary: string;
}

export interface EpisodeRecord {
  id: EpisodeId;
  season: number;
  episode: number;
  code: string;
  title: string;
  titleEnglish: string;
  summaries: EpisodeSummary;
  focusCharacterIds: string[];
  focusCharacters: EpisodeFocusCharacter[];
  mainLocationIds: string[];
  mainLocationLabels: string[];
  newLocationIds: string[];
  newLocations: EpisodeLocationReveal[];
  newLocationsNote?: string;
  primaryLocationId?: string;
  powerLeaderId?: string;
  recentEventIds: string[];
  turningPoints: EpisodeNarrativePoint[];
  characterUpdates: EpisodeCharacterUpdate[];
  politicalShifts: EpisodePoliticalShift[];
  housePowerUpdates: EpisodeHousePowerUpdate[];
}

export interface CharacterTimelineEntry {
  episodeId: EpisodeId;
  status: CharacterStatus;
  statusLabel: string;
  summary: string;
  affiliationId?: string;
  locationId?: string;
  importance: number;
}

export interface CharacterRecord {
  id: string;
  name: string;
  portrait: string | null;
  characterImageUrl: string | null;
  baseDescription: string;
  timeline: CharacterTimelineEntry[];
}

export interface FactionPowerEntry {
  episodeId: EpisodeId;
  power: number;
  summary: string;
}

export interface FactionRelationshipEntry {
  episodeId: EpisodeId;
  targetFactionId: string;
  state: RelationshipState;
  intensity: number;
  summary: string;
}

export interface FactionRecord {
  id: string;
  displayName: string;
  sigil: string | null;
  factionSigilUrl: string | null;
  themeColor: string;
  powerTimeline: FactionPowerEntry[];
  relationshipTimeline: FactionRelationshipEntry[];
}

export interface LocationHistoryEntry {
  episodeId: EpisodeId;
  summary: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  region: string;
  baseDescription: string;
  revealEpisodeId?: EpisodeId;
  history: LocationHistoryEntry[];
}

export interface MapPositionPercent {
  top: number | null;
  left: number | null;
}

export interface MapRegistryEntry {
  storyLocationId: string;
  imagePositionPercent: MapPositionPercent;
  revealEpisodeId: EpisodeId;
}

export interface TimelineEventRecord {
  id: string;
  episodeId: EpisodeId;
  title: string;
  description: string;
  tone: TimelineTone;
}
