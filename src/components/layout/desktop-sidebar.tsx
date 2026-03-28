"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Castle, Home, Map, UsersRound, Info, Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEpisode } from "@/providers/episode-provider";
import { characters, episodeIndex } from "@/data/seed";
import { getDeadCharacterCount } from "@/lib/timeline";

const navigationItems = [
  { href: "/",           label: "בית",      icon: Home,       labelEn: "Home"      },
  { href: "/characters", label: "דמויות",   icon: UsersRound, labelEn: "Characters"},
  { href: "/map",        label: "מפה",      icon: Map,        labelEn: "Map"       },
  { href: "/politics",   label: "פוליטיקה", icon: Castle,     labelEn: "Politics"  },
  { href: "/summary",    label: "תקציר",    icon: BookText,   labelEn: "Summary"   },
  { href: "/quiz",       label: "חידון",    icon: Brain,      labelEn: "Quiz"      },
] as const;

export function DesktopSidebar() {
  const pathname = usePathname();
  const { currentEpisode, currentEpisodeId } = useEpisode();
  const deadCount = getDeadCharacterCount(characters, currentEpisodeId, episodeIndex);

  return (
    <aside className="desktop-sidebar" aria-label="ניווט ראשי">

      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl"
          style={{
            border: "1px solid rgba(210,168,90,0.22)",
            boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
          }}
        >
          <Image
            src="/icon.png"
            alt="gotspoil logo"
            fill
            sizes="44px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              lineHeight: 1,
              color: "rgba(225,190,110,0.96)",
              textShadow: "0 1px 14px rgba(200,158,82,0.28)",
            }}
          >
            gotspoil
          </p>
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.56rem",
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(210,168,90,0.45)",
              marginTop: "3px",
            }}
          >
            מלווה צפייה
          </p>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div
        className="mx-2 mb-6"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(210,168,90,0.25) 40%, rgba(210,168,90,0.25) 60%, transparent)",
        }}
      />

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isCharactersTab = item.href === "/characters";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("desktop-nav-item relative", isActive && "is-active")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="h-[17px] w-[17px] shrink-0"
                strokeWidth={isActive ? 2.2 : 1.7}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {isCharactersTab && deadCount > 0 && (
                <div
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0 ml-1"
                  style={{ background: "rgba(210, 68, 78, 0.95)" }}
                  title={`${deadCount} דמות מתה`}
                >
                  {deadCount}
                </div>
              )}
              <span
                style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.5rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: isActive ? "rgba(210,168,90,0.55)" : "rgba(160,150,130,0.30)",
                }}
              >
                {item.labelEn}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── About link ──────────────────────────────────────────────────── */}
      <div className="mt-auto pt-6 pb-6">
        <Link
          href="/about"
          className={cn(
            "desktop-nav-item text-xs",
            pathname === "/about" && "is-active"
          )}
          aria-current={pathname === "/about" ? "page" : undefined}
        >
          <Info className="h-[16px] w-[16px] shrink-0" strokeWidth={1.7} aria-hidden="true" />
          <span className="flex-1">אודות</span>
        </Link>
      </div>

      {/* ── Episode badge ───────────────────────────────────────────────── */}
      <div className="pt-0">
        <div
          className="mx-2 mb-3"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(210,168,90,0.18) 50%, transparent)",
          }}
        />
        <div className="px-2">
          <p
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.5rem",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(210,168,90,0.45)",
              marginBottom: "6px",
            }}
          >
            פרק נוכחי
          </p>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5"
            style={{
              background: "rgba(210,168,90,0.08)",
              border: "1px solid rgba(210,168,90,0.18)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(225,190,110,0.88)",
              }}
            >
              {currentEpisode.code}
            </span>
            <span
              className="flex-1 truncate text-right"
              style={{
                fontSize: "0.68rem",
                color: "rgba(190,175,148,0.70)",
                lineHeight: 1.3,
              }}
            >
              {currentEpisode.title}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
