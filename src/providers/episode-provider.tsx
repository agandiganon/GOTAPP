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
  generateShareUrl: () => string;
}

const STORAGE_KEY = "gotspoil.currentEpisodeId";

const EpisodeContext = createContext<EpisodeContextValue | null>(null);

export function EpisodeProvider({ children }: PropsWithChildren) {
  const [currentEpisodeId, setCurrentEpisodeIdState] = useState<EpisodeId>(defaultEpisodeId);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  useEffect(() => {
    // First, check URL query parameter
    const params = new URLSearchParams(window.location.search);
    const queryEpisodeId = params.get("ep");
    if (queryEpisodeId && episodes.some((episode) => episode.id === queryEpisodeId)) {
      setCurrentEpisodeIdState(queryEpisodeId);
      setHasHydratedStorage(true);
      return;
    }

    // Then check localStorage
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

  const generateShareUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL("/", baseUrl);
    url.searchParams.set("ep", currentEpisodeId);
    return url.toString();
  };

  return (
    <EpisodeContext.Provider
      value={{
        currentEpisodeId,
        setCurrentEpisodeId,
        availableEpisodes: episodes,
        currentEpisode,
        generateShareUrl,
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
