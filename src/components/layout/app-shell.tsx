import type { PropsWithChildren } from "react";

import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { DesktopSidebar }   from "@/components/layout/desktop-sidebar";
import { ShellHeader }      from "@/components/layout/shell-header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    /* ── Outer wrapper — desktop becomes a CSS grid via .desktop-shell ─── */
    <div className="desktop-shell relative min-h-screen overflow-x-clip">

      {/* ── Atmospheric ambient layer (position:fixed — out of grid flow) ─ */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Throne room candle crown */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "-18rem", width: "36rem", height: "36rem",
            borderRadius: "50%",
            background: "rgba(210,168,90,0.09)",
            filter: "blur(100px)",
          }}
        />
        {/* Left forge fire */}
        <div
          className="absolute"
          style={{
            top: "12%", left: "-6rem", width: "22rem", height: "22rem",
            borderRadius: "50%",
            background: "rgba(140,40,18,0.15)",
            filter: "blur(80px)",
          }}
        />
        {/* Right ember pocket */}
        <div
          className="absolute"
          style={{
            top: "6%", right: "-4rem", width: "20rem", height: "20rem",
            borderRadius: "50%",
            background: "rgba(100,55,15,0.13)",
            filter: "blur(72px)",
          }}
        />
        {/* Night Wall — cold blue */}
        <div
          className="absolute"
          style={{
            bottom: "10%", left: "-3rem", width: "18rem", height: "18rem",
            borderRadius: "50%",
            background: "rgba(38,55,78,0.14)",
            filter: "blur(70px)",
          }}
        />
        {/* Deep abyss gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-64"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
        />
      </div>

      {/* ── Desktop sidebar — hidden on mobile, visible ≥768px ──────────── */}
      <DesktopSidebar />

      {/* ══════════════════════════════════════════════════════════════════
          Main column — single children render, wrapper adapts via CSS
          Mobile:  phone-frame + ShellHeader + BottomNavigation
          Desktop: transparent container + no header/bottom nav
          ══════════════════════════════════════════════════════════════ */}
      <div className="app-main-column relative">

        {/* Outer positioning layer: on mobile centers & constrains to 450px */}
        <div className="app-mobile-positioner">

          {/* Shell frame: on mobile is a glassy card; on desktop is transparent */}
          <div className="app-shell-inner shell-frame flex flex-col px-4 pb-6 pt-4">

            {/* Header — shown on mobile only (sidebar has logo/nav on desktop) */}
            <div className="desktop-hide-on-desktop">
              <ShellHeader />
            </div>

            {/* ─── PAGE CONTENT — rendered exactly once ─────────────────── */}
            <main className="flex-1">{children}</main>

          </div>
        </div>

        {/* Bottom navigation — shown on mobile only */}
        <div className="desktop-hide-on-desktop">
          <BottomNavigation />
        </div>

      </div>

    </div>
  );
}
