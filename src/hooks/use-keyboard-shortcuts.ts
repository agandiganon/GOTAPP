"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEpisode } from "@/providers/episode-provider";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { currentEpisodeId, setCurrentEpisodeId, availableEpisodes } = useEpisode();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentIdx = availableEpisodes.findIndex(ep => ep.id === currentEpisodeId);

      if (e.key === "ArrowLeft" && !e.metaKey && !e.ctrlKey) {
        // Previous episode (RTL: left = forward in time)
        if (currentIdx < availableEpisodes.length - 1) {
          e.preventDefault();
          setCurrentEpisodeId(availableEpisodes[currentIdx + 1].id);
        }
      } else if (e.key === "ArrowRight" && !e.metaKey && !e.ctrlKey) {
        // Next episode (RTL: right = backward in time)
        if (currentIdx > 0) {
          e.preventDefault();
          setCurrentEpisodeId(availableEpisodes[currentIdx - 1].id);
        }
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === "Escape") {
        // Close any open drawers/modals by blurring
        (document.activeElement as HTMLElement)?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentEpisodeId, availableEpisodes, setCurrentEpisodeId, router]);
}
