"use client";

import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        animation: "pageTransitionFadeIn 0.35s ease-out",
      }}
    >
      {children}
    </div>
  );
}
