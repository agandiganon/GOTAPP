"use client";
import { useEffect, useState } from "react";
import { useEpisode } from "@/providers/episode-provider";

export function EpisodeToast() {
  const { currentEpisode } = useEpisode();
  const [visible, setVisible] = useState(false);
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    if (isFirst) { setIsFirst(false); return; }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [currentEpisode.id]);

  if (!visible) return null;

  return (
    <div className="fixed top-6 left-1/2 z-[70] -translate-x-1/2 animate-[slideDown_0.3s_ease-out]">
      <div className="rounded-full border border-amber-700/35 bg-[rgba(14,18,28,0.95)] px-5 py-2.5 text-sm font-medium text-amber-200 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        עברת לפרק {currentEpisode.code} · {currentEpisode.title}
      </div>
    </div>
  );
}
