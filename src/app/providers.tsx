"use client";

import type { PropsWithChildren } from "react";

import { EpisodeProvider } from "@/providers/episode-provider";

export function Providers({ children }: PropsWithChildren) {
  return <EpisodeProvider>{children}</EpisodeProvider>;
}
