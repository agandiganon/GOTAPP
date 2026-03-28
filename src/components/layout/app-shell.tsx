"use client";

import type { PropsWithChildren } from "react";
import { useState, useRef, useEffect } from "react";

import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { DesktopSidebar }   from "@/components/layout/desktop-sidebar";
import { ShellHeader }      from "@/components/layout/shell-header";
import { EpisodeToast }     from "@/components/ui/episode-toast";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const PULL_THRESHOLD = 60;

export function AppShell({ children }: PropsWithChildren) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartRef = useRef(0);
  const scrollTopRef = useRef(0);
  const touchStartRef = useRef(0);

  useScrollTop();
  useServiceWorker();
  useSwipeNavigation();
  useKeyboardShortcuts();

  /* Pull-to-refresh gesture handler */
  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    };

    if (!isMobile()) return;

    const mainColumn = document.querySelector(".app-main-column");
    if (!mainColumn) return;

    const handleTouchStart = (evt: Event) => {
      const e = evt as TouchEvent;
      scrollTopRef.current = mainColumn.scrollTop || 0;
      touchStartRef.current = e.touches[0].clientY;
      pullStartRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (evt: Event) => {
      const e = evt as TouchEvent;
      if (isRefreshing) return;

      /* Only pull when scrolled to top */
      if ((mainColumn.scrollTop || 0) > 0) {
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - pullStartRef.current);

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);

        /* Trigger page reload after a brief delay */
        await new Promise(resolve => setTimeout(resolve, 400));
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    mainColumn.addEventListener("touchstart", handleTouchStart as EventListener);
    mainColumn.addEventListener("touchmove", handleTouchMove as EventListener, { passive: false });
    mainColumn.addEventListener("touchend", handleTouchEnd as EventListener);

    return () => {
      mainColumn.removeEventListener("touchstart", handleTouchStart as EventListener);
      mainColumn.removeEventListener("touchmove", handleTouchMove as EventListener);
      mainColumn.removeEventListener("touchend", handleTouchEnd as EventListener);
    };
  }, [isRefreshing, pullDistance]);
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

      {/* ── Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="pointer-events-none fixed left-1/2 top-0 z-[150] -translate-x-1/2 transition-opacity"
          style={{
            opacity: Math.min(1, pullDistance / PULL_THRESHOLD),
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              background: "rgba(210,168,90,0.15)",
              border: "1px solid rgba(210,168,90,0.25)",
              transform: `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)`,
              transition: "transform 60ms linear",
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "rgba(210,168,90,0.60)" }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          Main column — single children render, wrapper adapts via CSS
          Mobile:  phone-frame + ShellHeader + BottomNavigation
          Desktop: transparent container + no header/bottom nav
          ══════════════════════════════════════════════════════════════ */}
      <div className="app-main-column relative">

        {/* Outer positioning layer: on mobile centers & constrains to 450px */}
        <div
          className="app-mobile-positioner"
          style={{
            transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, PULL_THRESHOLD * 1.2)}px)` : "translateY(0)",
            transition: pullDistance > 0 ? "none" : "transform 300ms cubic-bezier(0.34,1.12,0.64,1)",
          }}
        >

          {/* Shell frame: on mobile is a glassy card; on desktop is transparent */}
          <div className="app-shell-inner shell-frame flex flex-col px-4 pb-6 pt-4">

            {/* Header — shown on mobile only (sidebar has logo/nav on desktop) */}
            <div className="desktop-hide-on-desktop">
              <ShellHeader />
            </div>

            {/* ─── PAGE CONTENT — rendered exactly once ─────────────────── */}
            <main className="flex-1">{children}</main>

            {/* Episode toast notification */}
            <EpisodeToast />

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
