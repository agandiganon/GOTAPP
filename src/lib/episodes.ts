import type { EpisodeId, EpisodeRecord } from "@/data/schemas";

export type EpisodeIndexMap = Record<EpisodeId, number>;
const HOME_SUMMARY_SENTENCE_LIMIT = 2;
const HOME_SUMMARY_CHARACTER_LIMIT = 340;

export function createEpisodeIndex(episodes: EpisodeRecord[]): EpisodeIndexMap {
  return episodes.reduce<EpisodeIndexMap>((index, episode, order) => {
    index[episode.id] = order;
    return index;
  }, {});
}

export function compareEpisodeOrder(
  episodeA: EpisodeId,
  episodeB: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return (episodeIndex[episodeA] ?? -1) - (episodeIndex[episodeB] ?? -1);
}

export function isEpisodeVisible(
  targetEpisodeId: EpisodeId,
  currentEpisodeId: EpisodeId,
  episodeIndex: EpisodeIndexMap,
) {
  return compareEpisodeOrder(targetEpisodeId, currentEpisodeId, episodeIndex) <= 0;
}

export function formatEpisodeLabel(episode: EpisodeRecord) {
  return `${episode.code} · ${episode.title}`;
}

export function getEpisodeHomeSummary(episode: EpisodeRecord) {
  const fullSummary = episode.summaries.full.trim();

  if (!fullSummary) {
    return episode.summaries.snapshot.trim();
  }

  const normalizedSummary = fullSummary.replace(/\s+/g, " ").trim();
  const sentences =
    normalizedSummary.match(/[^.!?…]+[.!?…]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];

  if (sentences.length === 0) {
    return truncateSummary(normalizedSummary, HOME_SUMMARY_CHARACTER_LIMIT);
  }

  const selectedSentences: string[] = [];

  for (const sentence of sentences) {
    if (selectedSentences.length >= HOME_SUMMARY_SENTENCE_LIMIT) {
      break;
    }

    const candidate = [...selectedSentences, sentence].join(" ").trim();

    if (candidate.length > HOME_SUMMARY_CHARACTER_LIMIT) {
      break;
    }

    selectedSentences.push(sentence);
  }

  if (selectedSentences.length > 0) {
    const joinedSummary = selectedSentences.join(" ").trim();

    if (joinedSummary.length <= HOME_SUMMARY_CHARACTER_LIMIT) {
      return joinedSummary;
    }
  }

  return truncateSummary(sentences[0] ?? normalizedSummary, HOME_SUMMARY_CHARACTER_LIMIT);
}

function truncateSummary(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  const trimmedText = text.slice(0, maxLength).trimEnd();
  const safeBoundary = Math.max(trimmedText.lastIndexOf(" "), trimmedText.lastIndexOf("—"));

  if (safeBoundary > maxLength * 0.6) {
    return `${trimmedText.slice(0, safeBoundary).trimEnd()}…`;
  }

  return `${trimmedText}…`;
}
