import type { PropsWithChildren } from "react";

import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ShellHeader }     from "@/components/layout/shell-header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-x-clip">

      {/* ── Atmospheric ambient layer (pointer-events off) ─────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Crown gold — top centre */}
        <div className="absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/[0.09] blur-[80px]" />
        {/* Blood ember — bottom-left */}
        <div className="absolute bottom-16 left-[-3rem] h-64 w-64 rounded-full bg-danger/[0.13] blur-[70px]" />
        {/* Slate smoke — right edge */}
        <div className="absolute right-[-5rem] top-1/3 h-80 w-80 rounded-full bg-stone-700/[0.08] blur-[80px]" />
        {/* Deep teal hint — bottom right */}
        <div className="absolute bottom-48 right-[-2rem] h-48 w-48 rounded-full bg-[rgba(38,52,72,0.14)] blur-[60px]" />
      </div>

      {/* ── Main content frame ─────────────────────────────────────────── */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-4 pb-28 pt-4">
        <div className="shell-frame flex min-h-[calc(100vh-2rem)] flex-col px-4 pb-6 pt-4">
          <ShellHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
