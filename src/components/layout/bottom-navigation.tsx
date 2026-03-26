"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Castle, Home, Map, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/",          label: "בית",    icon: Home },
  { href: "/characters",label: "דמויות", icon: UsersRound },
  { href: "/map",       label: "מפה",    icon: Map },
  { href: "/politics",  label: "פוליטיקה",icon: Castle },
  { href: "/summary",   label: "תקציר",  icon: BookText },
] as const;

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <nav
        className="pointer-events-auto w-full max-w-[430px] rounded-[30px] border border-white/[0.08] p-2 backdrop-blur-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(22,17,13,0.92), rgba(12,9,7,0.95))",
          boxShadow: "0 28px 90px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,245,215,0.05)",
        }}
      >
        <ul className="grid grid-cols-5 gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-[22px] text-[0.68rem] font-medium transition-all duration-200",
                    isActive
                      ? "text-amber-200"
                      : "text-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(160deg, rgba(203,165,92,0.14), rgba(130,90,42,0.08))",
                          boxShadow: "0 0 0 1px rgba(203,165,92,0.14) inset, 0 6px 20px rgba(203,165,92,0.08)",
                        }
                      : undefined
                  }
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 top-1 h-px rounded-full"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(203,165,92,0.55), transparent)",
                      }}
                    />
                  )}
                  <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.0 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
