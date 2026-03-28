"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Castle, Home, Map, UsersRound, Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEpisode } from "@/providers/episode-provider";
import { characters, episodeIndex } from "@/data/seed";
import { getDeadCharacterCount } from "@/lib/timeline";

const navigationItems = [
  { href: "/",          label: "בית",     icon: Home      },
  { href: "/characters",label: "דמויות",  icon: UsersRound},
  { href: "/map",       label: "מפה",     icon: Map       },
  { href: "/quiz",      label: "חידון",   icon: Brain     },
  { href: "/politics",  label: "פוליטיקה",icon: Castle    },
  { href: "/summary",   label: "תקציר",   icon: BookText  },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();
  const { currentEpisodeId } = useEpisode();
  const deadCount = getDeadCharacterCount(characters, currentEpisodeId, episodeIndex);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <nav
        className="bottom-nav-bar pointer-events-auto w-full max-w-[580px] p-1.5"
        aria-label="ניווט ראשי"
      >
        <ul className="grid grid-cols-6 gap-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isCharactersTab = item.href === "/characters";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "bottom-nav-item",
                    isActive && "is-active",
                    "relative",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isActive ? 2.1 : 1.7}
                    aria-hidden="true"
                  />
                  {isCharactersTab && deadCount > 0 && (
                    <div
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white"
                      style={{ background: "rgba(210, 68, 78, 0.95)" }}
                      title={`${deadCount} דמות מתה`}
                    >
                      {deadCount}
                    </div>
                  )}
                  <span style={{ fontSize: "0.63rem" }}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
