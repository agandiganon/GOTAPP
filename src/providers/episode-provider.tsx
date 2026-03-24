"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { defaultEpisodeId, episodes } from "@/data/seed";
import type { EpisodeId, EpisodeRecord } from "@/data/schemas";

interface EpisodeContextValue {
  currentEpisodeId: EpisodeId;
  setCurrentEpisodeId: (episodeId: EpisodeId) => void;
  availableEpisodes: EpisodeRecord[];
  currentEpisode: EpisodeRecord;
}

const STORAGE_KEY = "gotspoil.currentEpisodeId";

const EpisodeContext = createContext<EpisodeContextValue | null>(null);

export function EpisodeProvider({ children }: PropsWithChildren) {
  const [currentEpisodeId, setCurrentEpisodeIdState] = useState<EpisodeId>(defaultEpisodeId);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    const storedEpisodeId = window.localStorage.getItem(STORAGE_KEY);

    if (storedEpisodeId && episodes.some((episode) => episode.id === storedEpisodeId)) {
      setCurrentEpisodeIdState(storedEpisodeId);
    }

    setHasHydratedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, currentEpisodeId);
  }, [currentEpisodeId, hasHydratedStorage]);

  const setCurrentEpisodeId = (episodeId: EpisodeId) => {
    if (!episodes.some((episode) => episode.id === episodeId)) {
      return;
    }

    setCurrentEpisodeIdState(episodeId);
  };

  const currentEpisode =
    episodes.find((episode) => episode.id === currentEpisodeId) ?? episodes[0];

  return (
    <EpisodeContext.Provider
      value={{
        currentEpisodeId,
        setCurrentEpisodeId,
        availableEpisodes: episodes,
        currentEpisode,
      }}
    >
      {children}
    </EpisodeContext.Provider>
  );
}

export function useEpisode() {
  const context = useContext(EpisodeContext);

  if (!context) {
    throw new Error("useEpisode must be used within an EpisodeProvider.");
  }

  return context;
}
